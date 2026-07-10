# Testing Status

Canonical testing status artifact for KOYASH, following
[Repository_Requirements](Repository_Requirements.md#quality-automation-and-ci).
Cross-reference: [quality-requirements.md](quality-requirements.md),
[quality-requirement-tests.md](quality-requirement-tests.md),
[user-acceptance-tests.md](user-acceptance-tests.md).

**CI workflow:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
**Latest protected-default-branch (`main`) CI run:**
[CI workflow run](https://github.com/Koyash-team/koyash/actions/runs/29075414127) ·
[Lychee run](https://github.com/Koyash-team/koyash/actions/runs/29075414072)
**Branch protection / rules evidence:** [ruleset `main`](https://github.com/Koyash-team/koyash/rules/17644441)
(non-fast-forward, 1 required approving review, required review-thread resolution,
required status checks on all 11 jobs below — 6 backend/Lychee + 5 frontend added for PBI-209).
Branch protection additionally requires the branch to be up to date before merging, forbids
force-pushes and branch deletion, and applies to administrators as well (no bypass).

## Critical Modules and Coverage

| Critical module | Why critical | Required line coverage | Current line coverage | Evidence |
|---|---|---:|---:|---|
| `backend/app/api/recommend.py` | Owns the core product value: hard filtering (vegan/cruelty-free/allergens), segment fallback, skin-type preference, basket assembly, per-product justification, the special-condition safety filter (US-20), and the optional LLM justification overlay (US-14) (US-04, US-05, US-08, US-09, US-14, US-20). | 30% | 100% | [Backend tests + QRTs + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| `backend/app/api/auth.py` | Owns account identity: registration, login, JWT issuing/validation, and the `get_current_user` / `get_optional_user` dependencies that gate every account endpoint while keeping `/recommend` guest-first (US-21, ADR-004). | 30% | 91% | [Backend tests + QRTs + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| `backend/app/core/security.py` | Credential handling: bcrypt password hashing/verification and JWT signing/decoding. A defect here is a direct security failure ([QR-004](quality-requirements.md#qr-004-credential-confidentiality)). | 30% | 92% | [Backend tests + QRTs + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| `backend/app/api/account.py` | Persists the profile snapshot and the single saved cosmetic bag, and owns per-product feedback and product replacement with its 2-per-step limit (US-12, US-13, US-22, US-25). | 30% | 100% | [Backend tests + QRTs + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| `backend/app/api/account_security.py` | Account management: personal-data edit with email uniqueness, password change, and password-confirmed account deletion cascading to the saved bag and tracker (US-26). | 30% | 100% | [Backend tests + QRTs + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| `backend/app/api/tracker.py` | Result-tracker API: date-based checkpoint unlocking, single-submit semantics, and read-only history (US-24). | 30% | 100% | [Backend tests + QRTs + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| `backend/app/core/tracker.py` | Tracker schedule (6 biweekly checkpoints) and the dynamic criteria derived from the user's profile (US-24). | 30% | 97% | [Backend tests + QRTs + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| `frontend/src/pages/Quiz/quizConfig.js` (`buildRequest`) | Assembles the questionnaire answers into the `/recommend` request payload; shared by both the storytelling (`Quiz`) and short (`Quick`) flows — a defect here silently breaks every recommendation request. | 30% | 100% | [Frontend tests + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816100) |
| `frontend/src/pages/Quiz/Loading.jsx` | Calls `POST /recommend`, branches on success/422 (`NO_PRODUCTS_AVAILABLE`)/error, and navigates to the results screen with the right state — the only place the frontend talks to the recommendation API. | 30% | 96% | [Frontend tests + coverage run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816100) |

The backend coverage gate measures every critical backend module listed above (98% combined,
required ≥30%). Global repository coverage is still lower: the remaining backend modules
(`app/api/products.py`, `app/core/database.py`, `app/models/*`,
`app/core/active_translations.py`) and most frontend code (screen components, styling,
`Quick`/`Results` UI) have no automated tests. They are not classified as critical modules —
thin wrappers around MongoDB/FastAPI, pydantic schemas, static translation tables, or
presentational screens, not the product's core decision or security logic — but they are
untested. (`app/core/llm.py` is exercised by `tests/test_llm_justification.py` but is not
coverage-gated, since the LLM overlay never changes selection — ADR-001.)

## Automated Test Status

| Test type | Scope | Command or CI check | Latest result | Evidence |
|---|---|---|---|---|
| Backend unit tests | Recommendation/matching logic: segment fallback, hard filters, skin-type preference, justification, ranking (`backend/tests/test_recommend_unit.py`) | `cd backend && python -m pytest tests/test_recommend_unit.py` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Backend integration tests | `POST /recommend` end-to-end via FastAPI `TestClient` against an in-memory catalog, plus the QRT suite below | `cd backend && python -m pytest` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Backend automated QRTs | QR-001 (allergen exclusion), QR-002 (input-space robustness), QR-003 (`/recommend` latency), [QR-004](quality-requirements.md#qr-004-credential-confidentiality) (credential confidentiality) | `cd backend && python -m pytest -m qrt` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Backend unit + integration tests | Authentication: registration validation, duplicate and case-normalized email, bcrypt-only password storage, login, JWT-protected route, and the guest-first guarantee that `/recommend` works without an account (`backend/tests/test_auth.py`) | `cd backend && python -m pytest tests/test_auth.py` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Backend integration tests | Account layer: profile snapshot and the single saved bag (overwrite on re-take, guests persist nothing), feedback with a required comment for «не подошло», product replacement (alternatives, dimming, 2-per-step limit), the result tracker (date-based unlock, submit, read-only, reset on a new bag), and account management with the deletion cascade (`backend/tests/test_account.py`) | `cd backend && python -m pytest tests/test_account.py` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Backend unit + integration tests | Special-condition safety filter: a product with a contraindicated ingredient (e.g. a retinoid for pregnancy) is hard-excluded; case-insensitive; empty = no-op (`backend/tests/test_conditions.py`) | `cd backend && python -m pytest tests/test_conditions.py` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Backend unit + integration tests | LLM justification layer: disabled by default (no network call), overlays `summary_ru` when enabled, and falls back to the rule-based text on error (`backend/tests/test_llm_justification.py`) | `cd backend && python -m pytest tests/test_llm_justification.py` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Frontend unit tests | `buildRequest` request-shape logic (`frontend/src/pages/Quiz/quizConfig.test.js`, 11 tests) | `cd frontend && npx vitest run src/pages/Quiz/quizConfig.test.js` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816100) |
| Frontend integration tests | `Loading` <-> `/recommend` boundary: success, 422 (`NO_PRODUCTS_AVAILABLE`), and network-error paths, with `fetch`/`useNavigate` mocked (`frontend/src/pages/Quiz/Loading.test.jsx`, 4 tests) | `cd frontend && npx vitest run src/pages/Quiz/Loading.test.jsx` | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816100) |

The backend suite (394 tests) keeps 100% line coverage on `backend/app/api/recommend.py` and
91–100% on the MVP v3 account modules — 98% combined across all coverage-gated critical
modules (required ≥30%). The frontend suite keeps 100%/96% line coverage on
`quizConfig.js`/`Loading.jsx` (required ≥30% per file). No automated frontend
quality-requirement test exists separately — see the note below the next table.

> The exact test counts and the CI-run / job links on this page are refreshed with the
> `v1.3.0` (MVP v3 trial) release once the remaining Sprint 4 PRs are merged, so they point
> at the final `main` run. The UAT rows below are refreshed after the Week 6 customer
> session.

## CI and QA Check Status

| Gate or check | Required for Done? | Latest protected-branch status | Evidence |
|---|---|---|---|
| Backend linting (ruff) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816138) |
| Backend type checking (mypy) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816066) |
| Backend build (Docker image) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816096) |
| Backend unit + integration tests + coverage gate | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Backend automated QRTs | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816085) |
| Backend additional QA check (dependency vulnerability scan) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816102) |
| Link checking (Lychee) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414072) |
| Frontend linting (eslint) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816092) |
| Frontend format check (prettier) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816082) |
| Frontend build (vite build) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816126) |
| Frontend unit + integration tests + coverage gate | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816100) |
| Frontend additional QA check (dependency vulnerability scan) | Yes | Passing | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816108) |

