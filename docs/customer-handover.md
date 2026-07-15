# Customer Handover

This is the customer-facing handover document for KOYASH. It describes the
**current** state of the product: how to reach it, what is configured, what is
not finished, and what still has to happen before the handover is complete.

It is a maintained document — it is updated whenever access details,
configuration, limitations, or the handover status change.

## Current status and handover scope

KOYASH is a **hosted web service**: the user answers a questionnaire and gets a
personalized "cosmetic bag" of real products with a justification for each one.
Nothing needs to be installed to use it.

**What is delivered today**

- A landing page, a storytelling questionnaire and a short questionnaire, plus a
  skin-type mini-quiz for users who do not know their skin type.
- A rule-based recommendation engine that builds the routine (cleanse → tone →
  serum → moisturize → SPF, plus occasional steps) from the user's budget,
  ethical preferences, allergens, skin concerns, skin type, and special
  conditions (pregnancy / rosacea / dermatitis).
- A per-product justification, optionally reworded by an LLM (off by default —
  it never changes which products are selected).
- The **personal account** (`MVP v3`): registration and sign-in (email +
  password), a profile card from the latest questionnaire, one saved cosmetic
  bag with per-product «worked / didn't work» feedback, product replacement, a
  result tracker, and account management (edit details, change password, delete
  account). The questionnaire → cosmetic-bag flow stays fully available without
  an account — signing in is optional.

