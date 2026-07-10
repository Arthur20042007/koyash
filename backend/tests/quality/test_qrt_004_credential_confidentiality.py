"""QRT-004: Credential confidentiality (verifies QR-004).

No auth endpoint response may contain a password or password hash, and the
stored user record must keep the password only as a bcrypt hash. Uses an
in-memory users collection so the test is deterministic and needs no database.
"""

import bcrypt
import pytest
from bson import ObjectId
from fastapi.testclient import TestClient

pytestmark = pytest.mark.qrt

_PASSWORD = "sup3rsecret-pw"


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

        class _R:
            inserted_id = stored["_id"]

        return _R()

    async def create_index(self, *args, **kwargs):
        return "email_1"


class _FakeDB:
    def __init__(self) -> None:
        self.users = _FakeUsers()

    def __getitem__(self, name):
        return self.users


@pytest.fixture
def db():
    return _FakeDB()


@pytest.fixture
def client(monkeypatch, db):
    from app.api import auth
    monkeypatch.setattr(auth, "get_database", lambda: db)
    from app.main import app
    return TestClient(app)


def _walk(obj) -> None:
    """Assert no key names a credential and no value leaks the password or a
    bcrypt hash. Walks the parsed JSON rather than scanning raw text, so the
    opaque JWT string can't cause false positives."""
    if isinstance(obj, dict):
        for key, value in obj.items():
            lowered = key.lower()
            assert "password" not in lowered and "hash" not in lowered, f"leaky key: {key}"
            _walk(value)
    elif isinstance(obj, list):
        for value in obj:
            _walk(value)
    elif isinstance(obj, str):
        assert obj != _PASSWORD, "plaintext password leaked"
        assert not obj.startswith("$2"), "bcrypt hash leaked"


def _assert_no_secret(response) -> None:
    assert _PASSWORD not in response.text  # plaintext never appears anywhere
    _walk(response.json())


def test_qrt_004_credentials_never_leak_and_are_hashed(client, db):
    reg = client.post(
        "/auth/register",
        json={"name": "Аня", "email": "q4@mail.com", "password": _PASSWORD},
    )
    assert reg.status_code == 201
    _assert_no_secret(reg)
    token = reg.json()["access_token"]

    login = client.post("/auth/login", json={"email": "q4@mail.com", "password": _PASSWORD})
    assert login.status_code == 200
    _assert_no_secret(login)

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    _assert_no_secret(me)

    # The stored record keeps only a bcrypt hash, never the plaintext.
    stored = db.users.docs[0]
    assert stored["password_hash"] != _PASSWORD
    assert bcrypt.checkpw(_PASSWORD.encode(), stored["password_hash"].encode())
