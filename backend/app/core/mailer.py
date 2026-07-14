"""Transactional email for the password reset (US-27).

Two transports, chosen with ``MAIL_TRANSPORT``:

``smtp``
    Talk to the mail server directly. Used locally.

``brevo``
    Hand the message to Brevo's HTTPS API (port 443). Used in production,
    because **Railway blocks outbound SMTP** (ports 465/587/2525) on its Free,
    Trial and Hobby plans: the deployed service times out on connect even though
    the very same credentials authenticate fine from a developer machine. Port
    443 is never blocked. The sender is still the customer's own address — it is
    verified in Brevo as a single sender, so no DNS change was needed.

Either way, only *sending* is used, so the mailbox's POP3/IMAP side is not
configured here, and credentials live in the environment and are never committed.

A mail failure must never break the request that triggered it: the caller gets
the same answer whether or not the message went out, so the reset endpoint
cannot be used to probe which addresses are registered.
"""

import asyncio
import json
import logging
import smtplib
import ssl
import urllib.error
import urllib.request
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)

BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email"
_HTTP_TIMEOUT = 15.0


def _send_smtp(to: str, subject: str, body: str) -> None:
    """Blocking SMTP send. Runs in a worker thread (see ``send_email``)."""
    message = EmailMessage()
    message["From"] = settings.mail_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    context = ssl.create_default_context()
    if settings.SMTP_SSL:
        # Implicit TLS: connect straight to the SSL/TLS port (usually 465).
        with smtplib.SMTP_SSL(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            context=context,
            timeout=settings.SMTP_TIMEOUT,
        ) as smtp:
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    else:
        # Explicit TLS: plain connect (usually 587), then upgrade with STARTTLS.
        with smtplib.SMTP(
            settings.SMTP_HOST, settings.SMTP_PORT, timeout=settings.SMTP_TIMEOUT
        ) as smtp:
            smtp.starttls(context=context)
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)


def _send_brevo(to: str, subject: str, body: str) -> None:
    """Blocking HTTPS send via the Brevo API. Runs in a worker thread.

    Uses ``urllib`` rather than adding an HTTP dependency, like the LLM client.
    """
    payload = json.dumps(
        {
            "sender": {"name": settings.MAIL_FROM_NAME, "email": settings.mail_from},
            "to": [{"email": to}],
            "subject": subject,
            "textContent": body,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        BREVO_ENDPOINT,
        data=payload,
        method="POST",
        headers={
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
            "accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=_HTTP_TIMEOUT) as response:
            response.read()
    except urllib.error.HTTPError as exc:
        # Brevo explains a rejection in the body (unverified sender, bad key…).
        detail = exc.read().decode("utf-8", "replace")[:300]
        raise RuntimeError(f"Brevo rejected the message ({exc.code}): {detail}") from exc


async def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain-text email with the configured transport.

    Returns True when the message was accepted by the mail server / API. Returns
    False when mail is not configured or the send failed — callers must not
    surface either case to the user.
    """
    if not settings.mail_enabled:
        logger.warning("Mail is not configured (MAIL_TRANSPORT=%s); nothing sent to %s",
                       settings.MAIL_TRANSPORT, to)
        return False

    send = _send_brevo if settings.MAIL_TRANSPORT.lower() == "brevo" else _send_smtp
    try:
        # Both transports are blocking; keep the event loop free.
        await asyncio.to_thread(send, to, subject, body)
        return True
    except Exception:  # noqa: BLE001 - a mail failure must not break the request
        logger.exception("Failed to send mail to %s via %s", to, settings.MAIL_TRANSPORT)
        return False
