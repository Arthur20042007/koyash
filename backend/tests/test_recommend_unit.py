"""Unit / integration tests for the recommendation engine.

These cover the selection, segment-fallback, justification, and ordering
logic of `app.api.recommend` (the critical product module) and provide the
baseline coverage required by the Definition of Done. They are separate from
the quality requirement tests under tests/quality/, which verify the
measurable QR scenarios.
"""

from app.models.product import Product, RecommendResponse
from app.api.recommend import (
    _apply_skin_preference,
    _base_select,
    _build_justification,
    _concern_match,
    CORE_STEPS,
)


def _prod(**kw):
    base = dict(
        id="x", name="n", brand="b", price_rub=100.0, segment="low",
        vegan=False, cruelty_free="unknown", routine_step="serum", tier="core",
        order_index=3, concerns_addressed=[], allergens_norm=[],
        main_actives_short=[], functional_category="",
    )
    base.update(kw)
    return Product(**base)


def _full_core_pool():
    steps = list(zip(CORE_STEPS, range(1, 6)))
    return [
        _prod(id=f"{s}-low", routine_step=s, tier="core", order_index=i,
              segment="low", price_rub=100 + i)
        for s, i in steps
    ]


def test_base_select_assembles_all_core_steps():
    pool = _full_core_pool()
    basket, missing, substituted = _base_select(pool, set(), minimalism=True, budget="low")
    assert {p.routine_step for p in basket} == set(CORE_STEPS)
    assert missing == []
    assert substituted == []


def test_segment_fallback_marks_substituted_not_missing():
    # Only a mid-segment cleanse exists; a low-budget request must fall back
    # to it and flag the step as substituted (not missing).
    pool = _full_core_pool()
    for p in pool:
        if p.routine_step == "cleanse":
            p.segment = "mid"
    basket, missing, substituted = _base_select(pool, set(), minimalism=True, budget="low")
    assert "cleanse" not in missing
    assert "cleanse" in substituted
    assert any(p.routine_step == "cleanse" for p in basket)


def test_missing_core_step_reported():
    pool = [p for p in _full_core_pool() if p.routine_step != "spf"]
    basket, missing, substituted = _base_select(pool, set(), minimalism=True, budget="low")
    assert "spf" in missing


def test_two_serums_when_multiple_concerns():
    pool = _full_core_pool()
    pool += [
        _prod(id="serum-2", routine_step="serum", tier="core", order_index=3,
              segment="low", concerns_addressed=["acne"]),
    ]
    pool_serum = [p for p in pool if p.routine_step == "serum"]
    for p in pool_serum:
        p.concerns_addressed = ["acne", "aging"]
    basket, _, _ = _base_select(pool, {"acne", "aging"}, minimalism=True, budget="low")
    assert sum(1 for p in basket if p.routine_step == "serum") == 2


def test_minimalism_skips_occasional_steps():
    pool = _full_core_pool() + [
        _prod(id="ex", routine_step="exfoliant", tier="occasional", order_index=None,
              segment="low"),
    ]
    basket, _, _ = _base_select(pool, set(), minimalism=True, budget="low")
    assert all(p.tier == "core" for p in basket)


def test_skin_preference_prefers_specific_type():
    candidates = [
        _prod(id="dry", skintype=["dry"]),
        _prod(id="oily", skintype=["oily"]),
        _prod(id="any", skintype=["any"]),
    ]
    result = _apply_skin_preference(candidates, "dry")
    assert [p.id for p in result] == ["dry"]


def test_skin_preference_falls_back_to_any():
    candidates = [
        _prod(id="oily", skintype=["oily"]),
        _prod(id="any", skintype=["any"]),
    ]
    result = _apply_skin_preference(candidates, "dry")
    assert [p.id for p in result] == ["any"]


def test_skin_preference_empty_when_no_match():
    candidates = [_prod(id="oily", skintype=["oily"])]
    assert _apply_skin_preference(candidates, "dry") == []


def test_skin_preference_noop_when_unspecified():
    candidates = [_prod(id="a", skintype=["dry"]), _prod(id="b", skintype=[])]
    assert _apply_skin_preference(candidates, None) == candidates
    assert _apply_skin_preference(candidates, "unknown") == candidates


def test_skin_type_can_make_a_step_missing_not_substituted():
    # Only an oily-tagged, non-"any" cleanser exists; a "dry" request must
    # leave the step empty rather than hand back a mismatched product.
    pool = _full_core_pool()
    for p in pool:
        if p.routine_step == "cleanse":
            p.skintype = ["oily"]
    basket, missing, substituted = _base_select(
        pool, set(), minimalism=True, budget="low", skin_type="dry"
    )
    assert "cleanse" in missing
    assert "cleanse" not in substituted
    assert all(p.routine_step != "cleanse" for p in basket)


def test_concern_match_counts_intersection():
    p = _prod(concerns_addressed=["acne", "dryness"])
    assert _concern_match(p, {"acne", "sensitivity"}) == 1
    assert _concern_match(p, set()) == 0


def test_justification_includes_ethics_and_allergen_flags():
    p = _prod(routine_step="serum", tier="core", order_index=3,
              concerns_addressed=["acne"], vegan=True, cruelty_free="yes",
              functional_category="Сыворотка (10%), уход",
              main_actives_short=["BHA"])
    j = _build_justification(p, {"acne"}, req_vegan=True, req_cruelty_free=True,
                             req_has_allergens=True)
    assert "Шаг 3 из 5" in j.role
    assert any("акне" in w.lower() for w in j.why_for_you)
    assert "Подходит для веганов" in j.why_for_you
    assert "Не тестируется на животных" in j.why_for_you
    assert "Без отмеченных тобой аллергенов" in j.why_for_you
    assert j.summary_ru is not None


def test_endpoint_happy_path_schema_and_order(client):
    r = client.post("/recommend", json={"budget": "low", "concerns": ["acne"]})
    assert r.status_code == 200
    body = RecommendResponse(**r.json())  # schema-valid
    order = [i.product.order_index for i in body.bag if i.product.tier == "core"]
    assert order == sorted(order)
    assert body.meta.total_price_rub == round(
        sum(i.product.price_rub for i in body.bag), 2
    )
