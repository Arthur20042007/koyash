"""Tests for authentication (PBI-401 / US-21).

Covers registration, login, the current-user dependency, validation, and the
guest-first guarantee that /recommend stays usable without an account.

The users collection is backed by a small in-memory fake (the shared conftest
fake only supports .find for the recommendation catalog).
"""

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient


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
def auth_client(monkeypatch, db):
    from app.api import auth
    monkeypatch.setattr(auth, "get_database", lambda: db)
    from app.main import app
    return TestClient(app)


def _register(client, **overrides):
    payload = {"name": "Аня", "email": "anya@mail.com", "password": "password123"}
    payload.update(overrides)
    return client.post("/auth/register", json=payload)


# --------------------------------------------------------------------------
# Registration
# --------------------------------------------------------------------------

def test_register_returns_token_and_user(auth_client, db):
    r = _register(auth_client)
    assert r.status_code == 201
    body = r.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == "anya@mail.com"
    assert body["user"]["id"]
    # The password must never be exposed anywhere in the response.
    assert "password" not in r.text.lower()


def test_register_stores_hashed_password_only(auth_client, db):
    _register(auth_client, password="supersecret")
    stored = db.users.docs[0]
    assert "password_hash" in stored
    assert stored["password_hash"] != "supersecret"
    assert "password" not in stored  # only the hash is stored


def test_register_lowercases_email(auth_client):
    r = _register(auth_client, email="Anya.Test@Mail.COM")
    assert r.status_code == 201
    assert r.json()["user"]["email"] == "anya.test@mail.com"


def test_register_optional_fields(auth_client, db):
    r = _register(auth_client, age=27, phone="+7 900 000-00-00")
    assert r.status_code == 201
    stored = db.users.docs[0]
    assert stored["age"] == 27 and stored["phone"] == "+7 900 000-00-00"


def test_register_without_optional_fields(auth_client, db):
    r = _register(auth_client)
    assert r.status_code == 201
    assert db.users.docs[0]["age"] is None
    assert db.users.docs[0]["phone"] is None


def test_register_duplicate_email_rejected(auth_client):
    assert _register(auth_client).status_code == 201
    r = _register(auth_client)
    assert r.status_code == 409


def test_register_duplicate_email_case_insensitive(auth_client):
    assert _register(auth_client, email="a@mail.com").status_code == 201
    assert _register(auth_client, email="A@MAIL.COM").status_code == 409


@pytest.mark.parametrize("bad", [
    {"password": "short"},          # < 8 chars
    {"age": 5},                     # below 10
    {"age": 200},                   # above 100
    {"email": "not-an-email"},      # no domain dot
    {"name": ""},                   # empty name
])
def test_register_validation_errors(auth_client, bad):
    assert _register(auth_client, **bad).status_code == 422


# --------------------------------------------------------------------------
# Login
# --------------------------------------------------------------------------

def test_login_success(auth_client):
    _register(auth_client)
    r = auth_client.post("/auth/login", json={"email": "anya@mail.com", "password": "password123"})
    assert r.status_code == 200
    assert r.json()["access_token"]


def test_login_wrong_password(auth_client):
    _register(auth_client)
    r = auth_client.post("/auth/login", json={"email": "anya@mail.com", "password": "wrongpass1"})
    assert r.status_code == 401


def test_login_unknown_email(auth_client):
    r = auth_client.post("/auth/login", json={"email": "nobody@mail.com", "password": "password123"})
    assert r.status_code == 401


def test_login_email_case_insensitive(auth_client):
    _register(auth_client, email="anya@mail.com")
    r = auth_client.post("/auth/login", json={"email": "ANYA@MAIL.COM", "password": "password123"})
    assert r.status_code == 200


# --------------------------------------------------------------------------
# Current-user (protected route)
# --------------------------------------------------------------------------

def test_me_requires_token(auth_client):
    assert auth_client.get("/auth/me").status_code == 401


def test_me_rejects_invalid_token(auth_client):
    r = auth_client.get("/auth/me", headers={"Authorization": "Bearer not.a.jwt"})
    assert r.status_code == 401


def test_me_with_valid_token(auth_client):
    token = _register(auth_client).json()["access_token"]
    r = auth_client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "anya@mail.com"


def test_login_token_authorizes_me(auth_client):
    _register(auth_client)
    token = auth_client.post(
        "/auth/login", json={"email": "anya@mail.com", "password": "password123"}
    ).json()["access_token"]
    r = auth_client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200


# --------------------------------------------------------------------------
# Guest-first: /recommend stays usable without an account
# --------------------------------------------------------------------------

def test_guest_can_recommend_without_account(client):
    """`client` (from conftest) is the catalog-backed recommend client; a guest
    calls /recommend with no Authorization header and still gets a bag."""
    r = client.post("/recommend", json={"budget": "low", "concerns": ["acne"]})
    assert r.status_code == 200
    assert r.json()["bag"]
