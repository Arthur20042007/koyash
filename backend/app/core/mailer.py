"""Transactional email for the password reset (US-27).

Mail is sent through Resend's HTTPS API rather than raw SMTP. Railway blocks
outbound SMTP (ports 25/465/587) on its Free/Hobby plans, so a smtplib-based
sender can never actually deliver once deployed there — see
https://railway.com/deploy/resend-email-railway. Resend's API is a plain HTTPS
POST on port 443, the same port normal web traffic uses, so it isn't blocked.

Only stdlib is used (``urllib.request``) so this needs no extra dependency.

The message is handed to a background task by the caller (see the
``/auth/forgot-password`` endpoint), so a slow or unreachable API call never
makes the user wait — and never makes a request for a *registered* address take
measurably longer than one for an unknown address, which would leak who is
registered. A mail failure must likewise never break the request: this module
reports failure with a return value and never raises to the caller.
"""

import asyncio
import json
import logging
import urllib.error
import urllib.request

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


def _send_resend(to: str, subject: str, body: str) -> None:
    """Blocking HTTPS call to the Resend API. Runs in a worker thread (see ``send_email``)."""
    payload = json.dumps(
        {
            "from": settings.mail_from,
            "to": [to],
            "subject": subject,
            "text": body,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        RESEND_API_URL,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
            # Resend sits behind Cloudflare, which blocks the bare
            # "Python-urllib/x.y" default User-Agent as a known bot/scanner
            # signature (Cloudflare error 1010) before the request ever
            # reaches Resend. Any identifiable, non-default User-Agent avoids
            # that block.
            "User-Agent": "koyash-backend/1.0 (+https://koyash.online)",
        },
    )
    # urlopen raises urllib.error.HTTPError itself on a 4xx/5xx response, so a
    # non-2xx status is already surfaced as an exception to the caller.
    with urllib.request.urlopen(request, timeout=settings.MAIL_TIMEOUT):
        pass


async def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain-text email.

    Returns True when the message was accepted by Resend. Returns False when
    mail is not configured or the send failed — callers must not surface
    either case to the user.
    """
    if not settings.mail_enabled:
        logger.warning("Resend is not configured; nothing sent to %s", to)
        return False

    try:
        # urllib is blocking; keep the event loop free.
        await asyncio.to_thread(_send_resend, to, subject, body)
        return True
    except urllib.error.HTTPError as exc:
        # Resend's error body (JSON with "name"/"message") says exactly why the
        # request was rejected — e.g. an unverified domain or a restricted API
        # key — which the bare HTTPError repr does not. Surfacing it here (not
        # to the caller, only to the log) is what makes misconfiguration
        # diagnosable at all, since this endpoint never reports failure to the
        # user by design.
        detail = exc.read().decode("utf-8", errors="replace")
        logger.error("Resend rejected the mail to %s: HTTP %s %s", to, exc.code, detail)
        return False
    except Exception:  # noqa: BLE001 - a mail failure must not break the request
        logger.exception("Failed to send mail to %s", to)
        return False
