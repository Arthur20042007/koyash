# KOYASH — Week 6 Report (Sprint 4)

**KOYASH** is a skincare recommendation service: you answer a short questionnaire (budget,
ingredient constraints, skin type, concerns) and get a "cosmetic bag" of real products in a
routine, with a reason for every pick. This is the **Week 6 public report** for **Sprint 4** —
the personal-account trial increment and the customer-facing documentation set.

## Sprint 4 at a glance

- **Product Backlog board:** <https://github.com/orgs/Koyash-team/projects/1>
- **Sprint 4 Backlog view (board filtered to the milestone):**
  <https://github.com/orgs/Koyash-team/projects/1> · **milestone:**
  <https://github.com/Koyash-team/koyash/milestone/4>
- **Sprint 4 milestone:** <https://github.com/Koyash-team/koyash/milestone/4>
- **Dates:** 2026-07-06 – 2026-07-12 (Week 6)
- **Total size:** **59 Story Points**

**Sprint 4 Goal.** Turn KOYASH from an anonymous one-shot tool into a personal service: users
can register and sign in (email + password) while the questionnaire → cosmetic-bag flow stays
available to guests, and signed-in users get a personal account — a profile card, one saved
cosmetic bag with «worked / didn't work» feedback, product replacement, a result tracker, and
account management. In parallel: publish the customer-facing documentation set and prepare the
Week 6 trial release.

**Scope summary.** Account backend (auth/JWT, profile + single-bag persistence, feedback,
single-step replacement, result tracker, account security) and the matching account frontend;
ADR-004 and the auth configuration/tests; the customer-facing docs (README, CONTRIBUTING,
AGENTS, customer-handover); account UAT scenarios; and the `v1.3.0` trial release.

## Week 6 trial release

The trial release delivers the **personal-account layer** on top of the unchanged guest flow:

- Accounts (email + password, guest-first) with a profile card and one saved cosmetic bag
- «Подошло / Не подошло» feedback (comment required on «Не подошло»); the bag sum counts only
  active products
- Product replacement — a similar product in the same routine step, up to 2 per step
- Result tracker — 6 checkpoints over 12 weeks with dynamic criteria and a history
- Account management — edit personal data, change password, delete account

