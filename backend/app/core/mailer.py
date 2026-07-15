"""Transactional email for the password reset (US-27).

Mail is sent over SMTP to the project's own mail domain. Only *sending* is used,
so the mailbox's POP3/IMAP side is not configured here, and credentials live in
the environment and are never committed.

The message is handed to a background task by the caller (see the
``/auth/forgot-password`` endpoint), so a slow or unreachable mail server never
makes the user wait — and never makes a request for a *registered* address take
measurably longer than one for an unknown address, which would leak who is
registered. A mail failure must likewise never break the request: this module
reports failure with a return value and never raises to the caller.
"""

import asyncio
import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


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


async def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain-text email.

    Returns True when the message was accepted by the mail server. Returns False
    when mail is not configured or the send failed — callers must not surface
    either case to the user.
    """
    if not settings.mail_enabled:
        logger.warning("SMTP is not configured; nothing sent to %s", to)
        return False

    try:
        # smtplib is blocking; keep the event loop free.
        await asyncio.to_thread(_send_smtp, to, subject, body)
        return True
    except Exception:  # noqa: BLE001 - a mail failure must not break the request
        logger.exception("Failed to send mail to %s", to)
        return False
