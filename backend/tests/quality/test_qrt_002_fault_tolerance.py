"""QRT-002 — Input-space robustness (verifies QR-002, Fault Tolerance).

Scenario under test: for any syntactically valid /recommend request, the
endpoint returns either HTTP 200 with a body that validates against
RecommendResponse, or HTTP 422 with a documented NO_PRODUCTS_AVAILABLE
error; it never returns 5xx and never a schema-invalid 200.
"""

import itertools

import pytest

from app.models.product import RecommendResponse

BUDGETS = ["low", "mid", "high"]
CONCERN_OPTIONS = [
    [], ["acne"], ["aging", "pigmentation"],
    ["acne", "oiliness", "dryness", "sensitivity"],
]
ETHICS = [(False, False), (True, False), (False, True), (True, True)]
ALLERGENS = [[], ["fragrance"], ["fragrance", "alcohol", "lanolin"]]
MINIMALISM = [False, True]


def _grid():
    return itertools.product(BUDGETS, CONCERN_OPTIONS, ETHICS, ALLERGENS, MINIMALISM)


@pytest.mark.qrt
@pytest.mark.parametrize("budget,concerns,ethics,allergens,minimalism", _grid())
def test_valid_input_never_faults(client, budget, concerns, ethics, allergens, minimalism):
    vegan, cruelty_free = ethics
    r = client.post(
        "/recommend",
        json={
            "budget": budget, "concerns": concerns, "vegan": vegan,
            "cruelty_free": cruelty_free, "allergens": allergens,
            "minimalism": minimalism,
        },
    )
    assert r.status_code in (200, 422), f"unexpected status {r.status_code}"
    body = r.json()
    if r.status_code == 200:
        RecommendResponse(**body)  # raises if schema-invalid
    else:
        assert body["detail"]["error"]["code"] == "NO_PRODUCTS_AVAILABLE"


@pytest.mark.qrt
def test_empty_catalog_returns_structured_422(empty_client):
    """Boundary case: an empty pool degrades gracefully to a documented
    422, not an unhandled 500."""
    r = empty_client.post("/recommend", json={"budget": "mid"})
    assert r.status_code == 422
    assert r.json()["detail"]["error"]["code"] == "NO_PRODUCTS_AVAILABLE"
