# Week 6 Sprint Review — Summary

**Date:** 2026-07-11
**Duration:** ~18 minutes (one recorded meeting)
**Participants (roles):** KOYASH team — team lead / backend & data, backend & frontend, and UX/UI design (×3); and the Customer (brand founder).
**Format:** One meeting covering the Sprint 4 Sprint Review, the Week 6 trial walkthrough, the customer-executed trial, the customer-facing documentation review, and the transition-readiness discussion (Assignment 6 Part 9.4 / 10.8).

**Recording and publication:** The meeting was recorded. The customer permitted a sanitized public transcript; one brief off-record business matter was excluded at her request. Full record: [sprint-review-transcript.md](sprint-review-transcript.md).

## Sprint 4 Goal reviewed

Turn KOYASH from an anonymous one-shot tool into a personal service: users can register and sign in (email + password) while the questionnaire → cosmetic-bag flow stays available to guests, and signed-in users get a personal account — a profile card, one saved cosmetic bag with «worked / didn't work» feedback, product replacement, a result tracker, and account management. In parallel: publish the customer-facing documentation set and prepare the Week 6 trial.

## What was demonstrated

- Guest flow preserved (questionnaire → bag without an account) and re-taking the questionnaire to save a new bag.
- Account: registration/sign-in, the profile card, the skin-type mini-quiz, and the **age validation (10–100)** the customer noticed.
- The saved cosmetic bag with per-product **«подошло / не подошло»** feedback and a comment box.
- **Product replacement:** choosing an alternative; the replaced product moves to the bottom, dimmed, keeping its comment.
- The **result tracker** (unlocked for the demo): dynamic criteria derived from the questionnaire, a base set when no problems are declared, an overall rating with a comment, and the per-checkpoint statistics.
- Account management: change password and delete account.
- The customer-facing documentation set (README, `docs/customer-handover.md`).

## Customer feedback and approvals

- **Design and functionality approved** — "the design is very pleasant, I'm happy with it". The team noted the UI is still being polished; the customer agreed that matching the design fully will complete it.
- **Tracker criteria approved** — deriving them from the declared problems and skin type, with a base fallback, is what she wanted.
- **Documentation review — accepted** ("it all looks fine"). She asked that the repository link be shared with her.
- Requested: the **logo as a square** version.

## Transition readiness (Part 5.2)

- **Complete enough to hand over?** After the frontend is finished — "finish the frontend now and it's all great".
- **Ready / needs changes:** account functionality is done end-to-end; the visual polish of the account screens is the remaining work.
- **Using it already?** No — the product targets end users rather than the customer herself, and as a brand it needs further work.
- **Deployed / operated on customer side?** Not yet.
- **Product continuity beyond the course** was discussed; details are off-record at the customer's request.

## Handover statuses (Part 5.5)

- Confirmed the product will be **ready for independent use** after Week 7 (conditional on finishing the frontend).
- **Independently tried the version:** Yes — but not yet used in her own work.
- **Deployed or operated on her side:** No.

Current maintained handover level: `Ready for independent use` (see [docs/customer-handover.md](../../docs/customer-handover.md)).

## Customer trial / UAT results

The Week 6 features were demonstrated live and accepted by the customer, and she confirmed she had tried the version herself. Per-scenario execution status is recorded in [docs/user-acceptance-tests.md](../../docs/user-acceptance-tests.md) (UAT-001 and UAT-006–UAT-012 exercised or demonstrated this session; UAT-002–005 unchanged from prior execution).

## Decisions and their effect on scope

- **Password reset is unblocked without a third-party service:** the customer already has a mail domain with a connected mail service and will provide credentials (e.g. `noreply@…`). This changes the plan for PBI-503 (US-27).
- **Tracker reminders:** the customer plans a **Telegram bot** on her side, so an email-reminder feature (PBI-504) is likely dropped or re-scoped.
- **Irritant warning (US-11):** the customer is open to LLM ingredient analysis — "add it to the prompt and experiment". This makes US-11 concrete for Sprint 5.
- **After 12 tracker weeks:** out of scope for this project (possible future functionality).
- Tracker criteria and the design direction were accepted as-is.

## Risks

- The frontend polish and the deployment switch to the main repository must both land before the final handover.
- Password reset and any Telegram integration depend on customer-provided credentials/domain — a delay there delays those features.

## Action points (to be filed as issues at the start of Week 7)

1. Finish the account UI to match the design and send the customer the final working version.
2. Send the customer the repository link and a **square** logo.
3. Get the mail-domain credentials from the customer → build password reset (US-27 / PBI-503).
4. Re-scope tracker reminders around the customer's Telegram-bot plan (PBI-504).
5. Move US-11 (irritant warning via the LLM prompt) into Sprint 5 and iterate on the prompt with the customer.

## Links

- Transcript: [sprint-review-transcript.md](sprint-review-transcript.md)
- User acceptance tests: [docs/user-acceptance-tests.md](../../docs/user-acceptance-tests.md)
- Customer handover: [docs/customer-handover.md](../../docs/customer-handover.md)
- Sprint 4 milestone: <https://github.com/Koyash-team/koyash/milestone/4>
