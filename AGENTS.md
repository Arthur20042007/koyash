# AGENTS.md

Operating guide for coding agents working in the KOYASH repository, following
the [agents.md](https://agents.md/) convention.

Human onboarding lives in the [README](README.md) and
[CONTRIBUTING.md](CONTRIBUTING.md); this file is the agent-facing summary of the
commands, workflow, and safety rules that apply here.

## What this repository is

KOYASH is a skincare recommendation service:

- `backend/` — FastAPI (Python 3.12) + MongoDB Atlas via Motor. The rule-based
  recommendation engine lives in `app/api/recommend.py`; the personal-account
  layer in `app/api/auth.py`, `account.py`, `account_security.py`, `tracker.py`.
- `frontend/` — React + Vite single-page app.
- `db/` — offline seed/validation scripts for the product catalog.
- `docs/` — maintained documentation (architecture + ADRs, process, quality,
  testing, roadmap, handover). Published at
  <https://koyash-team.github.io/koyash/>.
- `reports/` — weekly course reports.

## Commands

Run these before proposing a change; they are exactly what CI enforces.

```bash
# backend (from backend/)
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest                    # full suite + coverage gate (critical modules ≥30%)
python -m pytest -m qrt             # quality requirement tests only
python -m ruff check .
python -m mypy app
python -m pip_audit -r requirements.txt

# frontend (from frontend/)
npm install                         # npm ci in CI
npm run lint
npm run format:check
npm test
npm run build
npm audit --omit=dev
```

Running the app locally: `uvicorn app.main:app --reload` (backend, needs
`MONGODB_URI`) and `npm run dev` (frontend). Tests do **not** need a database —
MongoDB is replaced by an in-memory fake in `backend/tests/`.

## Workflow expectations

- **Every change is issue-linked.** Blank issues are disabled; use the *User
  Story* or *Other PBI* template. Branch off `main` as
  `<issue-number>-<short-slug>` (chores: `chore/<short-slug>`).
- **Conventional Commits** with a scope: `feat(backend): …`,
  `docs(architecture): …`, `test(quality): …`.
- **PRs** use the repository template and close their issue with
  `Closes #<n>`. Keep one PBI per PR.
- **`main` is protected:** one approving review from a *different* team member,
  all 11 CI jobs green, branch up to date, no force-push, no admin bypass. An
  agent must never attempt to bypass, disable, or narrow these gates.
- Do not weaken quality gates (coverage thresholds, lint, type checks,
  dependency audits) to make a change pass. Fix the change instead.
- Update the maintained docs affected by a behaviour change in the same PR
  (architecture/ADRs, quality requirements and tests, `docs/testing.md`,
  `docs/customer-handover.md`, `CHANGELOG.md`).

## Safety, secrets, and privacy

- **Never commit or print secrets.** `.env`, `*.env`, `.env.*` are git-ignored.
  The only committed templates are `backend/.env.example` and `db/.env.example`.
  Secrets in use: `MONGODB_URI`, `JWT_SECRET` (JWT signing — the default in
  config is dev-only), and the optional LLM API key. Deployment secrets live in
  the Railway environment and GitHub Actions secrets.
- The **customer-authored LLM system prompt must not be published**. It belongs
  in the git-ignored `backend/llm_system_prompt.txt` or the `LLM_SYSTEM_PROMPT`
  environment variable (see `backend/llm_system_prompt.example.txt`).
- The customer's source dataset (`db/data/Koyash.xlsx`) is git-ignored and not
  ours to redistribute.
- **Public artifacts must be sanitized.** No real names, emails, phone numbers,
  or customer-identifying details in the repository, screenshots, demos, or
  reports — use GitHub usernames, roles, or sanitized demo data.
- Passwords are stored only as bcrypt hashes and must never appear in an API
  response (see [QR-004](docs/quality-requirements.md#qr-004-credential-confidentiality));
  do not add debug fields that would leak credentials.
- The LLM layer may only reword an already-made recommendation. It must never
  influence which products are selected — see
  [ADR-001](docs/architecture/adr/ADR-001-rule-based-engine-llm-justification-only.md).

## Where to read more

- [CONTRIBUTING.md](CONTRIBUTING.md) — full contributor workflow
- [`docs/development-process.md`](docs/development-process.md) — boards, git and
  review workflow, configuration management, CI
- [`docs/architecture/README.md`](docs/architecture/README.md) — architecture
  views and ADRs
- [`docs/definition-of-done.md`](docs/definition-of-done.md)
- [`docs/testing.md`](docs/testing.md) — testing status and critical modules
- [`docs/customer-handover.md`](docs/customer-handover.md) — customer-facing
  handover state
