"""Tests for the mail transports (PBI-513).

Production sends over Brevo's HTTPS API because Railway blocks outbound SMTP on
its Free/Trial/Hobby plans; SMTP stays available for local development. These
tests pin the behaviour that matters:

  * the configured transport is the one that gets used;
  * an unconfigured mailer reports failure instead of raising;
  * a transport failure is swallowed and reported as False, never raised — the
    reset endpoint must answer the same way whether or not the mail went out.

No network is touched: the blocking senders are monkeypatched. (The suite has no
async plugin, so the coroutine is driven with ``asyncio.run``.)
"""

import asyncio

import pytest

from app.core import mailer
from app.core.config import settings


def _send(to="user@mail.test", subject="Тема", body="Текст"):
    return asyncio.run(mailer.send_email(to, subject, body))


@pytest.fixture
def mail_settings(monkeypatch):
    """Configure both transports, so `mail_enabled` is True for either choice."""
    monkeypatch.setattr(settings, "BREVO_API_KEY", "test-key")
    monkeypatch.setattr(settings, "MAIL_FROM", "noreply@koyash.test")
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.koyash.test")
    monkeypatch.setattr(settings, "SMTP_USER", "noreply@koyash.test")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "secret")


@pytest.fixture
def spies(monkeypatch):
    """Replace both blocking senders and record which one ran."""
    calls: list[str] = []
    monkeypatch.setattr(mailer, "_send_brevo", lambda *a: calls.append("brevo"))
    monkeypatch.setattr(mailer, "_send_smtp", lambda *a: calls.append("smtp"))
    return calls


def test_brevo_transport_is_used_when_selected(monkeypatch, mail_settings, spies):
    monkeypatch.setattr(settings, "MAIL_TRANSPORT", "brevo")

    assert _send() is True
    assert spies == ["brevo"]


def test_smtp_transport_is_used_when_selected(monkeypatch, mail_settings, spies):
    monkeypatch.setattr(settings, "MAIL_TRANSPORT", "smtp")

    assert _send() is True
    assert spies == ["smtp"]


def test_unconfigured_mailer_reports_failure_without_raising(monkeypatch):
    monkeypatch.setattr(settings, "MAIL_TRANSPORT", "brevo")
    monkeypatch.setattr(settings, "BREVO_API_KEY", "")
    monkeypatch.setattr(settings, "MAIL_FROM", "")
    monkeypatch.setattr(settings, "SMTP_FROM", "")
    monkeypatch.setattr(settings, "SMTP_USER", "")

    assert _send() is False


def test_transport_failure_is_swallowed(monkeypatch, mail_settings):
    """A dead mail server is reported as False, never raised at the caller."""
    monkeypatch.setattr(settings, "MAIL_TRANSPORT", "brevo")

    def _boom(*_args):
        raise RuntimeError("Brevo rejected the message (401): unauthorised")

    monkeypatch.setattr(mailer, "_send_brevo", _boom)

    assert _send() is False


def test_sender_falls_back_to_the_smtp_address(monkeypatch):
    """MAIL_FROM is optional: the existing SMTP_FROM/SMTP_USER still work."""
    monkeypatch.setattr(settings, "MAIL_FROM", "")
    monkeypatch.setattr(settings, "SMTP_FROM", "noreply@domain.test")

    assert settings.mail_from == "noreply@domain.test"