- **SemVer release:** [v1.3.0](https://github.com/Koyash-team/koyash/releases/tag/v1.3.0)
- **CHANGELOG:** [CHANGELOG.md](../../CHANGELOG.md)

### Access the trial

- **Web app (product access artifact):** <https://koyash-production-25e0.up.railway.app>
- **API + Swagger:** <https://koyash-production.up.railway.app/docs>
- **Run / access instructions:** [README → Run it locally](../../README.md#run-it-locally)

No account is required to get a recommendation — signing in only adds the personal features.

## Customer-facing documentation set

- [README.md](../../README.md) — public entry point
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [AGENTS.md](../../AGENTS.md)
- [docs/customer-handover.md](../../docs/customer-handover.md)
- **Hosted documentation site:** <https://koyash-team.github.io/koyash/>

**Documentation review (Week 6 meeting).** The customer reviewed the set and **accepted** it
("it all looks fine"). Nothing was reported as unclear or missing; she asked that the
repository link be shared with her. Full notes in the Sprint Review summary and transcript.

## Transition readiness

- **Complete enough to hand over?** After the frontend polish — "finish the frontend now and
  it's all great."
- **Ready / needs changes:** the account functionality is done end-to-end; the remaining work
  was the visual polish of the account screens and the switch of the deployment to the team's
  `main` repository (both landed at the Week 6 boundary / into early Week 7).
- **Using it already?** No — the product targets end users rather than the customer herself,
  and as a brand it needs further work.
- **Deployed / operated on customer side?** Not yet — hosting, database and the optional LLM
  key are still team-owned.
- **Maintained handover level:** `Ready for independent use`
  (see [docs/customer-handover.md](../../docs/customer-handover.md)).

**What must still happen in Week 7:** finish the account UI to match the design, complete the
deployment on `main`, deliver the final `MVP v3` release, and obtain the customer's final
transition confirmation.

## Customer feedback and resulting work

| Feedback point | Resulting PBI / issue |
|---|---|
| "Finish the frontend to match the design" | Sprint 5 account-UI polish — [#181 (PBI-421)](https://github.com/Koyash-team/koyash/issues/181) and the account frontend delivered via [#178](https://github.com/Koyash-team/koyash/pull/178) |
| Share the repository link and provide a **square** logo | Action item — square-logo asset to be filed as an issue at the start of Sprint 5 |
| Password reset via the customer's own mail domain | [US-27 (#159)](https://github.com/Koyash-team/koyash/issues/159) · [PBI-503 (#166)](https://github.com/Koyash-team/koyash/issues/166) |
| Tracker reminders via the customer's Telegram bot | [PBI-504 (#167)](https://github.com/Koyash-team/koyash/issues/167) — re-scope away from email |
| Openness to an LLM-based irritant warning ("add it to the prompt and experiment") | [US-11 (#15)](https://github.com/Koyash-team/koyash/issues/15) — moved into Sprint 5 |

**Feedback not yet addressed.** Password reset (PBI-503) and tracker reminders (PBI-504) depend
on **customer-provided** credentials / domain and her Telegram-bot plan, so they are Sprint 5+
work; the square logo is pending; US-11 is scoped for Sprint 5. The frontend polish was
completed after the review, in early Week 7.

## Maintained engineering documentation (updated in Sprint 4)

- [docs/roadmap.md](../../docs/roadmap.md)
- [docs/architecture/](../../docs/architecture/README.md) — incl. [ADR-004 (authentication)](../../docs/architecture/adr/ADR-004-authentication-guest-first-jwt.md)
- [docs/testing.md](../../docs/testing.md) · [docs/quality-requirements.md](../../docs/quality-requirements.md) · [docs/quality-requirement-tests.md](../../docs/quality-requirement-tests.md)
- [docs/user-acceptance-tests.md](../../docs/user-acceptance-tests.md) · [docs/definition-of-done.md](../../docs/definition-of-done.md)
- [docs/development-process.md](../../docs/development-process.md) · [docs/user-stories.md](../../docs/user-stories.md)

## UAT / customer-trial results

The Week 6 features were demonstrated live and the customer confirmed she had tried the version
herself. Per-scenario status is maintained in
[docs/user-acceptance-tests.md](../../docs/user-acceptance-tests.md): **UAT-001 and
UAT-006–UAT-012** were exercised or demonstrated and accepted this session; UAT-002–005 are
unchanged from prior execution. No scenario failed; the outstanding item is the visual polish,
not functional behaviour.

## Sprint Review artifacts

- [sprint-review-summary.md](sprint-review-summary.md)
- [sprint-review-transcript.md](sprint-review-transcript.md) — sanitized public transcript
  (one brief off-record business matter excluded at the customer's request)
- [reflection.md](reflection.md)
- [retrospective.md](retrospective.md)
- [llm-report.md](llm-report.md)

## Product status and Week 7 follow-up

The personal-account layer is delivered and live, and the guest flow is unchanged. Week 7
(Sprint 5) completes the final polish and the deployment on `main`, delivers `MVP v3`, folds in
the trial feedback (password reset via the customer's mail domain, Telegram-bot reminders,
US-11 irritant warning), and confirms the final transition with the customer.

## Contribution traceability (Sprint 4)

| Member | GitHub | Role | Sprint 4 contribution | Evidence |
|---|---|---|---|---|
| Daria | `Dasha365` | Team lead · backend & data | Account backend (auth, persistence, feedback, replacement, tracker, account security), ADR-004, tests, docs set, `v1.3.0` release; PR reviews | PBI-401/403/404/406/408/409/414/416/418, docs #149–#152; backend & docs PRs |
| Arthur | `Arthur20042007` | Backend & frontend · deployment | Account frontend (cabinet, care, replacement, tracker, profile/security) and the Railway deployment | PBI-402/405/407/415/417/419; account frontend [PR #178](https://github.com/Koyash-team/koyash/pull/178) |
| Milana | `millfsw` | UX/UI design | Design of the account and tracker screens feeding the account frontend | PBI-402/405/407/415/417/419 (design) |
| Anna | `fedyann` | UX/UI design | Design of the account and tracker screens | PBI-402/405/407/415/417/419 (design) |
| Khasana | `khas-ab` | UX/UI design | Design of the account and tracker screens | PBI-402/405/407/415/417/419 (design) |

*Every account frontend PBI carries all three designers plus the frontend implementer as
assignees; the backend PBIs are the lead's. Contribution reviews are enforced by the protected
`main` ruleset (one approving review from a different member on every PR).*

## Evidence

The repository is **public**, so all links above are directly inspectable without screenshots:
the [Sprint 4 milestone](https://github.com/Koyash-team/koyash/milestone/4), the
[v1.3.0 release](https://github.com/Koyash-team/koyash/releases/tag/v1.3.0), and the reviewed
issue-linked PRs (for example the account frontend
[PR #178](https://github.com/Koyash-team/koyash/pull/178) and the docs
[PR #179](https://github.com/Koyash-team/koyash/pull/179)). Per the Artifact Requirements,
screenshots are for evidence that public links cannot reliably show, which does not apply here.
