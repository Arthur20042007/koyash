"""Tests for the password-reset flow (PBI-503 / US-27).

Covers the two endpoints end to end: `/auth/forgot-password` issues a
single-use, time-limited link, and `/auth/reset-password` consumes it. The
security-relevant guarantees are the point of these tests:

  * no user enumeration - a known and an unknown address answer identically;
  * only a digest of the token is stored, never the token itself;
  * the link expires, and it works exactly once;
  * a mail failure never changes what the caller sees.

The Resend API is never touched: `send_email` is monkeypatched and the sent
messages are captured, so the suite still runs without network access (as CI
does).
"""

from datetime import datetime, timedelta, timezone

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient

from app.core.security import hash_reset_token, verify_password


class _FakeUsers:
    def __init__(self) -> None:
        self.docs: list[dict] = []

    async def find_one(self, query):
        for d in self.docs:
            if all(d.get(k) == v for k, v in query.items()):
                return dict(d)
        return None

    async def insert_one(self, doc):
        stored = dict(doc)
        stored["_id"] = ObjectId()
        self.docs.append(stored)

        class _Result:
            inserted_id = stored["_id"]

        return _Result()

    async def update_one(self, query, update):
        for d in self.docs:
            if all(d.get(k) == v for k, v in query.items()):
                d.update(update.get("$set", {}))
                for key in update.get("$unset", {}):
                    d.pop(key, None)
                return
        raise AssertionError(f"no user matched {query}")

    async def create_index(self, *args, **kwargs):
        return "email_1"


class _FakeDB:
    def __init__(self) -> None:
        self.users = _FakeUsers()

    def __getitem__(self, name):
        assert name == "users"
        return self.users


@pytest.fixture
def db():
    return _FakeDB()


@pytest.fixture
def sent():
    """Captured outbound mail: list of (to, subject, body)."""
    return []


@pytest.fixture
def client(monkeypatch, db, sent):
    from app.api import auth

    async def _fake_send_email(to, subject, body):
        sent.append((to, subject, body))
        return True

    monkeypatch.setattr(auth, "get_database", lambda: db)
    monkeypatch.setattr(auth, "send_email", _fake_send_email)
    from app.main import app

    return TestClient(app)


def _register(client, email="anya@mail.com", password="password123"):
    return client.post(
        "/auth/register", json={"name": "Аня", "email": email, "password": password}
    )


def _link_token(body: str) -> str:
    """Pull the raw token out of the reset link in the email body."""
    marker = "token="
    start = body.index(marker) + len(marker)
    return body[start:].split()[0]


# --------------------------------------------------------------------------
# forgot-password
# --------------------------------------------------------------------------

def test_forgot_password_emails_a_link_to_a_known_address(client, db, sent):
    _register(client)
    r = client.post("/auth/forgot-password", json={"email": "anya@mail.com"})

    assert r.status_code == 202
    assert len(sent) == 1
    to, subject, body = sent[0]
    assert to == "anya@mail.com"
    assert "/reset-password?token=" in body
    assert _link_token(body)


def test_forgot_password_does_not_reveal_whether_the_email_exists(client, db, sent):
    _register(client)
    known = client.post("/auth/forgot-password", json={"email": "anya@mail.com"})
    unknown = client.post("/auth/forgot-password", json={"email": "nobody@mail.com"})

    # Identical status and body: the endpoint cannot be used to enumerate users.
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()
    # ...and no mail is sent for an address that has no account.
    assert [to for to, _, _ in sent] == ["anya@mail.com"]


def test_only_a_digest_of_the_token_is_stored(client, db, sent):
    _register(client)
    client.post("/auth/forgot-password", json={"email": "anya@mail.com"})
    raw = _link_token(sent[0][2])

    stored = db.users.docs[0]
    assert stored["reset_token_hash"] == hash_reset_token(raw)
    assert raw not in str(stored)  # the usable token itself is never persisted