**Handover scope.** The team hands over the running service, the source
repository, and the maintained documentation. Operational ownership of the
hosting and database accounts is **not** transferred yet (see
[Remaining actions](#remaining-actions)).

## How to access and use the product

| What | Where |
|---|---|
| The product (web app) | <https://koyash-production-25e0.up.railway.app> |
| API and interactive docs (Swagger) | <https://koyash-production.up.railway.app/docs> |
| Maintained documentation site | <https://koyash-team.github.io/koyash/> |
| Source repository | <https://github.com/Koyash-team/koyash> |

Open the web app, press "Подобрать уход", answer the questionnaire, and the
service assembles the routine. No account is required — signing in is optional
and only adds the personal features (saved bag, feedback, replacement,
tracker).

The interface is in Russian and is designed desktop-first. A note on the
landing page states that recommendations are informational, are not medical
advice, that a patch test is recommended, and that skin conditions need a
dermatologist.

## Deployment and installation

You do not need to deploy anything to use the product. For reference, this is
how it runs today:

- **Railway** hosts two services: the frontend (Vite build) and the backend
  (FastAPI in a Docker image). Railway is connected to the GitHub repository and
  redeploys from `main`, so merging a reviewed pull request is what ships a
  change to the customer-facing environment.
- **MongoDB Atlas** (managed) stores the product catalog and the account data
  (`products`, `users`, `care`, `tracker`).
- The product catalog is loaded offline from the source dataset with the scripts
  in [`db/`](../db/README.md); this is not part of the running service.

To run the whole thing locally (for evaluation or a future self-hosted setup),
follow [Run it locally](../README.md#run-it-locally) in the README.

## Configuration and secrets

The backend is configured entirely through environment variables. **No secret is
stored in the repository** — only sanitized templates (`backend/.env.example`,
`db/.env.example`) are committed, and `.env` files are git-ignored.

| Variable | Purpose | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `MONGO_DB_NAME` | Database name | No (has a default) |
| `JWT_SECRET` | Signs the sign-in tokens. **Must** be a strong random value in production | Yes in production |
| `LLM_ENABLED`, `LLM_API`, `LLM_BASE_URL`, `LLM_MODEL` | Optional LLM rewording of the justification text | No (off by default) |
| `LLM_SYSTEM_PROMPT` | The customer-authored prompt. Never committed — supplied via this variable or a git-ignored file | Only if the LLM is enabled |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SSL` | Outgoing mail server for the password-reset email. `SMTP_SSL=true` uses the SSL/TLS port (usually 465); `false` uses the plain port (usually 587) with STARTTLS | Yes, for password reset |
| `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Mailbox account, its password, and the "from" address on the project's mail domain. **Secret — environment only** | Yes, for password reset |
| `FRONTEND_URL` | Where the reset link in the email points (the deployed web app) | Yes, for password reset |
| `RESET_TOKEN_TTL_MINUTES` | How long a reset link stays valid | No (defaults to 30) |
| `VITE_API_URL` | Frontend build-time pointer to the backend | Yes (frontend) |

Live values are held in the Railway project environment (and GitHub Actions
secrets for CI). If a secret is ever exposed, rotate it in Railway/Atlas and
redeploy; nothing needs to change in the repository.

## Operational notes

- **Shipping a change** = merging a reviewed pull request into `main`. The
  protected branch requires one approving review from another team member and
  all CI checks (lint, type check, tests, quality-requirement tests, coverage,
  dependency scans, link check) to pass; Railway then redeploys from `main`.
- **The LLM is off by default.** Enabling it requires an API key and the
  customer-authored prompt; if the provider fails, the service silently falls
  back to the rule-based justification text.
- **Data.** Product data is loaded offline. Account data is created by users at
  runtime; deleting an account removes that user's profile, saved bag, and
  tracker.
- Passwords are stored only as bcrypt hashes and are never returned by the API.
- **Password reset** emails a single-use link from the project's mail domain. The
  link expires after 30 minutes, and only a digest of it is stored — so a copy of
  the database does not yield a usable reset link. Requesting a reset for an
  address that has no account looks exactly the same to the caller (same answer,
  same response time — the mail is sent in the background), so the form cannot be
  used to find out who is registered.
- **How the reset email is delivered.** The service sends the reset link over SMTP
  from the project's own mail domain, in a background task so the user never waits
  on the mail server. Note that some hosting plans **block outbound SMTP** (ports
  25 / 465 / 587) to prevent spam; if the reset email is not being delivered from
  the deployed environment, confirm with the host that outbound SMTP is permitted
  for the service.

## Troubleshooting and support

| Symptom | What it means / what to do |
|---|---|
| The web app loads but recommendations fail | The backend may be redeploying. Check <https://koyash-production.up.railway.app/health> — it should return `{"status": "ok"}`. |
| "Nothing found" after the questionnaire | Expected behaviour, not a crash: the combination of budget, ethics, and allergens left no products. Relax one filter. The high budget segment has only 3 products in the catalog. |
| A routine step is missing from the bag | The catalog has no product for that step under the chosen filters; the service leaves the step empty rather than substituting something unsafe. |
| Justifications look short / plain | The LLM rewording layer is disabled or unavailable; the rule-based text is used. |
| Forgot the account password | Use "Забыли пароль?" on the sign-in screen: a reset link is emailed from the project's mail domain. The link works once and expires after 30 minutes; if it has expired, just request a new one. Check the spam folder if the mail does not arrive. |

For anything else, open an issue at
<https://github.com/Koyash-team/koyash/issues> or contact the team through the
usual course channel.

## Known limitations, unfinished areas, and risks

- **Sign-in tokens last 7 days and cannot be revoked early**, and are stored in
  the browser. This is an accepted trade-off for a lightweight account layer.
- **One saved cosmetic bag per user.** Re-taking the questionnaire overwrites
  it, and the previous feedback and replacements are cleared.
- **At most two replacements per routine step.**
- **The result tracker has no reminders.** It has 6 checkpoints over 12 weeks
  that unlock by date; nothing notifies the user when one opens.
- **The catalog is small and uneven** (69 products; only 3 in the high budget
  segment), so some filter combinations legitimately return nothing or leave a
  step empty.
- **Desktop-first.** There is no dedicated mobile version.
- **Not medical advice.** The product does not analyse ingredient safety beyond
  the deterministic allergen and special-condition filters, and makes no medical
  claims.
- **Operational risk.** Hosting, database, and the optional LLM key are still on
  team-owned accounts. If they lapse after the course, the service stops.

## Handover status

**Current level reached: `Ready for independent use`.**

The product is deployed, publicly reachable, and requires no installation or
technical setup from the customer, and the maintained documentation describes
how to access, configure, and operate it.

At the **Week 6 review (2026-07-11)** the customer trialed the release, confirmed
she had tried the version herself, and approved the design and functionality.
The frontend polish discussed there has since shipped in Sprint 5, and the
customer-facing deployment now redeploys from the team repository's `main`. The
two stronger levels are **not** reached yet:

- `Independently used by customer` — the customer has trialed it but does not yet
  use it in her own work: the product targets end users rather than the customer
  herself, and as a brand it still needs further work.
- `Deployed or operated on customer side` — not deployed on her side; hosting,
  database, and LLM credentials are still owned by the team.

This status is re-assessed after the Week 7 final transition.

## Remaining actions

| Action | Blocks full transition? |
|---|---|
| Keep the mail-domain credentials valid (they power the password-reset email). Tracker reminders stay out of scope — the customer runs them from her own Telegram bot | No — but password reset stops working if the mailbox password changes |
| Deliver the final `MVP v3` release in Week 7 | Yes |
| Transfer operational ownership (Railway project, MongoDB Atlas cluster, optional LLM API key) to the customer | Yes, for `Deployed or operated on customer side` |

## Related documentation

- [README](../README.md) — entry point, access links, local setup
- [Architecture overview and ADRs](architecture/README.md)
- [Development process](development-process.md) — workflow, configuration, CI
- [Testing status](testing.md) and
  [quality requirements](quality-requirements.md)
- [User acceptance tests](user-acceptance-tests.md)
- [Roadmap](roadmap.md)
- [CHANGELOG](../CHANGELOG.md)
