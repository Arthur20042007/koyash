"""Tests for account persistence (PBI-403 profile + PBI-404 single saved bag).

An authenticated /recommend saves the profile snapshot and overwrites the one
saved bag; a guest triggers no persistence. Uses a small multi-collection fake
(products + users + care) so the whole flow runs without a live Mongo.
"""

from datetime import datetime, timedelta, timezone

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
    # extra serums so a serum has replacement alternatives (2 per step -> up to 2 swaps)
    _p(_id="P-SE2", name="Serum2", brand="A", price_rub=650, segment="low",
       routine_step="serum", tier="core", order_index=3, concerns_addressed=["acne"]),
    _p(_id="P-SE3", name="Serum3", brand="A", price_rub=700, segment="low",
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
    from app.api import account, auth, recommend, tracker
    for mod in (auth, account, recommend, tracker):
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


# --------------------------------------------------------------------------
# Feedback (PBI-406)
# --------------------------------------------------------------------------

def _setup_bag(app_client):
    token = _register(app_client)
    bag = app_client.post(
        "/recommend", json={"budget": "low", "concerns": ["acne"]}, headers=_auth(token)
    ).json()["bag"]
    return token, bag[0]["product"]["id"]


def _feedback_of(care_json, product_id):
    item = next(it for it in care_json["items"] if it["product"]["id"] == product_id)
    return item["feedback"], item["comment"]


def test_set_disliked_with_comment(app_client):
    token, pid = _setup_bag(app_client)
    r = app_client.put(
        f"/care/items/{pid}/feedback",
        json={"feedback": "disliked", "comment": "сушит кожу"},
        headers=_auth(token),
    )
    assert r.status_code == 200
    assert _feedback_of(r.json(), pid) == ("disliked", "сушит кожу")


def test_disliked_requires_comment(app_client):
    token, pid = _setup_bag(app_client)
    for body in ({"feedback": "disliked"}, {"feedback": "disliked", "comment": "  "}):
        r = app_client.put(f"/care/items/{pid}/feedback", json=body, headers=_auth(token))
        assert r.status_code == 422


def test_liked_drops_comment(app_client):
    token, pid = _setup_bag(app_client)
    r = app_client.put(
        f"/care/items/{pid}/feedback",
        json={"feedback": "liked", "comment": "ignored"},
        headers=_auth(token),
    )
    assert r.status_code == 200
    assert _feedback_of(r.json(), pid) == ("liked", None)


def test_change_then_clear_feedback(app_client):
    token, pid = _setup_bag(app_client)
    app_client.put(
        f"/care/items/{pid}/feedback",
        json={"feedback": "disliked", "comment": "не то"},
        headers=_auth(token),
    )
    # change to liked
    r = app_client.put(
        f"/care/items/{pid}/feedback", json={"feedback": "liked"}, headers=_auth(token)
    )
    assert _feedback_of(r.json(), pid) == ("liked", None)
    # clear
    r = app_client.delete(f"/care/items/{pid}/feedback", headers=_auth(token))
    assert r.status_code == 200
    assert _feedback_of(r.json(), pid) == (None, None)


def test_feedback_unknown_product_404(app_client):
    token, _ = _setup_bag(app_client)
    r = app_client.put(
        "/care/items/NOPE/feedback",
        json={"feedback": "liked"},
        headers=_auth(token),
    )
    assert r.status_code == 404


def test_feedback_before_questionnaire_404(app_client):
    token = _register(app_client)
    r = app_client.put(
        "/care/items/P-CL/feedback", json={"feedback": "liked"}, headers=_auth(token)
    )
    assert r.status_code == 404


def test_feedback_requires_auth(app_client):
    assert app_client.put("/care/items/P-CL/feedback", json={"feedback": "liked"}).status_code == 401


# --------------------------------------------------------------------------
# Replacement (PBI-414)
# --------------------------------------------------------------------------

def _serum_id(items):
    # works on both the /recommend response (no status) and stored care items
    return next(
        it["product"]["id"]
        for it in items
        if it["product"]["routine_step"] == "serum" and it.get("status", "active") == "active"
    )


def _setup_disliked_serum(app_client):
    token = _register(app_client)
    bag = app_client.post(
        "/recommend", json={"budget": "low", "concerns": ["acne"]}, headers=_auth(token)
    ).json()["bag"]
    pid = _serum_id(bag)
    app_client.put(
        f"/care/items/{pid}/feedback",
        json={"feedback": "disliked", "comment": "не подошло"},
        headers=_auth(token),
    )
    return token, pid


def _alternatives(app_client, token, pid):
    return app_client.get(f"/care/items/{pid}/alternatives", headers=_auth(token)).json()["alternatives"]


def test_alternatives_for_disliked_item(app_client):
    token, pid = _setup_disliked_serum(app_client)
    r = app_client.get(f"/care/items/{pid}/alternatives", headers=_auth(token))
    assert r.status_code == 200
    body = r.json()
    assert body["step"] == "serum"
    assert body["replacements_left"] == 2
    ids = [a["id"] for a in body["alternatives"]]
    assert pid not in ids and len(ids) >= 1


def test_alternatives_require_disliked(app_client):
    token = _register(app_client)
    bag = app_client.post(
        "/recommend", json={"budget": "low", "concerns": ["acne"]}, headers=_auth(token)
    ).json()["bag"]
    pid = _serum_id(bag)
    assert app_client.get(f"/care/items/{pid}/alternatives", headers=_auth(token)).status_code == 400


def test_replace_swaps_and_keeps_old_dimmed(app_client):
    token, pid = _setup_disliked_serum(app_client)
    new_id = _alternatives(app_client, token, pid)[0]["id"]
    r = app_client.post(
        f"/care/items/{pid}/replace", json={"new_product_id": new_id}, headers=_auth(token)
    )
    assert r.status_code == 200
    body = r.json()
    by_id = {it["product"]["id"]: it for it in body["items"]}
    assert by_id[new_id]["status"] == "active"
    assert by_id[pid]["status"] == "replaced"
    assert by_id[pid]["comment"] == "не подошло"       # comment preserved
    assert body["items"][-1]["product"]["id"] == pid   # moved to the bottom
    assert body["replacements"]["serum"] == 1


def test_replace_rejects_non_alternative(app_client):
    token, pid = _setup_disliked_serum(app_client)
    r = app_client.post(
        f"/care/items/{pid}/replace", json={"new_product_id": "P-CL"}, headers=_auth(token)
    )
    assert r.status_code == 400


def test_replacement_limited_to_two_per_step(app_client):
    token, pid = _setup_disliked_serum(app_client)
    # 1st replacement
    r1 = app_client.post(
        f"/care/items/{pid}/replace",
        json={"new_product_id": _alternatives(app_client, token, pid)[0]["id"]},
        headers=_auth(token),
    ).json()
    s1 = _serum_id(r1["items"])
    app_client.put(
        f"/care/items/{s1}/feedback",
        json={"feedback": "disliked", "comment": "again"},
        headers=_auth(token),
    )
    # 2nd replacement
    r2 = app_client.post(
        f"/care/items/{s1}/replace",
        json={"new_product_id": _alternatives(app_client, token, s1)[0]["id"]},
        headers=_auth(token),
    ).json()
    assert r2["replacements"]["serum"] == 2
    s2 = _serum_id(r2["items"])
    app_client.put(
        f"/care/items/{s2}/feedback",
        json={"feedback": "disliked", "comment": "third"},
        headers=_auth(token),
    )
    # 3rd is blocked
    assert app_client.get(f"/care/items/{s2}/alternatives", headers=_auth(token)).status_code == 409
    assert app_client.post(
        f"/care/items/{s2}/replace", json={"new_product_id": "x"}, headers=_auth(token)
    ).status_code == 409


def test_replace_requires_disliked(app_client):
    token = _register(app_client)
    bag = app_client.post(
        "/recommend", json={"budget": "low", "concerns": ["acne"]}, headers=_auth(token)
    ).json()["bag"]
    pid = _serum_id(bag)
    r = app_client.post(
        f"/care/items/{pid}/replace", json={"new_product_id": "P-SE2"}, headers=_auth(token)
    )
    assert r.status_code == 400


def test_replace_requires_auth(app_client):
    assert app_client.get("/care/items/P-SE/alternatives").status_code == 401
    assert app_client.post("/care/items/P-SE/replace", json={"new_product_id": "x"}).status_code == 401


# --------------------------------------------------------------------------
# Result tracker (PBI-416)
# --------------------------------------------------------------------------

def test_derive_criteria_unit():
    from app.core.tracker import derive_criteria
    # oily skin + acne -> two negative criteria, deduped
    assert derive_criteria("oily", ["acne"], []) == ["Жирный блеск", "Высыпания"]
    # dry skin + dryness concern dedupe to one criterion
    assert derive_criteria("dry", ["dryness"], []) == ["Сухость и стянутость"]
    # capped at four
    assert len(derive_criteria("sensitive", ["acne", "pigmentation", "aging", "oiliness"], [])) == 4
    # normal skin, no concerns -> fallback trio
    assert derive_criteria("normal", [], []) == ["Сухость и стянутость", "Жирный блеск", "Высыпания"]


def _start_tracker(app_client):
    token = _register(app_client)
    app_client.post(
        "/recommend",
        json={"budget": "low", "concerns": ["acne"], "skin_type": "oily"},
        headers=_auth(token),
    )
    return token


def _open_checkpoint(db, index):
    tracker = db.collections["tracker"].docs[0]
    tracker["checkpoints"][index - 1]["due_date"] = datetime.now(timezone.utc) - timedelta(days=1)


def test_tracker_created_with_six_locked_checkpoints(app_client):
    token = _start_tracker(app_client)
    r = app_client.get("/tracker", headers=_auth(token))
    assert r.status_code == 200
    body = r.json()
    assert body["total_checkpoints"] == 6
    assert body["criteria"] == ["Жирный блеск", "Высыпания"]
    assert all(c["status"] == "locked" for c in body["checkpoints"])  # all future at creation


def test_tracker_404_before_questionnaire(app_client):
    token = _register(app_client)
    assert app_client.get("/tracker", headers=_auth(token)).status_code == 404


def test_tracker_requires_auth(app_client):
    assert app_client.get("/tracker").status_code == 401
    assert app_client.put("/tracker/checkpoints/1", json={"scores": {}, "overall": "same"}).status_code == 401


def test_submit_locked_checkpoint_rejected(app_client):
    token = _start_tracker(app_client)
    r = app_client.put(
        "/tracker/checkpoints/1",
        json={"scores": {"Жирный блеск": 3, "Высыпания": 2}, "overall": "better"},
        headers=_auth(token),
    )
    assert r.status_code == 400  # not opened yet


def test_submit_open_checkpoint(app_client, db):
    token = _start_tracker(app_client)
    _open_checkpoint(db, 1)
    r = app_client.put(
        "/tracker/checkpoints/1",
        json={"scores": {"Жирный блеск": 2, "Высыпания": 1}, "overall": "better", "comment": "лучше"},
        headers=_auth(token),
    )
    assert r.status_code == 200
    cp1 = r.json()["checkpoints"][0]
    assert cp1["status"] == "done"
    assert cp1["scores"] == {"Жирный блеск": 2, "Высыпания": 1}
    assert cp1["overall"] == "better" and cp1["comment"] == "лучше"


def test_submit_requires_all_criteria(app_client, db):
    token = _start_tracker(app_client)
    _open_checkpoint(db, 1)
    r = app_client.put(
        "/tracker/checkpoints/1",
        json={"scores": {"Жирный блеск": 3}, "overall": "same"},  # missing "Высыпания"
        headers=_auth(token),
    )
    assert r.status_code == 422


def test_submit_score_out_of_range(app_client, db):
    token = _start_tracker(app_client)
    _open_checkpoint(db, 1)
    r = app_client.put(
        "/tracker/checkpoints/1",
        json={"scores": {"Жирный блеск": 6, "Высыпания": 2}, "overall": "same"},
        headers=_auth(token),
    )
    assert r.status_code == 422


def test_filled_checkpoint_is_read_only(app_client, db):
    token = _start_tracker(app_client)
    _open_checkpoint(db, 1)
    payload = {"scores": {"Жирный блеск": 3, "Высыпания": 3}, "overall": "same"}
    assert app_client.put("/tracker/checkpoints/1", json=payload, headers=_auth(token)).status_code == 200
    # second submit is blocked
    assert app_client.put("/tracker/checkpoints/1", json=payload, headers=_auth(token)).status_code == 409


def test_submit_unknown_checkpoint(app_client, db):
    token = _start_tracker(app_client)
    r = app_client.put(
        "/tracker/checkpoints/99",
        json={"scores": {"Жирный блеск": 3, "Высыпания": 3}, "overall": "same"},
        headers=_auth(token),
    )
    assert r.status_code == 404


def test_missed_checkpoint_still_fillable(app_client, db):
    # week 2 opened and missed, week 4 also opened -> both fillable (soft schedule)
    token = _start_tracker(app_client)
    _open_checkpoint(db, 1)
    _open_checkpoint(db, 2)
    r = app_client.put(
        "/tracker/checkpoints/1",
        json={"scores": {"Жирный блеск": 4, "Высыпания": 4}, "overall": "worse"},
        headers=_auth(token),
    )
    assert r.status_code == 200


def test_new_bag_resets_tracker(app_client, db):
    token = _start_tracker(app_client)
    _open_checkpoint(db, 1)
    app_client.put(
        "/tracker/checkpoints/1",
        json={"scores": {"Жирный блеск": 3, "Высыпания": 3}, "overall": "same"},
        headers=_auth(token),
    )
    # re-take the questionnaire -> fresh tracker
    app_client.post(
        "/recommend",
        json={"budget": "low", "concerns": ["dryness"], "skin_type": "dry"},
        headers=_auth(token),
    )
    body = app_client.get("/tracker", headers=_auth(token)).json()
    assert body["criteria"] == ["Сухость и стянутость"]
    assert all(c["filled_at"] is None for c in body["checkpoints"])