def test_mail_failure_is_not_surfaced(monkeypatch, db):
    """A dead mail server must not leak through the API response."""
    from app.api import auth

    async def _failing_send_email(to, subject, body):
        return False

    monkeypatch.setattr(auth, "get_database", lambda: db)
    monkeypatch.setattr(auth, "send_email", _failing_send_email)
    from app.main import app

    c = TestClient(app)
    _register(c)
    r = c.post("/auth/forgot-password", json={"email": "anya@mail.com"})
    assert r.status_code == 202


# --------------------------------------------------------------------------
# reset-password
# --------------------------------------------------------------------------

def test_reset_password_sets_the_new_password(client, db, sent):
    _register(client, password="oldpassword1")
    client.post("/auth/forgot-password", json={"email": "anya@mail.com"})
    raw = _link_token(sent[0][2])

    r = client.post(
        "/auth/reset-password", json={"token": raw, "new_password": "brandnewpass1"}
    )
    assert r.status_code == 200

    stored = db.users.docs[0]
    assert verify_password("brandnewpass1", stored["password_hash"])
    assert not verify_password("oldpassword1", stored["password_hash"])

    # The new password actually works for signing in.
    login = client.post(
        "/auth/login", json={"email": "anya@mail.com", "password": "brandnewpass1"}
    )
    assert login.status_code == 200


def test_reset_link_works_only_once(client, db, sent):
    _register(client)
    client.post("/auth/forgot-password", json={"email": "anya@mail.com"})
    raw = _link_token(sent[0][2])

    first = client.post(
        "/auth/reset-password", json={"token": raw, "new_password": "brandnewpass1"}
    )
    second = client.post(
        "/auth/reset-password", json={"token": raw, "new_password": "another_pass1"}
    )

    assert first.status_code == 200
    assert second.status_code == 400
    # The second attempt did not change anything.
    assert verify_password("brandnewpass1", db.users.docs[0]["password_hash"])


def test_expired_reset_link_is_rejected(client, db, sent):
    _register(client, password="oldpassword1")
    client.post("/auth/forgot-password", json={"email": "anya@mail.com"})
    raw = _link_token(sent[0][2])

    # Backdate the expiry as if the link had been sitting in the inbox too long.
    db.users.docs[0]["reset_expires_at"] = datetime.now(timezone.utc) - timedelta(minutes=1)

    r = client.post(
        "/auth/reset-password", json={"token": raw, "new_password": "brandnewpass1"}
    )
    assert r.status_code == 400
    assert verify_password("oldpassword1", db.users.docs[0]["password_hash"])


def test_unknown_token_is_rejected(client, db):
    _register(client)
    r = client.post(
        "/auth/reset-password",
        json={"token": "n0t-a-real-token-value", "new_password": "brandnewpass1"},
    )
    assert r.status_code == 400


def test_reset_password_enforces_the_minimum_length(client, db, sent):
    _register(client)
    client.post("/auth/forgot-password", json={"email": "anya@mail.com"})
    raw = _link_token(sent[0][2])

    r = client.post("/auth/reset-password", json={"token": raw, "new_password": "short"})
    assert r.status_code == 422


def test_changing_the_password_while_signed_in_kills_a_pending_reset_link(
    monkeypatch, client, db, sent
):
    """An outstanding "forgot password" email must not be replayable."""
    from app.api import account_security

    monkeypatch.setattr(account_security, "get_database", lambda: db)

    token = _register(client, password="oldpassword1").json()["access_token"]
    client.post("/auth/forgot-password", json={"email": "anya@mail.com"})
    raw = _link_token(sent[0][2])

    changed = client.put(
        "/account/password",
        json={"current_password": "oldpassword1", "new_password": "chosenbyuser1"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert changed.status_code in (200, 204)

    replay = client.post(
        "/auth/reset-password", json={"token": raw, "new_password": "attackerpass1"}
    )
    assert replay.status_code == 400
    assert verify_password("chosenbyuser1", db.users.docs[0]["password_hash"])
