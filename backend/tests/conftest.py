"""Shared pytest fixtures for the KOYASH backend test suite.

The recommendation engine (`app.api.recommend`) reads its catalog from
MongoDB at request time via `get_database()`. To keep tests deterministic
and runnable in CI without a live Atlas connection, we:

  * set placeholder DB settings before the app is imported, and
  * monkeypatch `app.api.recommend.get_database` with an in-memory fake
    that mimics motor's async cursor over a fixed sample catalog.

The fake honours the same `vegan` / `cruelty_free` query keys the endpoint
sends to Mongo, so the hard-filter behaviour under test is exercised end to
end against the real selection, justification, and fault-handling code.
"""

import os

# Must be set before app.core.config.Settings() is constructed on import.
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")
os.environ.setdefault("MONGO_DB_NAME", "koyash_test")

import pytest
from fastapi.testclient import TestClient


# --------------------------------------------------------------------------
# In-memory Mongo stand-in
# --------------------------------------------------------------------------

class _FakeCursor:
    """Async iterator over a list of documents, like a motor cursor."""

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


class _FakeCollection:
    def __init__(self, docs):
        self._docs = docs

    def find(self, query=None, **kwargs):
        query = query or {}
        matched = [
            d for d in self._docs
            if all(d.get(k) == v for k, v in query.items())
        ]
        # Copy: doc_to_product pops "_id" and mutates the dict it receives.
        return _FakeCursor([dict(d) for d in matched])


class _FakeDB:
    def __init__(self, docs):
        self._collection = _FakeCollection(docs)

    def __getitem__(self, _name):
        return self._collection


# --------------------------------------------------------------------------
# Sample catalog — small but covers every routine step, both relevant
# segments, ethics variety, and allergen-bearing products.
# --------------------------------------------------------------------------

def _p(**kw):
    base = {
        "vegan": False,
        "cruelty_free": "unknown",
        "order_index": None,
        "concerns_addressed": [],
        "allergens_norm": [],
        "link": "https://example.test/p",
        "image_url": None,
        "main_actives_short": [],
        "functional_category": "",
    }
    base.update(kw)
    return base


SAMPLE_CATALOG = [
    # cleanse
    _p(_id="P-CL-LOW", name="Gentle Gel", brand="A", price_rub=400, segment="low",
       routine_step="cleanse", tier="core", order_index=1, vegan=True,
       cruelty_free="yes", concerns_addressed=["acne", "oiliness"]),
    _p(_id="P-CL-MID", name="Cream Wash", brand="B", price_rub=900, segment="mid",
       routine_step="cleanse", tier="core", order_index=1,
       allergens_norm=["fragrance"], concerns_addressed=["dryness"]),
    # tone
    _p(_id="P-TO-LOW", name="Basic Toner", brand="A", price_rub=350, segment="low",
       routine_step="tone", tier="core", order_index=2,
       concerns_addressed=["oiliness"]),
    _p(_id="P-TO-MID", name="Niacinamide Tonic", brand="C", price_rub=800,
       segment="mid", routine_step="tone", tier="core", order_index=2, vegan=True,
       cruelty_free="yes", allergens_norm=["alcohol"],
       concerns_addressed=["pigmentation"]),
    # serum (two low serums so the "up to 2 serums" branch can fire)
    _p(_id="P-SE-LOW", name="Retinal 0.1", brand="A", price_rub=600, segment="low",
       routine_step="serum", tier="core", order_index=3, vegan=True,
       cruelty_free="yes", concerns_addressed=["aging"]),
    _p(_id="P-SE-LOW2", name="Vitamin C 10", brand="A", price_rub=550,
       segment="low", routine_step="serum", tier="core", order_index=3, vegan=True,
       cruelty_free="yes", concerns_addressed=["pigmentation", "aging"]),
    _p(_id="P-SE-MID", name="BHA 2%", brand="B", price_rub=950, segment="mid",
       routine_step="serum", tier="core", order_index=3,
       allergens_norm=["fragrance"], concerns_addressed=["acne"]),
    _p(_id="P-SE-HIGH", name="Luxe Peptide", brand="L", price_rub=4500,
       segment="high", routine_step="serum", tier="core", order_index=3, vegan=True,
       cruelty_free="yes", concerns_addressed=["aging"]),
    # moisturize
    _p(_id="P-MO-LOW", name="Light Cream", brand="A", price_rub=500, segment="low",
       routine_step="moisturize", tier="core", order_index=4,
       concerns_addressed=["dryness"]),
    _p(_id="P-MO-MID", name="Cica Balm", brand="C", price_rub=850, segment="mid",
       routine_step="moisturize", tier="core", order_index=4, vegan=True,
       cruelty_free="yes", allergens_norm=["lanolin"],
       concerns_addressed=["sensitivity"]),
    # spf
    _p(_id="P-SP-LOW", name="SPF50 Fluid", brand="A", price_rub=700, segment="low",
       routine_step="spf", tier="core", order_index=5, vegan=True,
       cruelty_free="yes"),
    _p(_id="P-SP-MID", name="SPF50 Tinted", brand="B", price_rub=1100,
       segment="mid", routine_step="spf", tier="core", order_index=5,
       allergens_norm=["fragrance"]),
    # occasional
    _p(_id="P-EX-MID", name="AHA Peel", brand="C", price_rub=750, segment="mid",
       routine_step="exfoliant", tier="occasional", vegan=True, cruelty_free="yes",
       concerns_addressed=["pigmentation"]),
    _p(_id="P-MA-LOW", name="Hydra Mask", brand="A", price_rub=450, segment="low",
       routine_step="mask", tier="occasional", vegan=True, cruelty_free="yes",
       allergens_norm=["fragrance"], concerns_addressed=["dryness"]),
]


@pytest.fixture
def catalog():
    return [dict(d) for d in SAMPLE_CATALOG]


def _make_client(monkeypatch, docs):
    from app.api import recommend as rec
    monkeypatch.setattr(rec, "get_database", lambda: _FakeDB(docs))
    from app.main import app
    return TestClient(app)


@pytest.fixture
def client(monkeypatch, catalog):
    """TestClient backed by the full sample catalog."""
    return _make_client(monkeypatch, catalog)


@pytest.fixture
def empty_client(monkeypatch):
    """TestClient backed by an empty catalog (boundary / fault case)."""
    return _make_client(monkeypatch, [])
