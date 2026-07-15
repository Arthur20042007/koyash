"""Tests for the mailer (PBI-513).

The reset mail is sent over SMTP and, crucially, from a **background task**, so a
slow or unreachable mail server never breaks or delays the request. These tests
pin the behaviour that must hold regardless of the mail server:

  * an unconfigured mailer reports failure instead of raising;
  * a send failure is swallowed and reported as False, never raised — the reset
    endpoint must answer the same way whether or not the mail went out;
  * a successful send is reported as True.

No network is touched: the blocking SMTP sender is monkeypatched. (The suite has
no async plugin, so the coroutine is driven with ``asyncio.run``.)
"""

import asyncio

import pytest

from app.core import mailer
from app.core.config import settings


def _send(to="user@mail.test", subject="Тема", body="Текст"):
    return asyncio.run(mailer.send_email(to, subject, body))


@pytest.fixture
def mail_settings(monkeypatch):
    """Configure SMTP so `mail_enabled` is True."""
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.koyash.test")
    monkeypatch.setattr(settings, "SMTP_USER", "noreply@koyash.test")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "secret")


def test_successful_send_is_reported(monkeypatch, mail_settings):
    sent = []
    monkeypatch.setattr(mailer, "_send_smtp", lambda *a: sent.append(a))

    assert _send() is True
    assert len(sent) == 1


def test_unconfigured_mailer_reports_failure_without_raising(monkeypatch):
    monkeypatch.setattr(settings, "SMTP_HOST", "")
    monkeypatch.setattr(settings, "SMTP_USER", "")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "")

    assert _send() is False


def test_send_failure_is_swallowed(monkeypatch, mail_settings):
    """A dead mail server is reported as False, never raised at the caller."""

    def _boom(*_args):
        raise TimeoutError("timed out")

    monkeypatch.setattr(mailer, "_send_smtp", _boom)

    assert _send() is False


def test_sender_falls_back_to_the_smtp_address(monkeypatch):
    """MAIL_FROM is optional: the existing SMTP_FROM / SMTP_USER still work."""
    monkeypatch.setattr(settings, "MAIL_FROM", "")
    monkeypatch.setattr(settings, "SMTP_FROM", "noreply@domain.test")

    assert settings.mail_from == "noreply@domain.test"
