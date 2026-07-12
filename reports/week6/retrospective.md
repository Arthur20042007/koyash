# Sprint 4 Retrospective

*Sprint 4 delivered the personal-account layer as the Week 6 trial release (`v1.3.0`):
registration/sign-in, a profile card, one saved cosmetic bag with «worked / didn't work»
feedback, product replacement, a result tracker, and account management — with the
questionnaire → cosmetic-bag flow kept fully available to guests. In parallel, the
customer-facing documentation set (README, CONTRIBUTING, AGENTS, `docs/customer-handover.md`)
was produced and reviewed with the customer.*

## What went well

- The account backend landed as a stack of **small, issue-linked, peer-reviewed PRs** —
  authentication, then profile/bag persistence, feedback, single-step replacement, the result
  tracker, and account security — each its own issue and PR rather than one batch, so CI
  feedback stayed fast and `main` stayed releasable throughout.
- **Branch protection on `main` was hardened before the account work landed** (one required
  approving review, all 11 CI checks, up-to-date branch, no force-push, no admin bypass), so
  the entire layer went in under review.
- **Guest-first held.** Optional auth on `/recommend` means an invalid or expired token
  persists nothing and never returns 401 there, so the account is a genuine add-on that never
  gates the core flow.
- **Safety-relevant behaviour stayed deterministic and tested:** credential confidentiality
  (QR-004 — passwords only as bcrypt hashes, never returned) shipped with tests, and the
  account modules sit at 91–100% line coverage.
- **The Week 6 customer trial validated the whole flow end-to-end,** and the feedback was
  concrete and immediately actionable (square logo, "finish the frontend", the mail-domain
  route to password reset, the Telegram-bot plan for reminders, US-11 via the LLM prompt).
- The customer-facing documentation set was reviewed with the customer and **accepted**
  ("it all looks fine").

## What did not go well

- **The frontend was compressed to the end of the Sprint again.** The backend was ready
  mid-Sprint, but the account UI polish (matching the Figma design) and the switch of the
  deployment to the team's `main` repository landed only at the Week 6 boundary and into early
  Week 7 — so the customer saw a not-yet-fully-polished UI at the review.
- Because the main-repository deployment was not ready in time for the meeting, the customer
  trialed a **preview build** rather than the production `main` deployment, which added
  avoidable coordination overhead.
- The Week 6 SemVer trial release (`v1.3.0`), the `CHANGELOG` entry, and the report set were
  assembled right at the Sprint boundary rather than incrementally.

## What the team changed or attempted to change based on the previous Sprint Retrospective, and what results they observed

- **Sprint 3 AP1 (start frontend integration as soon as a design is agreed; pair
  design/frontend):** *partially applied.* The design was ready and the backend was built
  early, but frontend integration still concentrated near the end of the Sprint — the same
  compression recurred. Result: not resolved; carried forward as this Sprint's AP1.
- **Sprint 3 AP2 (agree the final LLM model and prompt with the customer up front):**
  *deferred.* Sprint 4 had little LLM work; the irritant-warning feature (US-11) was scoped
  with the customer this review ("add it to the prompt and experiment") and moved to Sprint 5,
  where this action point now applies.
- **Sprint 3 AP3 (final Sprint — scope tightly and sequence so everything lands with time for
  a release):** *partially applied.* The backend sequencing worked well (clean stacked PRs),
  but the frontend and the release timing were tight, with the trial release cut at the
  boundary.

## Action points

1. In Sprint 5, treat **"deployed from `main` with the UI matching the design"** as the
   Sprint's *first* milestone, not its last — so the final customer confirmation and the
   `MVP v3` release are not compressed into the deadline.
2. **Assemble the release and the weekly report incrementally through the Sprint** — update
   `CHANGELOG.md` on each user-visible PR and keep the report index current — instead of one
   end-of-Sprint push.
