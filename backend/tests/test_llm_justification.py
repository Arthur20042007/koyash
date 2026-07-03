"""LLM justification layer (ADR-001): disabled by default, overlays summary_ru
when enabled, and never blocks the response. No network in these tests."""
from app.core import llm as llm_mod


def test_disabled_by_default_returns_none(monkeypatch):
    monkeypatch.setattr(llm_mod.settings, "LLM_ENABLED", False)
    assert llm_mod.is_enabled() is False
    assert llm_mod.generate_justification(
        skin_type="жирная", concerns="акне", name="X", brand="Y",
        step="Очищение", ingredients="Салициловая кислота", concern_match=1,
    ) is None


def test_recommend_does_not_call_llm_when_disabled(client, monkeypatch):
    monkeypatch.setattr(llm_mod, "is_enabled", lambda: False)

    def _boom(**_kwargs):
        raise AssertionError("LLM must not be called when disabled")

    monkeypatch.setattr(llm_mod, "generate_justification", _boom)
    r = client.post("/recommend", json={"budget": "low", "concerns": ["acne"]})
    assert r.status_code == 200
    assert r.json()["bag"]  # rule-based justifications, no LLM call


def test_recommend_overlays_llm_summary_when_enabled(client, monkeypatch):
    monkeypatch.setattr(llm_mod, "is_enabled", lambda: True)
    monkeypatch.setattr(llm_mod, "generate_justification", lambda **_kwargs: "ТЕСТ-обоснование")
    r = client.post("/recommend", json={"budget": "low", "concerns": ["acne"]})
    assert r.status_code == 200
    bag = r.json()["bag"]
    assert bag
    assert all(item["justification"]["summary_ru"] == "ТЕСТ-обоснование" for item in bag)


def test_recommend_keeps_rule_based_when_llm_returns_none(client, monkeypatch):
    monkeypatch.setattr(llm_mod, "is_enabled", lambda: True)
    monkeypatch.setattr(llm_mod, "generate_justification", lambda **_kwargs: None)
    r = client.post("/recommend", json={"budget": "low", "concerns": ["acne"]})
    assert r.status_code == 200
    assert r.json()["bag"]  # fell back to rule-based text, no crash
