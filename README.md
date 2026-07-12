# KOYASH

A skincare recommendation service. You answer a short questionnaire — budget,
ingredient constraints (vegan, cruelty-free, allergens to avoid), skin type and
the concerns you want to address — and KOYASH assembles a "cosmetic bag" of real
products into a routine (cleanse → tone → serum → moisturize → SPF, plus
occasional treatments), explaining **why** each product is there.

> **Try it:** <https://koyash-production-25e0.up.railway.app> ·
> **API docs:** <https://koyash-production.up.railway.app/docs> ·
> 📖 **Documentation:** <https://koyash-team.github.io/koyash/>

**Who it's for:** people who find ingredient lists hard to navigate and want a
routine that fits their budget and constraints.

**Current state — `MVP v3`.** A rule-based engine on MongoDB Atlas builds the
bag, with an optional LLM layer that only rewords the justification (never the
selection). On top of that, signed-in users get a **personal account** — a
profile card, one saved cosmetic bag with «worked / didn't work» feedback,
product replacement, and a result tracker — while the questionnaire → bag flow
stays available to guests. The app is deployed on Railway (which redeploys from
`main`) with MongoDB Atlas as the datastore. See the [roadmap](docs/roadmap.md)
and [customer handover](docs/customer-handover.md).

## Access the product

- **Web app:** <https://koyash-production-25e0.up.railway.app>
- **API + Swagger:** <https://koyash-production.up.railway.app/docs>
- **Demo video (MVP v1):** <https://youtu.be/SDuBlborKr0>

No account is needed to get a recommendation — signing in only adds the personal
features.

## Run it locally

Requirements: Python 3.12 and Node.js 20+ (or Docker).

```bash
# backend
cd backend
pip install -r requirements.txt
cp .env.example .env          # fill MONGODB_URI, set a JWT_SECRET
uvicorn app.main:app --reload # http://localhost:8000/docs

# frontend (second terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

With Docker Compose instead:

```bash
docker compose --env-file backend/.env up --build
```

Check <http://localhost:8000/health> — it should return `{"status": "ok"}`.
Full setup, verification commands, and the contribution workflow are in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

📖 **Hosted documentation site:** <https://koyash-team.github.io/koyash/> — a
browsable version of everything below.

- [Customer handover](docs/customer-handover.md) — access, configuration,
  limitations, and the current handover status
- [Architecture overview and ADRs](docs/architecture/README.md) — static,
  dynamic, and deployment views
- [Development process](docs/development-process.md) — boards, git and review
  workflow, configuration management, CI
- [Testing status](docs/testing.md) · [Quality requirements](docs/quality-requirements.md)
  · [Quality requirement tests](docs/quality-requirement-tests.md)
- [User acceptance tests](docs/user-acceptance-tests.md) ·
  [Definition of Done](docs/definition-of-done.md)
- [Roadmap](docs/roadmap.md) · [User stories](docs/user-stories.md) ·
  [CHANGELOG](CHANGELOG.md)
- [`db/`](db/README.md) — data layer: catalog import, JSON-schema validators,
  sanity checks
- [`reports/`](reports/) — weekly course reports

## Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, verification commands, branch/PR
  workflow, review and merge rules
- [AGENTS.md](AGENTS.md) — operating guide for coding agents

Secrets are never committed: `.env` files are git-ignored and only the sanitized
`*.env.example` templates live in the repository.

## License

[MIT](LICENSE)
