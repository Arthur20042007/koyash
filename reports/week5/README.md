# Week 5 Report — KOYASH (Sprint 3 / MVP v2)

**KOYASH** is a skincare recommendation service: the user answers a guided questionnaire
(skin type, concerns, budget, allergens, ethical preferences, special conditions) and gets a
structured "cosmetic bag" of real products with a per-product justification.

This is the canonical public index for Assignment 5. Items that are produced at release time
are marked **TODO**.

## Sprint at a glance

- **Product Backlog board:** <https://github.com/orgs/Koyash-team/projects/1>
- **Sprint Backlog board (Sprint 3 milestone filter):** <https://github.com/orgs/Koyash-team/projects/1>
- **Sprint 3 milestone:** <https://github.com/Koyash-team/koyash/milestone/3>
- **Sprint dates:** 2026-06-29 – 2026-07-05 (Mon–Sun)
- **Sprint Goal:** MVP v2 — make the budget expectation honest (tier + approximate total),
  add a skin-type mini-quiz, integrate LLM-generated justifications, and apply the customer's
  design/copy feedback; in parallel, document the architecture (static/dynamic/deployment
  views + ADRs) and the development process.
- **Total Sprint size:** ≈ 57 Story Points across the Sprint 3 PBIs (see the board for the
  per-item breakdown).

## Delivered MVP v2 changes

