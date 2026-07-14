"""Transactional email over the customer's own mail domain (SMTP).

Only *sending* is needed, so the mailbox's POP3/IMAP side is not used here.
Credentials live in the environment (``SMTP_*`` settings) and are never
committed; see ``backend/.env.example``.

A mail failure must never break the request that triggered it — the password
reset flow deliberately answers the same way whether or not mail went out, so
the endpoint cannot be used to probe which addresses are registered.
"""

import asyncio
import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_sync(message: EmailMessage) -> None:
    """Blocking SMTP send. Runs in a worker thread (see ``send_email``)."""
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


async def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain-text email.

    Returns True when the message was handed to the SMTP server. Returns False
    when mail is not configured or the send failed — callers must not surface
    either case to the user.
    """
    if not settings.mail_enabled:
        logger.warning("SMTP is not configured; no mail sent to %s", to)
        return False

    message = EmailMessage()
    message["From"] = settings.SMTP_FROM or settings.SMTP_USER
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    try:
        # smtplib is blocking; keep the event loop free.
        await asyncio.to_thread(_send_sync, message)
        return True
    except Exception:  # noqa: BLE001 - a mail failure must not break the request
        logger.exception("Failed to send mail to %s", to)
        return False
