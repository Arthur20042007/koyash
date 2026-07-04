"""Special-condition safety filter (US-20 / PBI-312): a product whose ingredients
are contraindicated for a declared condition is hard-excluded, deterministically."""


def _ids(client, **payload):
    payload.setdefault("budget", "low")
    r = client.post("/recommend", json=payload)
    assert r.status_code == 200, r.text
    return [item["product"]["id"] for item in r.json()["bag"]]


# 2 concerns triggers the "up to 2 serums" branch so both low serums appear.
_SERUM = {"concerns": ["aging", "pigmentation"]}


def test_retinoid_present_without_condition(client):
    assert "P-SE-LOW" in _ids(client, **_SERUM)  # Retinal serum allowed normally


def test_pregnancy_excludes_retinoid_product(client):
    ids = _ids(client, conditions=["pregnancy"], **_SERUM)
    assert "P-SE-LOW" not in ids  # retinoid contraindicated in pregnancy
    assert "P-SE-LOW2" in ids  # the rest of the bag is still assembled


def test_condition_none_is_noop(client):
    assert "P-SE-LOW" in _ids(client, conditions=[], **_SERUM)


def test_condition_case_insensitive(client):
    assert "P-SE-LOW" not in _ids(client, conditions=["PREGNANCY"], **_SERUM)


def test_dermatitis_excludes_fragrance_product(client):
    # The low mask (P-MA-LOW) carries a fragrance allergen token.
    assert "P-MA-LOW" in _ids(client, concerns=["dryness"])
    assert "P-MA-LOW" not in _ids(client, concerns=["dryness"], conditions=["dermatitis"])