**Note on frontend quality requirement tests:** `ci.yml` has no path filters, so the
backend QRT job (QR-001/002/003) already runs on every PR, including frontend-only ones.
This satisfies the pipeline-level "automated quality requirement tests" gate; there is no
separate frontend-specific QRT (e.g. accessibility or performance) at this time.

## Additional QA Check Rationale

| QA objective or risk | Additional QA check | Scope | Latest result | Evidence | Limitations or follow-up |
|---|---|---|---|---|---|
| Dependencies with known vulnerabilities may expose the deployed API to avoidable risk. | Automated dependency vulnerability scan (`pip-audit`). | `backend/requirements.txt` (runtime dependencies). | Passing — 0 known vulnerabilities. | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816102) | First run found 9 known CVEs (`fastapi`/`python-dotenv`, transitively `starlette`); fixed by upgrading `fastapi` to 0.138.1 and `python-dotenv` to 1.2.2 (PR #87). |
| Dependencies with known vulnerabilities may expose deployed frontend users to avoidable risk. | Automated dependency vulnerability scan (`npm audit --omit=dev`). | `frontend/package-lock.json` (runtime dependencies). | Passing — 0 known vulnerabilities. | [CI run](https://github.com/Koyash-team/koyash/actions/runs/29075414127/job/86305816108) | New CVEs disclosed after a dependency is pinned will still require manual triage when the scan next reports them. |

## Manual Evidence That Does Not Count as QRT

| Evidence | Scope | Result | Follow-up PBI or issue |
|---|---|---|---|
| UAT-001: questionnaire -> personalized cosmetic bag (in-person customer session, 2026-06-26) | End-to-end happy path via the short questionnaire variant (storytelling variant intermittently failed during this session; both variants share the same matching logic) | Passed. Customer raised an open product question on budget-matching precision and a catalog gap (no low-budget toning product), both correctly handled as an empty step rather than an unsafe substitution. | [reports/week4/customer-review-summary.md](../reports/week4/customer-review-summary.md) action point A2 |
| UAT-002: declared allergens are never recommended (same session) | Allergen hard-filter, shared between both questionnaire variants | Passed. No defect found. | — |
| UAT-003: recommendations reflect declared skin concerns (same session) | Concern-matching justification text | Passed. No defect found. | — |

Full scenario definitions and execution detail: [user-acceptance-tests.md](user-acceptance-tests.md).

## Gates That Continue Into Later Project Work

The lint, type-check, build, unit/integration/QRT test, coverage, and dependency-audit
gates introduced in Assignment 4 for the backend
([PBI-206](https://github.com/Koyash-team/koyash/issues/75),
[PBI-207](https://github.com/Koyash-team/koyash/issues/76),
[PBI-208](https://github.com/Koyash-team/koyash/issues/77)) and for the frontend
([PBI-209](https://github.com/Koyash-team/koyash/issues/78)) are maintained repository
requirements per [Repository_Requirements](Repository_Requirements.md#quality-automation-and-ci).
They are enforced by the `main` branch ruleset (required status checks on all 11 jobs
above) and must keep passing or be replaced with a documented equivalent or stronger
check as the product changes — not disabled or narrowed after submission.
