"""Tests for the mailer (PBI-513).

The reset mail is sent through the Resend HTTPS API and, crucially, from a
**background task**, so a slow or unreachable API call never breaks or delays
the request. These tests pin the behaviour that must hold regardless of
Resend's availability:

  * an unconfigured mailer reports failure instead of raising;
  * a send failure is swallowed and reported as False, never raised — the reset
    endpoint must answer the same way whether or not the mail went out;
  * a successful send is reported as True.

No network is touched: the blocking Resend sender is monkeypatched. (The suite
has no async plugin, so the coroutine is driven with ``asyncio.run``.)
"""

import asyncio
import io
import urllib.error

import pytest

from app.core import mailer
from app.core.config import settings


def _send(to="user@mail.test", subject="Тема", body="Текст"):
    return asyncio.run(mailer.send_email(to, subject, body))


@pytest.fixture
def mail_settings(monkeypatch):
    """Configure Resend so `mail_enabled` is True."""
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key")
    monkeypatch.setattr(settings, "MAIL_FROM", "noreply@koyash.test")


def test_successful_send_is_reported(monkeypatch, mail_settings):
    sent = []
    monkeypatch.setattr(mailer, "_send_resend", lambda *a: sent.append(a))

    assert _send() is True
    assert len(sent) == 1


def test_unconfigured_mailer_reports_failure_without_raising(monkeypatch):
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")
    monkeypatch.setattr(settings, "MAIL_FROM", "")

    assert _send() is False


def test_send_failure_is_swallowed(monkeypatch, mail_settings):
    """An unreachable/erroring API call is reported as False, never raised at the caller."""

    def _boom(*_args):
        raise TimeoutError("timed out")

    monkeypatch.setattr(mailer, "_send_resend", _boom)

    assert _send() is False


def test_resend_rejection_is_logged_with_its_body(monkeypatch, mail_settings, caplog):
    """A 4xx/5xx from Resend (e.g. unverified domain, restricted key) is still
    swallowed as far as the caller sees, but its response body — which is what
    actually says *why* — must land in the log, since this is the only place
    that failure is ever surfaced."""

    def _reject(*_args):
        raise urllib.error.HTTPError(
            mailer.RESEND_API_URL,
            403,
            "Forbidden",
            hdrs=None,
            fp=io.BytesIO(b'{"name":"validation_error","message":"The domain is not verified"}'),
        )

    monkeypatch.setattr(mailer, "_send_resend", _reject)

    with caplog.at_level("ERROR"):
        assert _send() is False

    assert "403" in caplog.text
    assert "domain is not verified" in caplog.text
