# MVP v0 Report

**Purpose and description of the foundation:**
A runnable technical foundation for the KOYASH backend. Built with FastAPI, it
provides automatically generated Swagger documentation and is configured to
work with a MongoDB Atlas database to serve the product catalog and rule-based
filtering. It is a product foundation, not a complete user story.

**Deployment URL / artifact link:**
<https://koyash-production.up.railway.app/docs>

**Public video demonstration link:**
<https://youtu.be/ftTVnoXQvI8>

**Relationship to the prototype and MVP v1 stories:**

- MVP v0 is the backend foundation and is separate from the Figma prototype: it
  does not reproduce the prototype UI. The prototype communicates the proposed
  MVP v1 experience, while MVP v0 provides the data and filtering that the
  prototype's screens will call in MVP v1.
- `GET /products` serves the real catalog — the data foundation behind US-04
  (a bag of real, existing products).
- `POST /recommend` implements the basic rule-based filtering. Its hard filters
  map to the MVP v1 scope stories: budget segment (US-03), ethical preferences
  via `vegan` / `cruelty_free` (US-07), and allergen exclusion (US-08), feeding
  the cosmetic-bag assembly (US-04).
- The questionnaire (US-02) and ordered grouping by application step (US-06)
  are frontend / MVP v1 work and are not part of MVP v0.
- All documented endpoints are implemented against real data; none are mocked.

**Current limitations, placeholders, mocks:**

- No LLM integration yet (recommendations currently rely only on hard
  database filters: segment, vegan, cruelty_free, allergens_norm).
- Authentication and saving user profiles are not implemented.
- `GET /products` returns all 69 products without pagination (MVP v0
  limitation).

**Link to local setup instructions:**
See the [root README](../../README.md).

**Access for the TA:**
The hosted API is public and requires no credentials. The primary smoke check
below needs no local setup.

**Smoke-check scenario (hosted — primary, no setup required):**

- **Access:** open the deployment URL — <https://koyash-production.up.railway.app/docs>
  (Swagger UI, public).
- **Steps:**
  1. Open `/docs` and confirm Swagger UI loads.
  2. Send a `GET /health` request via Swagger UI.
  3. Send a `GET /products` request via Swagger UI.
- **Expected result:** `/docs` loads successfully; `/health` returns status
  200; `/products` returns JSON with real documents from the MongoDB Atlas
  collection.

**Smoke-check scenario (local — alternative):**

- **Access:** <http://localhost:8000/docs> after starting the containers.
- **Steps:**
  1. Run `docker compose --env-file backend/.env up --build` from the
     repository root (see the root README for `.env` setup; use
     `.env.example` as the template — real secrets are not committed).
  2. Open `/docs`, then send `GET /health` and `GET /products` via Swagger UI.
- **Expected result:** the containers start without errors; `/health` returns
  status 200; `/docs` loads; `/products` returns JSON with real documents from
  the MongoDB Atlas collection.