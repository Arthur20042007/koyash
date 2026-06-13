# KOYASH

## About the project

KOYASH is a skincare product recommendation service. The user specifies a
budget, ingredient constraints (vegan, cruelty-free, allergens to avoid) and
the skin concerns they want to address, and the service suggests matching
products and assembles them into a routine (cleanse → tone → serum →
moisturize → spf, plus occasional treatments such as exfoliants and masks).

**Who it's for:** people who find it hard to navigate ingredient lists on
their own and want a skincare routine that fits their budget and
constraints (allergies, vegan/cruelty-free preferences).

**Current status:** MVP v0 — a FastAPI backend with rule-based filtering on
top of MongoDB Atlas (`GET /products`, `POST /recommend`). LLM-based
recommendations, authentication, and a frontend are planned.

## Running locally

### Via Docker Compose (recommended)

Requirements: Docker + Docker Compose.

1. Copy `backend/.env.example` to `backend/.env` and fill in `MONGODB_URI`
   with your MongoDB Atlas connection string.
2. From the repository root:

   ```bash
   docker compose --env-file backend/.env up --build
   ```

3. Check:
   - <http://localhost:8000/health> — should return `{"status": "ok"}`
   - <http://localhost:8000/docs> — Swagger UI with the `/products` and `/recommend` endpoints

### Without Docker (backend directly)

Requirements: Python 3.12, pip.

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env   # then fill in MONGODB_URI
uvicorn app.main:app --reload
```

### Database layer (`db/`)

Scripts for loading and checking the MongoDB Atlas data (import from the
source dataset, JSON-schema validators, sanity checks) — see
[db/README.md](db/README.md).

## Documentation

- [db/README.md](db/README.md) — data layer: imports, validators, sanity checks, dataset handling.
- [db/docs/KOYASH_data_transformation_plan.md](db/docs/KOYASH_data_transformation_plan.md) — spec for transforming the source Excel data into MongoDB.
- [reports/week2/mvp-v0-report.md](reports/week2/mvp-v0-report.md) — MVP v0 report.
- `docs/` — general project documentation (currently empty).
- `frontend/` — frontend app (currently empty).

## Deployment

- API + Swagger docs: <https://koyash-production.up.railway.app/docs>
- Demo video: <https://youtu.be/ftTVnoXQvI8>

## Team

| Name | GitHub/GitLab | Role |
| --- | --- | --- |
| Anna | _TODO_ | UX/UI design, frontend implementation |
| Arthur | _TODO_ | Backend implementation; API and recommendation logic support |
| Daria | _TODO_ | Team lead; database structure and data layer support |
| Khasana | _TODO_ | UX/UI design |
| Milana | _TODO_ | UX/UI design, frontend implementation |
