# Customer Review Summary — Sprint 1 (MVP v1)

**Date:** <20.06.2026>
**Participants (roles):** Customer; Team 11 — Team Lead, Backend, Frontend (×2), UX/UI. 
**Related evidence:** [customer-review-transcript.md](customer-review-transcript.md)
· [docs/user-stories.md](../../docs/user-stories.md) · [deployed MVP v1](https://koyash-production-25e0.up.railway.app) · [Figma design](https://www.figma.com/proto/gxD8JwhZ2WBUhjKdNV6JIC/KOYASH?page-id=842%3A2&node-id=855-171&viewport=-3146%2C94%2C0.56&t=8dXsi0ZzWn0yC3SJ-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=855%3A171&show-proto-sidebar=1)

---

## Artifacts demonstrated

- Deployed MVP v1 increment: storytelling questionnaire → rule-based recommendation
  → ordered, justified cosmetic bag.
- Updated design (questionnaire and results screens) under the handwriting logo.
- The "no results" / empty-state screen and the short design questionnaire.
- Product Backlog and Sprint Backlog boards.

## Scope reviewed

- The planned MVP v1 scope (US-02–US-08, US-17) and the implemented increment.
- One new user story added since Assignment 2: US-17 — a user with specific skin
  concerns wants matching products.
- PBI numbering and the user-story / supporting-PBI decomposition were walked through
 

## Implemented increment discussed

- Rule-based filtering is working end-to-end; the customer reacted positively to
  seeing live filtering.
- Per-product justification is present.
- MVP v1 deliberately omits skin type, age, and LLM reasoning, consistent with the agreed scope.

## Approvals

- **MVP v1 scope and increment: explicitly approved** by the customer at the review.
- Repository transcript publication: obtained.
- Recording permission: obtained.

## Requested changes (design and copy)

- Make buttons smaller; the heart icons are too small to notice — adjust later.
- Restore a softer gradient / blurred-circle background and retry the brush-stroke
  accent; the current version reads as "too plain."
- Replace the word «аптечный» (pharmacy-like) — it can read as a mass-market trigger.
- Move the "daily" routine element toward the middle of the layout.
- Surface the history/UI entry point earlier, before the quick selection.
- Move "select suitable" onto a second line; it takes too much space.
- Minor skin-section copy cleanup (remove dashes, clearer wording); grammar fixes
  are non-critical.

## Action points

| ID | Action | Owner |
| :-: | :-- | :-- |
| A1 | Produce 3–5 sample `/recommend` input/output JSON pairs and send to the customer | Backend |
| A2 | Apply review design feedback (buttons, gradient/brush, layout) | Frontend / UX |
| A3 | Replace «аптечный» and clean skin-section microcopy | UX / copy |

## Risks

- No automated tests yet for the recommendation engine; edge cases are hand-verified.

## Resulting Product Backlog / scope changes

- MVP v1 scope confirmed as delivered and approved; no scope was cut.
- Post-MVP direction reconfirmed: skin-type markup (US-09) and the LLM reasoning
  phase (US-14). The customer will provide the LLM key and a base prompt at the
  LLM stage.
- Design feedback folded into the next Sprint's backlog (landing/design polish, US-01).