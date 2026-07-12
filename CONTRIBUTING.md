# Contributing to KOYASH

This guide is for people contributing code or documentation to KOYASH. It
complements the [README](README.md) (the project's entry point) and describes
how we actually work. For coding agents, see [AGENTS.md](AGENTS.md).

The full picture lives in [`docs/development-process.md`](docs/development-process.md);
this page is the short, practical version.

## Prerequisites

- **Backend:** Python 3.12, pip
- **Frontend:** Node.js 20+, npm
- Optional: Docker + Docker Compose

## Set up

```bash
# backend
cd backend
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env          # fill MONGODB_URI, set a JWT_SECRET
uvicorn app.main:app --reload # http://localhost:8000/docs

# frontend (in a second terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

The frontend calls `http://localhost:8000` by default; override with
`VITE_API_URL` in `frontend/.env`. See the
[README](README.md#run-it-locally) for the Docker Compose alternative.

## Verify before you open a PR

Run the same gates CI runs — a red PR cannot be merged.

```bash
# backend (from backend/)
python -m pytest                    # full suite + coverage gate (critical modules ≥30%)
python -m pytest -m qrt             # quality requirement tests only
python -m ruff check .              # lint
python -m mypy app                  # type check
python -m pip_audit -r requirements.txt

# frontend (from frontend/)
npm run lint
npm run format:check
npm test
npm run build
npm audit --omit=dev
```

CI additionally runs **Lychee** over every Markdown file in the repository, so
keep links valid. A few links are deliberately excluded (local `localhost:8000`
URLs and `youtu.be` links, which block automated clients) — the exclusions and
their justification live in [`lychee.toml`](lychee.toml).

## Branch, commit, and PR workflow

1. **Start from an issue.** Every change is issue-linked. Use the
   *User Story* or *Other PBI* issue template — blank issues are disabled. Fill
   in the implementer, reviewer, acceptance criteria, and (for PBIs) story
   points.
2. **Branch off `main`**, named after the issue:
   `<issue-number>-<short-slug>` (e.g. `140-auth-backend`). Repository chores
   without an issue use `chore/<short-slug>`.
3. **Commit** in Conventional Commits style with a scope, e.g.
   `feat(backend): …`, `docs(architecture): …`, `test(quality): …`,
   `fix(deps): …`.
4. **Open a PR** using the repository PR template. Reference the issue with
   `Closes #<n>` so it closes on merge. Keep the PR scoped to one PBI, fill in
   the acceptance-criteria checklist, and link your evidence (test output, CI
   run, screenshots).

## Review and merge

`main` is protected. To merge, a PR needs:

- **one approving review from another team member** — you cannot approve your
  own PR, so the reviewer is always someone other than the implementer;
- **all CI checks green** (11 required jobs: backend lint/type/build/tests+QRTs/
  dependency scan, Lychee, and the five frontend jobs);
- the branch **up to date with `main`**;
- review threads resolved.

Force-pushes and branch deletion are blocked, and administrators cannot bypass
these rules. Review substantively: leave comments on what you actually checked,
not just an approval.

A change is finished only when it meets the
[Definition of Done](docs/definition-of-done.md).

## Configuration and secrets

- **Never commit secrets.** `.env`, `*.env`, and `.env.*` are git-ignored; the
  sanitized templates `backend/.env.example` and `db/.env.example` are the only
  committed examples.
- Backend runtime configuration comes from environment variables:
  `MONGODB_URI`, `MONGO_DB_NAME`, `JWT_SECRET` (sign JWTs — override the
  dev-only default in production), and the optional LLM settings.
- The **customer-authored LLM system prompt is not published**: keep it in the
  git-ignored `backend/llm_system_prompt.txt` or the `LLM_SYSTEM_PROMPT`
  variable (see `backend/llm_system_prompt.example.txt`).
- Deployment secrets live in the Railway project environment and GitHub Actions
  secrets, never in the repository.
- Use only **sanitized demo data** in screenshots, demos, and public documents —
  no real names, emails, phone numbers, or customer-identifying details.

## Keep the maintained documentation current

When your change affects behaviour, update the relevant maintained docs in the
same PR:

- [`docs/architecture/`](docs/architecture/README.md) — views and ADRs
- [`docs/quality-requirements.md`](docs/quality-requirements.md) and
  [`docs/quality-requirement-tests.md`](docs/quality-requirement-tests.md)
- [`docs/testing.md`](docs/testing.md) — testing status
- [`docs/user-acceptance-tests.md`](docs/user-acceptance-tests.md)
- [`docs/roadmap.md`](docs/roadmap.md) and
  [`docs/user-stories.md`](docs/user-stories.md)
- [`docs/customer-handover.md`](docs/customer-handover.md) — when access,
  configuration, limitations, or handover status change
- [`CHANGELOG.md`](CHANGELOG.md) — for user-visible changes
