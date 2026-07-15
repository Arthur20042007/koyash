# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Password reset (US-27).** «Забыли пароль?» now works: the service emails a
  reset link from the project's own mail domain, and the link opens a screen for
  setting a new password. The link is **single-use** and expires after 30 minutes,
  and requesting a reset for an unknown address responds exactly like a known one,
  so the form cannot be used to discover who is registered. Changing the password
  while signed in also invalidates any reset link that is still outstanding.

### Fixed

- The password-reset email now goes out through the [Resend](https://resend.com)
  HTTPS API instead of raw SMTP. Railway blocks outbound SMTP (ports 25/465/587)
  on its Free/Hobby plans, so the previous smtplib-based sender could never
  actually deliver from the deployed backend — see
  https://railway.com/deploy/resend-email-railway. The `SMTP_*` environment
  variables are replaced by `RESEND_API_KEY` (and `MAIL_FROM` is reused as the
  verified sender address).
- The «Забыли пароль?» screens previously showed «Письмо отправлено!» and «Готово!»
  without contacting the backend at all — no email was ever sent and no password was
  ever changed. Both screens are now wired to the real endpoints.
- «Отправить ссылку» no longer hangs while the mail is being sent: the email goes out
  in the background, so the screen responds immediately. This also removes a timing
  side channel — a request for a registered address used to take visibly longer than
  one for an unknown address, which gave away which emails have accounts.

### Added

- «Мой кабинет» button on the results screen, linking straight into the personal
  account (matches the landing's cabinet button).

### Changed

- The personal-cabinet profile card shows the questionnaire allergen categories
  («Силиконы», «Отдушки», …) under «Аллергии» instead of the expanded list of
  excluded ingredients.

## [1.3.0] - 2026-07-12

Week 6 trial / handover-candidate release for Assignment 6 — the personal-account
layer. The questionnaire → cosmetic-bag flow stays fully available to guests;
signing in is optional and only adds the personal features.

### Added

- **Accounts (optional).** Registration and sign-in with email + password (name
  required; age and phone optional; phone is stored but not used for auth).
  Registration signs the user in immediately. A guest's freshly generated
  cosmetic bag is carried into the account on sign-up / sign-in.
- **Profile card** built from the latest questionnaire — age, skin type,
  concerns, allergens, budget, preferences (vegan / cruelty-free / minimalism)
  and special conditions — plus a pickable profile avatar.
- **One saved cosmetic bag** per account («Текущий уход»): the questionnaire
  saves/overwrites it, and it shows the routine as after the questionnaire.
- **«Подошло / Не подошло» feedback** per product; a comment is required on
  «Не подошло», and the bag sum counts only active products.
- **Product replacement** — swap a product marked «Не подошло» for a similar one
  in the same routine step (up to 2 per step; the replaced product is dimmed and
  kept with its comment). If no alternative fits, the current product stays.
- **Result tracker** — 6 checkpoints over 12 weeks with criteria derived from
  skin type and concerns, an overall rating and a result history; future
  checkpoints unlock by date and only the active one is editable.
- **Account management** — edit personal data, change the password while signed
  in, and delete the account (password-confirmed; removes the profile, saved bag
  and tracker).

### Changed

- The customer-facing deployment now redeploys from the team repository's `main`.
- Authentication design recorded in ADR-004 (guest-first, bcrypt + JWT).

### Security

- Passwords are stored only as bcrypt hashes and are never returned by the API
  (QR-004). Sign-in uses a 7-day JWT held in the browser.

## [1.2.0] - 2026-07-05

### Added

- Skin-type mini-quiz: on the skin-type question, a "Узнать свой тип кожи" button opens a
  self-contained 4-question mini-quiz that deterministically infers one of the 5 supported skin
  types and shows a short result screen, then returns the user to the skin-type question with the
  inferred type pre-selected (still editable before continuing). Wired into both the storytelling
  and the short questionnaire flows.
- Special-condition safety filter: the questionnaire's condition answers (pregnancy / rosacea /
  dermatitis) are now sent to `POST /recommend`, which hard-excludes products whose ingredients are
  contraindicated for a declared condition (e.g. retinoids during pregnancy), like the allergen
  filter. Deterministic ingredient-level filtering (not medical advice); the ingredient mapping is
  maintained from common cosmetic-safety guidance per condition. `age`/`experience` remain
  statistics-only and are not used in selection.
- Optional LLM-generated product justifications: when enabled, `POST /recommend` passes each
  already-selected product's context (skin type, concerns, step, translated key actives,
  concern_match) to an LLM (default `gpt-4o-mini`) to reword the "why" text
  (`justification.summary_ru`) in a warmer, human style. The LLM only verbalizes the rule-based
  decision — it never changes what is selected (ADR-001) — is called per product concurrently,
  and falls back to the rule-based text on any error. Off by default (`LLM_ENABLED=false`); the
  customer-authored system prompt is loaded from config and not committed to the repository.

### Changed

