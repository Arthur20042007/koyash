# Week 6 Reflection

*Sprint 4 delivered the personal-account layer as the Week 6 trial (`v1.3.0`) — accounts, a
profile card, one saved cosmetic bag with «worked / didn't work» feedback, product
replacement, a result tracker, and account management — with the guest questionnaire →
cosmetic-bag flow preserved, plus the customer-facing documentation set reviewed with the
customer.*

## Learning points

- **Authentication touches every layer, so it pays to design it first.** Adding *optional*
  auth to a guest-first API meant threading a `get_optional_user` dependency through
  `/recommend` and gating every account endpoint, while guaranteeing that guests and
  invalid/expired tokens persist nothing and never see a 401 on `/recommend`. Getting that
  contract right was the crux of the whole layer; recording it as ADR-004 made the rest fall
  out of it.
- **A trial is worth more than a demo.** Letting the customer actually use the Week 6 build
  surfaced concrete, prioritizable feedback — the square logo, "finish the frontend now", the
  mail-domain route to password reset, her Telegram-bot plan for reminders, and openness to an
  LLM-based irritant warning — that a scripted walkthrough would not have produced.
- **Documenting the handover forced honesty about what is actually transferred.** Writing
  `docs/customer-handover.md` made us state explicitly that hosting, database, and the optional
  LLM key are still on team-owned accounts — turning a vague "it's deployed" into a named
  remaining transition action.

## Validated assumptions

- **Guest-first is the right spine.** The account reads as a genuine add-on, and a guest's
  freshly generated bag carries into the account on sign-up / sign-in, so registering never
  costs the user their result.
- **Keeping credentials and safety in deterministic, tested code holds up.** QR-004
  (bcrypt-only, never returned) kept a security-relevant guarantee verifiable rather than a
  claim, and the special-condition and allergen filters stayed rule-based.
- **Small issue-linked PRs under a hardened `main` ruleset absorb a large feature.** The whole
  account layer went in without destabilizing the default branch.

## Friction and gaps

- The frontend polish and the switch of the deployment to the team's `main` repository both
  slipped to the Week 6 boundary; the customer trialed a preview build at the review rather
  than the production `main` deployment.
- A few maintained facts had drifted and needed a correctness pass — a stale automated-test
  count and deployment wording among them.
- Password reset and tracker reminders depend on **customer-provided** credentials/domain, so
  they cannot be finished on the team's schedule alone.

## Planned response

- Make **"deployed from `main` with the UI matching the design"** the first Sprint-5 milestone
  so the final customer confirmation and the `MVP v3` release are not compressed.
- Get the customer's mail-domain credentials early to unblock password reset (US-27 / PBI-503),
  and re-scope tracker reminders around her Telegram-bot plan (PBI-504) instead of an email
  reminder.
- Fold US-11 (irritant warning via the LLM prompt) into Sprint 5 and iterate the prompt with
  the customer, applying Sprint 3's "agree model/prompt up front" lesson.
