# Quality Requirement Tests

Each automated quality requirement test (QRT) directly verifies one or more
measurable scenarios from [quality-requirements.md](quality-requirements.md).
All QRTs are automated, stored in the normal repository test location, marked
with the `qrt` pytest marker, and run in CI.

**Test location:** `backend/tests/quality/`
**CI workflow:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — job `backend-tests`
**Run locally:**

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest            # full suite + coverage gate
python -m pytest -m qrt     # quality requirement tests only
```

The QRTs run against the recommendation engine through the FastAPI ASGI test
client with an in-memory catalog injected in place of MongoDB Atlas
(`backend/tests/conftest.py`), so they are deterministic and need no database
credentials or network access in CI.

-----

## QRT-001: Allergen exclusion

**Linked quality requirement:** [QR-001](quality-requirements.md#qr-001-allergen-safe-recommendations)

**Verification method:** Automated parametrized integration test (pytest +
FastAPI `TestClient`).

**Test data, setup, or environment:** Fixed in-memory catalog
(`backend/tests/conftest.py`) containing products with the allergen tokens
`fragrance`, `alcohol`, and `lanolin`. The test enumerates declared-allergen
sets (including a mixed-case entry and a multi-allergen entry) across all three
budget segments.

**Automated command or CI check:**

```bash
cd backend && python -m pytest tests/quality/test_qrt_001_allergen_exclusion.py
```

**Expected measurable result:** For every parametrized request, no product in
the returned bag belongs to the set of catalog products carrying a declared
allergen (case-insensitive). A non-vacuous control asserts that a
fragrance-bearing product is selected when fragrance is *not* declared and is
absent (with a safe fallback substituted) once it *is* declared. 100% pass = QR
satisfied.

**Evidence link:** [`backend/tests/quality/test_qrt_001_allergen_exclusion.py`](../backend/tests/quality/test_qrt_001_allergen_exclusion.py)
· latest protected-branch CI run of the `backend-tests` job.

-----

## QRT-002: Recommendation input-space robustness

**Linked quality requirement:** [QR-002](quality-requirements.md#qr-002-robust-recommendation-across-the-valid-input-space)

**Verification method:** Automated parametrized integration test (pytest +
FastAPI `TestClient`) plus an empty-catalog boundary test.

**Test data, setup, or environment:** The fixed in-memory catalog for the grid
case; an empty catalog (`empty_client` fixture) for the boundary case. The grid
is the Cartesian product of budget × concern set × ethics flags × allergen set ×
minimalism (≥ 200 combinations).

**Automated command or CI check:**

```bash
cd backend && python -m pytest tests/quality/test_qrt_002_fault_tolerance.py
```

**Expected measurable result:** Every grid request returns HTTP 200 with a body
that constructs a valid `RecommendResponse`, or HTTP 422 with
`detail.error.code == "NO_PRODUCTS_AVAILABLE"`; no 5xx and no schema-invalid 200
occurs. The empty-catalog request returns exactly the documented structured 422.
100% pass = QR satisfied.

**Evidence link:** [`backend/tests/quality/test_qrt_002_fault_tolerance.py`](../backend/tests/quality/test_qrt_002_fault_tolerance.py)
· latest protected-branch CI run of the `backend-tests` job.

-----

## QRT-003: /recommend latency

**Linked quality requirement:** [QR-003](quality-requirements.md#qr-003-recommendation-response-time)

**Verification method:** Automated timing test (pytest + FastAPI `TestClient`),
in-process, network excluded.

**Test data, setup, or environment:** Fixed in-memory catalog. One warm-up
request, then 100 sequential `/recommend` requests with a representative
payload (mid budget, three concerns); per-request wall-clock latency recorded
with `time.perf_counter`.

**Automated command or CI check:**

```bash
cd backend && python -m pytest tests/quality/test_qrt_003_recommend_latency.py
```

**Expected measurable result:** The 95th-percentile latency over the 100
requests is ≤ 300 ms; every request returns HTTP 200. Pass = QR satisfied.

**Evidence link:** [`backend/tests/quality/test_qrt_003_recommend_latency.py`](../backend/tests/quality/test_qrt_003_recommend_latency.py)
· latest protected-branch CI run of the `backend-tests` job.

-----

## QRT-004: Credential confidentiality

**Linked quality requirement:** [QR-004](quality-requirements.md#qr-004-credential-confidentiality)

**Verification method:** Automated integration test (pytest + FastAPI
`TestClient`), marked `qrt`.

**Test data, setup, or environment:** An in-memory `users` collection injected
in place of MongoDB Atlas (the auth module's `get_database` is monkeypatched), so
the test needs no database or network. A user registers, signs in, and reads
`/auth/me` with a known password.

**Automated command or CI check:**

```bash
cd backend && python -m pytest tests/quality/test_qrt_004_credential_confidentiality.py
```

**Expected measurable result:** None of the `/auth/register`, `/auth/login`, or
`/auth/me` response bodies contains the plaintext password, a `password` field,
or a `password_hash` field; the stored user record keeps the password only as a
bcrypt hash (it differs from the plaintext and `bcrypt.checkpw` verifies it).
100% pass = QR satisfied.

**Evidence link:** [`backend/tests/quality/test_qrt_004_credential_confidentiality.py`](../backend/tests/quality/test_qrt_004_credential_confidentiality.py)
· latest protected-branch CI run of the `backend-tests` job.

-----

## Evidence-type classification

| ID | Type | Verifies a measurable QR scenario? | Counts as QRT? |
|----|------|-------------------------------------|------------------|
| QRT-001 | Integration test | Yes — QR-001 | Yes |
| QRT-002 | Integration test | Yes — QR-002 | Yes |
| QRT-003 | Performance test | Yes — QR-003 | Yes |
| QRT-004 | Integration test | Yes — QR-004 | Yes |

The unit/integration tests in `backend/tests/test_recommend_unit.py` provide
baseline coverage of the critical module but are not, on their own, QRTs unless
linked to a measurable QR scenario.

**Verified locally:** full suite (`python -m pytest` from `backend/`) — 322
passed, line coverage on `app/api/recommend.py` 100% (required ≥30%), after
adding unit coverage for the skin-type preference logic (PBI-202, merged
via PR #86) alongside this PBI-207 work.
`python -m pytest -m qrt` — same result, QRT-only subset passes independently.