- **Honest budget presentation** — budget options show a tier + an approximate per-product
  price + an approximate whole-set total (no exact ₽ ranges); results show the real total and
  an "approximate price, check the link" note. ([PBI-302](https://github.com/Koyash-team/koyash/issues/103))
- **LLM justification layer** — optional, off by default; gpt-4o-mini rewords the "why" over
  the already-selected products, with a rule-based fallback (ADR-001).
  ([PBI-303](https://github.com/Koyash-team/koyash/issues/104), [US-14](https://github.com/Koyash-team/koyash/issues/18))
- **Special-condition safety filter** — pregnancy / rosacea / dermatitis answers hard-exclude
  products with contraindicated ingredients (deterministic rules, not the LLM).
  ([PBI-312](https://github.com/Koyash-team/koyash/issues/125), [US-20](https://github.com/Koyash-team/koyash/issues/124))
- **Skin-type mini-quiz** — a self-contained 4-question mini-quiz deterministically infers one
  of the 5 supported skin types and pre-fills the skin-type question (still editable); wired into
  both the storytelling and short flows.
  ([PBI-301](https://github.com/Koyash-team/koyash/issues/102), [US-19](https://github.com/Koyash-team/koyash/issues/101))
- **Design & copy** — landing rebuilt to the new Figma (gradient removed, duplicated blocks
  dropped, contacts moved into a casual footer, masculine brand voice, trimmed short-questionnaire
  slides), age-input bounds. ([PBI-304](https://github.com/Koyash-team/koyash/issues/105))
- **Maintained documentation** — architecture views + ADRs, development process, hosted docs.

## Product access

- **Deployed frontend:** <https://koyash-production-25e0.up.railway.app>
- **Deployed API + Swagger:** <https://koyash-production.up.railway.app/docs>
- **Run / setup instructions:** [root README](../../README.md#running-locally)

## Customer feedback response

| Feedback point | Resulting PBI / issue | Status | Response |
|---|---|---|---|
| Bag total rarely matched the exact budget range shown ("ceiling vs coverage?") | [PBI-302](https://github.com/Koyash-team/koyash/issues/103) | Done | Measured real totals; keep coverage-first selection and present budget as an approximate tier + total, with the real total shown in results. |
| Wanted the LLM justifications reviewed for tone/accuracy | [PBI-303](https://github.com/Koyash-team/koyash/issues/104) | Done (accepted for this stage) | Integrated gpt-4o-mini as a justification-only layer with fallback; tone accepted, minor refinements and a possible Gemini switch deferred. |
| Special conditions should affect suitability | [PBI-312](https://github.com/Koyash-team/koyash/issues/125) / [US-20](https://github.com/Koyash-team/koyash/issues/124) | Done | Deterministic ingredient-exclusion rules (e.g. no retinoids in pregnancy); approved by the customer. |
| Landing/copy edits (подбор→опрос, trust column, contacts, trim slides, brand voice) | [PBI-304](https://github.com/Koyash-team/koyash/issues/105) | Done | Landing rebuilt to the new Figma and the copy pass applied on the frontend ([PR #132](https://github.com/Koyash-team/koyash/pull/132)). |
| Skin-type mini-quiz for users who don't know their type | [PBI-301](https://github.com/Koyash-team/koyash/issues/102) / [US-19](https://github.com/Koyash-team/koyash/issues/101) | Done | Flow + design approved and implemented in the frontend for both flows ([PR #132](https://github.com/Koyash-team/koyash/pull/132)). |

**All customer feedback from the 2026-07-03 review was addressed this Sprint:** the copy edits,
landing rework, and the skin-type mini-quiz were implemented in the frontend, and the
special-condition safety filter was delivered. Live price scraping was discussed and dropped as
impractical (customer agreed) — the approximate-price presentation covers it.

## Maintained documentation

- [docs/roadmap.md](../../docs/roadmap.md)
- [docs/definition-of-done.md](../../docs/definition-of-done.md)
- [docs/testing.md](../../docs/testing.md)
- [docs/quality-requirements.md](../../docs/quality-requirements.md)
- [docs/quality-requirement-tests.md](../../docs/quality-requirement-tests.md)
- [docs/user-acceptance-tests.md](../../docs/user-acceptance-tests.md)
- [docs/development-process.md](../../docs/development-process.md)
- [docs/architecture/README.md](../../docs/architecture/README.md)
  - [static view](../../docs/architecture/static-view/) ·
    [dynamic view](../../docs/architecture/dynamic-view/) ·
    [deployment view](../../docs/architecture/deployment-view/)
  - [ADRs](../../docs/architecture/adr/)
- **Hosted documentation site:** <https://koyash-team.github.io/koyash/>

### Architecture summary

A React + Vite frontend calls a FastAPI backend (`POST /recommend`, `GET /products`) over
HTTPS; the backend reads the catalog from MongoDB Atlas and, in MVP v2, optionally calls an
external LLM to reword justifications. Selection is deterministic and rule-based; the LLM only
verbalizes it. The three ADRs each address a quality requirement: **ADR-001** (rule-based
engine + LLM-as-justification-only → QR-001/QR-003), **ADR-002** (MongoDB Atlas → QR-002),
**ADR-003** (discrete budget segments + nearest-segment fallback → QR-002). See
[quality-requirements.md](../../docs/quality-requirements.md) for the QR↔ADR links.

## Testing & CI

All CI gates (backend + frontend lint/format/type-check/build/tests/coverage/QRTs/dependency
scan + Lychee link check) are required on the protected `main` branch and pass.

- **CI pipeline:** [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- **Latest `main` CI run:** _TODO: link the post-merge `main` run for the release commit._
- **Testing status:** [docs/testing.md](../../docs/testing.md)
- **CHANGELOG:** [CHANGELOG.md](../../CHANGELOG.md)

## Release, demo, UAT

- **SemVer release mapped to MVP v2 (`v1.2.0`):** _TODO: create the release and link it._
- **Public sanitized demo video (< 2 min):** _TODO: record and link._
- **Public UAT results summary:** UAT-004 (honest budget) and UAT-005 (LLM justification) were
  customer-executed and passed at the 2026-07-03 recorded review; UAT-001/002/003 remain
  valid. The special-condition filter (delivered post-review) is covered by automated tests
  and awaits a customer-executed UAT next session. Full detail:
  [docs/user-acceptance-tests.md](../../docs/user-acceptance-tests.md).

## Sprint Review & week reports

- [Sprint Review summary](sprint-review-summary.md)
- [Sprint Review transcript](sprint-review-transcript.md) — recorded session; sanitized
  English transcript published here with the participants' permission.
- [Reflection](reflection.md) · [Retrospective](retrospective.md) · [LLM report](llm-report.md)

## Status & next steps

- **Current status:** MVP v2 complete — honest budget presentation, optional LLM justifications,
  special-condition safety filter, skin-type matching, the skin-type mini-quiz, and the landing
  rework + copy pass are all delivered. All planned Sprint 3 work is finished.
- **Next steps (Sprint 4 — final Sprint):** user account, authentication, saving the cosmetic
  bag, and the ability to leave feedback; revisit the LLM prompt/model (possible Gemini switch).

## Contribution traceability

| Team member (GitHub) | Role | Sprint 3 contributions |
|---|---|---|
| [@Dasha365](https://github.com/Dasha365) | Team Lead / Backend & Docs | Maintained documentation (architecture static/dynamic/deployment views + ADRs, development-process doc, hosted docs site, testing/UAT/DoD); LLM justification integration; honest budget-presentation fix; special-condition `conditions` filter; Week 5 reports. |
| [@Arthur20042007](https://github.com/Arthur20042007) | Frontend | Implemented the design in the frontend — the skin-type mini-quiz and the landing rework + copy pass ([PR #132](https://github.com/Koyash-team/koyash/pull/132)). |
| [@fedyann](https://github.com/fedyann) | UX/UI (Design) | Landing and questionnaire design, design refinement, copy edits, and the skin-type mini-quiz questionnaire. |
| [@khas-ab](https://github.com/khas-ab) | UX/UI (Design) | Design and refinement, copy edits, the skin-type mini-quiz questionnaire; Sprint Review transcription. |
| [@millfsw](https://github.com/millfsw) | UX/UI (Design) | Design and refinement, copy edits, and the skin-type mini-quiz questionnaire. |

## Screenshots

Add the following PNGs to the `images/` folder next to this README and they will be embedded
here (filenames are fixed so the embeds resolve):

- `images/sprint-milestone.png` — the Sprint 3 milestone page (issues + progress).
- `images/board.png` — the Product/Sprint board view.
- `images/ci-run.png` — the latest green `main` CI run for the release commit.
- `images/release.png` — the `v1.2.0` release page.
- `images/example-pr.png` — one reviewed, issue-linked PR (e.g. #132) showing the review + green checks.
- `images/hosted-docs.png` — the hosted docs site (`koyash-team.github.io/koyash`).

_TODO: capture the six PNGs above into `images/` (I'll embed them once they're committed)._

## Deviations

- The special-condition safety filter shipped after the customer review, so it is not a
  customer-executed UAT this Sprint (covered by automated tests instead; see above).
- The LLM layer is off by default in production and enabled by configuration for demos/review.
