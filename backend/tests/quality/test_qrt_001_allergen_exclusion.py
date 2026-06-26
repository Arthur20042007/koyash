"""QRT-001 — Allergen exclusion (verifies QR-001, Functional Correctness).

Scenario under test: when a user declares one or more allergens, the
/recommend response must contain zero products whose normalized allergen
tokens intersect the declared set (case-insensitive), for 100% of requests.
"""

import itertools

import pytest

# Allergen tokens present in the sample catalog: fragrance, alcohol, lanolin.
DECLARED_ALLERGEN_SETS = [
    ["fragrance"],
    ["alcohol"],
    ["lanolin"],
    ["fragrance", "lanolin"],
    ["FRAGRANCE"],            # case-insensitivity
    ["fragrance", "alcohol", "lanolin"],
]
BUDGETS = ["low", "mid", "high"]


@pytest.mark.qrt
@pytest.mark.parametrize(
    "allergens,budget", itertools.product(DECLARED_ALLERGEN_SETS, BUDGETS)
)
def test_declared_allergens_never_returned(client, allergens, budget):
    declared = {a.lower() for a in allergens}
    r = client.post(
        "/recommend",
        json={"budget": budget, "concerns": ["acne", "dryness"],
              "allergens": allergens},
    )
    assert r.status_code in (200, 422)
    if r.status_code != 200:
        return  # empty bag is an acceptable, allergen-safe outcome
    bag = r.json()["bag"]
    # We can't see allergens_norm in the public output, so re-derive the
    # guarantee by id against the known catalog: fragrance-bearing products.
    FRAGRANCE_IDS = {"P-CL-MID", "P-SE-MID", "P-SP-MID", "P-MA-LOW"}
    ALCOHOL_IDS = {"P-TO-MID"}
    LANOLIN_IDS = {"P-MO-MID"}
    forbidden = set()
    if "fragrance" in declared:
        forbidden |= FRAGRANCE_IDS
    if "alcohol" in declared:
        forbidden |= ALCOHOL_IDS
    if "lanolin" in declared:
        forbidden |= LANOLIN_IDS
    returned_ids = {item["product"]["id"] for item in bag}
    assert returned_ids.isdisjoint(forbidden)


@pytest.mark.qrt
def test_exclusion_is_non_vacuous(client):
    """Control: a fragrance-bearing product IS selected when not declared,
    and disappears once fragrance is declared — proving the filter bites."""
    base = {"budget": "mid", "concerns": ["dryness"]}
    without = client.post("/recommend", json=base).json()
    with_allergen = client.post(
        "/recommend", json={**base, "allergens": ["fragrance"]}
    ).json()
    ids_without = {i["product"]["id"] for i in without["bag"]}
    ids_with = {i["product"]["id"] for i in with_allergen["bag"]}
    assert "P-CL-MID" in ids_without          # fragrance cleanser surfaced
    assert "P-CL-MID" not in ids_with         # ...and excluded when declared
    assert "P-CL-LOW" in ids_with             # fell back to a safe product