- Budget step in both questionnaires (storytelling and short) now describes each budget as a
  tier with an approximate per-product price and an approximate whole-set total (e.g.
  "Бюджетно · до 1 000 ₽/шт · набор ≈ 4 000 ₽") instead of exact basket ranges (3 500 / 8 000 ₽)
  that the assembled bag rarely matched. The recommendation/selection logic is unchanged.
- Results screen now notes that prices are approximate and may differ in store — the current
  price is available via each product's link.
- Landing page rebuilt to the updated Figma: shorter canvas, gradient/background removed,
  duplicated blocks dropped, contacts moved into a casual footer (the abrupt "hat" block removed),
  and the brand voice unified to a masculine "Koyash …" (instead of "Солнце/Солнечный луч").
  The short-questionnaire slides were trimmed and assets re-exported at higher resolution.
- Age input in both questionnaires is now bounded to 10–100 with an inline validation error
  (`age`/`experience` remain statistics-only and do not affect selection).

## [1.1.0] - 2026-06-28

### Added

- Skin-type preference in `POST /recommend`: within the user's budget segment, products matching the
  stated `skin_type` (or tagged `any`) are preferred over mismatched ones. If a step has no product of
  the user's skin type, the engine falls back to `any`-type products in the same segment; if neither
  exists the step is left empty instead of taking a mismatched product. `RecommendRequest` accepts an
  optional `skin_type` (normal / dry / oily / combination / sensitive); `Product` carries the `skintype`
  tags. Hard filters (vegan, cruelty-free, allergens) run first and are never relaxed by skin-type matching.
- The storytelling questionnaire now sends the user's `skin_type` answer to `POST /recommend`
  (the question existed on screen already; the request payload didn't include it before).
- Short, non-storytelling questionnaire variant at `/quick`: same questions as the
  storytelling flow (including skin type), without the narrative framing; shares the
  same `/recommend` request-building and results screen, so identical answers produce
  an identical cosmetic bag regardless of which variant the user takes.
- Landing page (`/`): full build per the Figma design — hero, problem/solution section,
  "smart selection" and "why trust Koyash" sections, how-it-works steps, and entry points
  into the storytelling and short questionnaire flows.

### Changed

- Storytelling questionnaire and results screen: consolidated the per-screen quiz
  components into a single generic step component, reworked button and heart-icon
  styling, and fixed budget-screen copy ("аптечном" → "обычном") per customer review
  feedback.

## [1.0.0] - 2026-06-21

### Added

- Questionnaire + results frontend (React + Vite): intro, concerns, budget, allergens, and
  values screens, wired end-to-end to the deployed `POST /recommend` backend; results screen
  renders the ordered cosmetic bag with per-product justification and frequency.
- `POST /recommend` — recommendation engine that assembles a personalised cosmetic bag from the quiz result.
  Accepts `budget` (low / mid / high), `concerns`, `vegan`, `cruelty_free`, `minimalism`, `allergens`.
  Returns an ordered `bag` of products with `meta.total_price_rub`.
- Per-step segment fallback: each routine step is matched against the user's own budget segment first; if that
  segment has no candidate for the step, the engine falls back to the nearest segment via the explicit
  `SEGMENT_PRIORITY` table (`low → mid → high`, `mid → low → high`, `high → mid → low`). Hard filters
  (vegan, cruelty-free, allergens) are applied before the segment search and are never relaxed by the fallback.
  Substituted steps are reported in `meta.note` ("Шаги без точного совпадения по бюджету: …").
- `justification` block in each `BagItem`: `role` (localised step name + index), `what_it_does` (up to 3 phrases from `functional_category`), `key_actives` (up to 3 from `main_actives_short`), `why_for_you` (matched concern phrases + vegan/CF/allergen flags).
- `frequency` field in `ProductOut`: human-readable usage frequency in Russian (e.g. "Ежедневно", "2–3 раза в неделю").
- `image_url` (nullable) in `Product` and `ProductOut`.
- `empty_steps` list in `meta`: core steps with zero candidates in any segment, after hard filters.
- `db/seeds/patch_image_url.py` — idempotent script for manually patching `image_url` per product ID. Dry-runs when `IMAGE_URLS` dict is empty.
- `backend/app/core/active_translations.py`: `ACTIVE_NAME_RU` map + `translate_active()`. `main_actives_short` mixes Russian phrasing with raw Latin INCI names depending on how the source row was filled in; `ProductOut.main_actives_short` and `justification.key_actives` are now translated to Russian before leaving the API, since there's no frontend yet to do that transformation.
- `justification.summary_ru`: `why_for_you` joined into a single ready-to-display Russian sentence, for consumers that want one string instead of a list.

### Changed

- `POST /recommend` request schema: replaced `segment` filter with `budget` + `concerns` + `minimalism` fields.
- `ProductOut` response model: exposes `main_actives_short` and `concerns_addressed`; hides `allergens_norm` and other internal fields.
- `BagItem` no longer contains `routine_step` or `order_index` — those fields live in `BagItem.product` (`ProductOut`) only, eliminating duplicate keys in the response.
- Dockerfile `CMD` updated to `${PORT:-8000}` for Railway `$PORT` compatibility.

### Fixed

- `justification.why_for_you` no longer contains the English literal `"Cruelty-free"` — now «Не тестируется на животных».
