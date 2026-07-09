"""Tests for account persistence (PBI-403 profile + PBI-404 single saved bag).

An authenticated /recommend saves the profile snapshot and overwrites the one
saved bag; a guest triggers no persistence. Uses a small multi-collection fake
(products + users + care) so the whole flow runs without a live Mongo.
"""

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient


def _p(**kw):
    base = {
        "vegan": False, "cruelty_free": "unknown", "order_index": None,
        "concerns_addressed": [], "allergens_norm": [], "link": "https://example.test/p",
        "image_url": None, "main_actives_short": [], "functional_category": "",
        "skintype": ["any"],
    }
    base.update(kw)
    return base


CATALOG = [
    _p(_id="P-CL", name="Gel", brand="A", price_rub=400, segment="low",
       routine_step="cleanse", tier="core", order_index=1, concerns_addressed=["acne"]),
    _p(_id="P-TO", name="Toner", brand="A", price_rub=350, segment="low",
       routine_step="tone", tier="core", order_index=2),
    _p(_id="P-SE", name="Serum", brand="A", price_rub=600, segment="low",
       routine_step="serum", tier="core", order_index=3, concerns_addressed=["acne"]),
    _p(_id="P-MO", name="Cream", brand="A", price_rub=500, segment="low",
       routine_step="moisturize", tier="core", order_index=4),
    _p(_id="P-SP", name="SPF", brand="A", price_rub=700, segment="low",
       routine_step="spf", tier="core", order_index=5),
]


class _Cursor:
    def __init__(self, docs):
        self._docs = docs

    def __aiter__(self):
        self._it = iter(self._docs)
        return self

    async def __anext__(self):
        try:
            return next(self._it)
        except StopIteration:
            raise StopAsyncIteration


class _Coll:
    def __init__(self, docs=None):
        self.docs = docs or []

    def _match(self, d, query):
        return all(d.get(k) == v for k, v in query.items())

    def find(self, query=None, **kwargs):
        query = query or {}
        return _Cursor([dict(d) for d in self.docs if self._match(d, query)])

    async def find_one(self, query):
        for d in self.docs:
            if self._match(d, query):
                return dict(d)
        return None

    async def insert_one(self, doc):
        stored = dict(doc)
        stored.setdefault("_id", ObjectId())
        self.docs.append(stored)

        class _R:
            inserted_id = stored["_id"]

        return _R()

    async def update_one(self, flt, update, upsert=False):
        for d in self.docs:
            if self._match(d, flt):
                d.update(update.get("$set", {}))
                return
        if upsert:
            nd = dict(flt)
            nd.update(update.get("$set", {}))
            self.docs.append(nd)

    async def replace_one(self, flt, doc, upsert=False):
        for i, d in enumerate(self.docs):
            if self._match(d, flt):
                self.docs[i] = dict(doc)
                return
        if upsert:
            self.docs.append(dict(doc))

    async def create_index(self, *args, **kwargs):
        return "idx"


class _MultiDB:
    def __init__(self):
        self.collections = {
            "products": _Coll([dict(d) for d in CATALOG]),
            "users": _Coll(),
            "care": _Coll(),
        }

    def __getitem__(self, name):
        return self.collections.setdefault(name, _Coll())


@pytest.fixture
def db():
    return _MultiDB()


@pytest.fixture
def app_client(monkeypatch, db):
    # The endpoints resolve the DB through their own module reference, so patch
    # each one to share the same in-memory database.
    from app.api import account, auth, recommend
    for mod in (auth, account, recommend):
        monkeypatch.setattr(mod, "get_database", lambda: db)
    from app.main import app
    return TestClient(app)


def _register(client, email="anya@mail.com"):
    r = client.post(
        "/auth/register",
        json={"name": "Аня", "email": email, "password": "password123"},
    )
    assert r.status_code == 201
    return r.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# --------------------------------------------------------------------------

def test_authenticated_recommend_saves_bag_and_profile(app_client, db):
    token = _register(app_client)
    r = app_client.post(
        "/recommend",
        json={"budget": "low", "concerns": ["acne"], "skin_type": "oily", "age": 27},
        headers=_auth(token),
    )
    assert r.status_code == 200
    assert r.json()["bag"]
    # one saved bag for the user
    assert len(db.collections["care"].docs) == 1
    # profile snapshot + age stored on the user
    user = db.collections["users"].docs[0]
    assert user["profile"]["skin_type"] == "oily"
    assert user["profile"]["concerns"] == ["acne"]
    assert user["age"] == 27


def test_get_profile_returns_snapshot(app_client):
    token = _register(app_client)
    app_client.post(
        "/recommend",
        json={"budget": "low", "concerns": ["acne"], "skin_type": "dry", "age": 30},
        headers=_auth(token),
    )
    r = app_client.get("/profile", headers=_auth(token))
    assert r.status_code == 200
    body = r.json()
    assert body["skin_type"] == "dry"
    assert body["age"] == 30
    assert body["budget"] == "low"


def test_get_care_returns_saved_bag(app_client):
    token = _register(app_client)
    rec = app_client.post(
        "/recommend", json={"budget": "low", "concerns": ["acne"]}, headers=_auth(token)
    ).json()
    r = app_client.get("/care", headers=_auth(token))
    assert r.status_code == 200
    body = r.json()
    assert len(body["items"]) == len(rec["bag"])
    assert body["total_price_rub"] == rec["meta"]["total_price_rub"]
    assert all(it["status"] == "active" and it["feedback"] is None for it in body["items"])


def test_profile_and_care_404_before_questionnaire(app_client):
    token = _register(app_client)
    assert app_client.get("/profile", headers=_auth(token)).status_code == 404
    assert app_client.get("/care", headers=_auth(token)).status_code == 404


def test_profile_and_care_require_auth(app_client):
    assert app_client.get("/profile").status_code == 401
    assert app_client.get("/care").status_code == 401


def test_guest_recommend_saves_nothing(app_client, db):
    r = app_client.post("/recommend", json={"budget": "low", "concerns": ["acne"]})
    assert r.status_code == 200
    assert db.collections["care"].docs == []
    assert db.collections["users"].docs == []


def test_retaking_questionnaire_overwrites_bag(app_client, db):
    token = _register(app_client)
    app_client.post(
        "/recommend", json={"budget": "low", "concerns": ["acne"]}, headers=_auth(token)
    )
    app_client.post(
        "/recommend",
        json={"budget": "low", "concerns": ["dryness"], "skin_type": "dry"},
        headers=_auth(token),
    )
    # still exactly one saved bag, reflecting the latest questionnaire
    assert len(db.collections["care"].docs) == 1
    assert db.collections["care"].docs[0]["request"]["concerns"] == ["dryness"]
    assert db.collections["users"].docs[0]["profile"]["skin_type"] == "dry"


def test_expired_or_invalid_token_falls_back_to_guest(app_client, db):
    # A bad token on the guest-first /recommend must not 401; it just does not persist.
    r = app_client.post(
        "/recommend",
        json={"budget": "low", "concerns": ["acne"]},
        headers={"Authorization": "Bearer not.a.jwt"},
    )
    assert r.status_code == 200
    assert db.collections["care"].docs == []
