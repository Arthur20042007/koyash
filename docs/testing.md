# Testing Status

Canonical testing status artifact for KOYASH, following
[Repository_Requirements](Repository_Requirements.md#quality-automation-and-ci).
Cross-reference: [quality-requirements.md](quality-requirements.md),
[quality-requirement-tests.md](quality-requirement-tests.md),
[user-acceptance-tests.md](user-acceptance-tests.md).

**CI workflow:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
**Latest protected-default-branch (`main`) CI run:**
[CI workflow run](https://github.com/Koyash-team/koyash/actions/runs/28284925195) ·
[Lychee run](https://github.com/Koyash-team/koyash/actions/runs/28284925183)
**Branch protection / rules evidence:** [ruleset `main`](https://github.com/Koyash-team/koyash/rules/17644441)
(non-fast-forward, 1 required approving review, required status checks on all 6 jobs below)

## Critical Modules and Coverage

| Critical module | Why critical | Required line coverage | Current line coverage | Evidence |
|---|---|---:|---:|---|
| `backend/app/api/recommend.py` | Owns the core product value: hard filtering (vegan/cruelty-free/allergens), segment fallback, skin-type preference, basket assembly, and per-product justification (US-04, US-05, US-08, US-09). | 30% | 100% | [Backend tests + QRTs + coverage run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136505) |

Global repository coverage is lower than the critical-module figure above: no other backend
module (`app/api/products.py`, `app/core/database.py`, `app/models/product.py`,
`app/core/active_translations.py`) and no frontend code has automated tests yet. These are
not currently classified as critical modules — they are thin wrappers around MongoDB/FastAPI
or static translation tables, not the product's core decision logic — but they are untested.
Frontend test coverage is tracked separately under PBI-209 (frontend CI quality gates, not
yet implemented).

## Automated Test Status

| Test type | Scope | Command or CI check | Latest result | Evidence |
|---|---|---|---|---|
| Unit tests | Recommendation/matching logic: segment fallback, hard filters, skin-type preference, justification, ranking (`backend/tests/test_recommend_unit.py`) | `cd backend && python -m pytest tests/test_recommend_unit.py` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136505) |
| Integration tests | `POST /recommend` end-to-end via FastAPI `TestClient` against an in-memory catalog (`backend/tests/test_recommend_unit.py::test_endpoint_happy_path_schema_and_order`, plus the QRT suite below) | `cd backend && python -m pytest` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136505) |
| Automated QRTs | QR-001 (allergen exclusion), QR-002 (input-space robustness), QR-003 (`/recommend` latency) | `cd backend && python -m pytest -m qrt` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136505) |

322 tests total, 100% line coverage on `backend/app/api/recommend.py` (required ≥30%).

## CI and QA Check Status

| Gate or check | Required for Done? | Latest protected-branch status | Evidence |
|---|---|---|---|
| Linting (ruff) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136518) |
| Type checking (mypy) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136510) |
| Build (Docker image) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136524) |
| Unit + integration tests + coverage gate | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136505) |
| Automated QRTs | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136505) |
| Additional QA check (dependency vulnerability scan) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136516) |
| Link checking (Lychee) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925183/job/83807136507) |

## Additional QA Check Rationale

| QA objective or risk | Additional QA check | Scope | Latest result | Evidence | Limitations or follow-up |
|---|---|---|---|---|---|
| Dependencies with known vulnerabilities may expose the deployed API to avoidable risk. | Automated dependency vulnerability scan (`pip-audit`). | `backend/requirements.txt` (runtime dependencies). | Passing — 0 known vulnerabilities. | [CI run](https://github.com/Koyash-team/koyash/actions/runs/28284925195/job/83807136516) | First run found 9 known CVEs (`fastapi`/`python-dotenv`, transitively `starlette`); fixed by upgrading `fastapi` to 0.138.1 and `python-dotenv` to 1.2.2 (PR #87). Frontend dependencies (`npm`) are not yet scanned — tracked under PBI-209. New CVEs disclosed after a dependency is pinned will still require manual triage when the scan next reports them. |

## Manual Evidence That Does Not Count as QRT

| Evidence | Scope | Result | Follow-up PBI or issue |
|---|---|---|---|
| None yet. | UAT scenarios are defined in [user-acceptance-tests.md](user-acceptance-tests.md) but have not yet been executed with the customer this Sprint. | — | [PBI-212](https://github.com/Koyash-team/koyash/issues/81) |

## Gates That Continue Into Later Project Work

The lint, type-check, build, unit/integration/QRT test, coverage, and dependency-audit gates
introduced in Assignment 4 ([PBI-206](https://github.com/Koyash-team/koyash/issues/75),
[PBI-207](https://github.com/Koyash-team/koyash/issues/76),
[PBI-208](https://github.com/Koyash-team/koyash/issues/77)) are maintained repository
requirements per [Repository_Requirements](Repository_Requirements.md#quality-automation-and-ci).
They are enforced by the `main` branch ruleset (required status checks on all 6 jobs above) and
must keep passing or be replaced with a documented equivalent or stronger check as the product
changes — not disabled or narrowed after submission.
