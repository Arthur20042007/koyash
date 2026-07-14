# Roadmap

Sprint-by-Sprint delivery plan. For story-level detail, current status, and acceptance criteria, see the issue tracker and [docs/user-stories.md](user-stories.md) — this file only summarizes intent and links out.

## Sprint 1 — Core recommendation happy path

- **Milestone:** [Sprint 1](https://github.com/Koyash-team/koyash/milestone/1)
- **Dates:** 2026-06-15 – 2026-06-21
- **Sprint Goal:** Deliver the core recommendation happy path — a guided questionnaire (budget, ethical preferences, allergen exclusion, skin concerns) producing a structured cosmetic bag of real products with per-item justification, deployed and ready for customer review. This is the MVP v1 increment.
- **Focus:** Ship the `/recommend` backend end-to-end, then build the questionnaire and results frontend on top of it.
- **Planned items:**
  - User stories: [US-02](https://github.com/Koyash-team/koyash/issues/6), [US-03](https://github.com/Koyash-team/koyash/issues/7), [US-04](https://github.com/Koyash-team/koyash/issues/8), [US-05](https://github.com/Koyash-team/koyash/issues/9), [US-06](https://github.com/Koyash-team/koyash/issues/10), [US-07](https://github.com/Koyash-team/koyash/issues/11), [US-08](https://github.com/Koyash-team/koyash/issues/12), [US-17](https://github.com/Koyash-team/koyash/issues/21)
  - Backend: [PBI-101](https://github.com/Koyash-team/koyash/issues/24), [PBI-102](https://github.com/Koyash-team/koyash/issues/25), [PBI-103](https://github.com/Koyash-team/koyash/issues/30), [PBI-104](https://github.com/Koyash-team/koyash/issues/32)
  - Frontend: [PBI-107](https://github.com/Koyash-team/koyash/issues/38) (decomposed into [PBI-110](https://github.com/Koyash-team/koyash/issues/44)–[PBI-117](https://github.com/Koyash-team/koyash/issues/51)), [PBI-108](https://github.com/Koyash-team/koyash/issues/39), [PBI-116](https://github.com/Koyash-team/koyash/issues/50)
  - Docs & process: [PBI-105](https://github.com/Koyash-team/koyash/issues/34), [PBI-106](https://github.com/Koyash-team/koyash/issues/35), [PBI-109](https://github.com/Koyash-team/koyash/issues/41)

## Sprint 2 — Polish the MVP, personalize by skin type, raise quality and automation

- **Milestone:** [Sprint 2](https://github.com/Koyash-team/koyash/milestone/2)
- **Dates:** 2026-06-22 – 2026-06-28 (Mon–Sun)
- **Sprint Goal:** Polish the MVP for real customer use: apply the customer's requested design and copy changes on the frontend, add automated tests for the product-recommendation (matching) logic and fix any defects they surface, and extend the recommendation engine with skin type as a new filtering criterion (database markup, questionnaire step, and matching logic).
- **Focus:** Customer-feedback-driven design/copy fixes, skin-type personalization, a short non-storytelling questionnaire variant, automated testing of the recommendation engine, and the Assignment 4 quality/automation baseline (Quality Requirements, QRTs, CI gates, Definition of Done, testing and UAT docs).
- **Planned items:**
  - User stories: [US-01](https://github.com/Koyash-team/koyash/issues/5) (landing page), [US-09](https://github.com/Koyash-team/koyash/issues/13) (skin type), [US-18](https://github.com/Koyash-team/koyash/issues/69) (short questionnaire variant)
  - Skin type: [PBI-201](https://github.com/Koyash-team/koyash/issues/70), [PBI-202](https://github.com/Koyash-team/koyash/issues/71)
  - Design/frontend: [PBI-203](https://github.com/Koyash-team/koyash/issues/72), [PBI-204](https://github.com/Koyash-team/koyash/issues/73), [PBI-205](https://github.com/Koyash-team/koyash/issues/74)
  - Testing and quality automation: [PBI-206](https://github.com/Koyash-team/koyash/issues/75), [PBI-207](https://github.com/Koyash-team/koyash/issues/76), [PBI-208](https://github.com/Koyash-team/koyash/issues/77), [PBI-209](https://github.com/Koyash-team/koyash/issues/78), [PBI-210](https://github.com/Koyash-team/koyash/issues/79), [PBI-211](https://github.com/Koyash-team/koyash/issues/80), [PBI-212](https://github.com/Koyash-team/koyash/issues/81)

## Sprint 3 — MVP v2: more accurate, more personal, better explained

- **Milestone:** [Sprint 3](https://github.com/Koyash-team/koyash/milestone/3)
- **Dates:** 2026-06-29 – 2026-07-05 (Mon–Sun)
- **Sprint Goal:** Make the budget expectation honest — present budget as a tier with an approximate total instead of promising an exact ₽ range; let users who don't know their skin type get a personalized result through a short skin-type mini-quiz; integrate LLM-generated justifications for the recommended products; and apply the customer's design and copy feedback. In parallel, document the product architecture (static/dynamic/deployment views and ADRs) and the development process.
- **Focus:** Customer-feedback-driven product improvements (budget precision, design/copy), the skin-type mini-quiz, LLM justifications (justification-only — model and prompt provided by the customer), and the Assignment 5 maintained documentation (architecture, ADRs, development process, hosted docs).
- **Delivered increment:** MVP v2, mapped to release `v1.2.0`.
- **Planned items:**
  - User stories: [US-19](https://github.com/Koyash-team/koyash/issues/101) (skin-type mini-quiz), [US-14](https://github.com/Koyash-team/koyash/issues/18) (LLM justification), [US-20](https://github.com/Koyash-team/koyash/issues/124) (special-condition safety)
  - Product: [PBI-301](https://github.com/Koyash-team/koyash/issues/102) (mini-quiz), [PBI-302](https://github.com/Koyash-team/koyash/issues/103) (budget precision), [PBI-303](https://github.com/Koyash-team/koyash/issues/104) (LLM justifications), [PBI-304](https://github.com/Koyash-team/koyash/issues/105) (design/copy polish), [PBI-312](https://github.com/Koyash-team/koyash/issues/125) (special-condition filter)
  - Architecture & process: [PBI-305](https://github.com/Koyash-team/koyash/issues/106)–[PBI-308](https://github.com/Koyash-team/koyash/issues/109) (static/dynamic/deployment views, ADRs), [PBI-309](https://github.com/Koyash-team/koyash/issues/110) (development process), [PBI-310](https://github.com/Koyash-team/koyash/issues/111) (hosted docs), [PBI-311](https://github.com/Koyash-team/koyash/issues/112) (tests, UATs, Definition of Done)

## Sprint 4 — Personal account: sign-in, profile, saved bag, feedback, replacement and tracker (Week 6 trial)

- **Milestone:** [Sprint 4](https://github.com/Koyash-team/koyash/milestone/4)
- **Dates:** 2026-07-06 – 2026-07-12 (Mon–Sun)
- **Sprint Goal:** Turn Koyash from an anonymous one-shot tool into a personal service, per the approved account specification. Users can register and sign in (email + password; phone collected but not used for auth), while the questionnaire → cosmetic-bag flow stays fully available to guests. Signed-in users get a personal account: a profile card, one saved cosmetic bag with "Подошло / Не подошло" feedback, replacement of unsuitable products with similar alternatives, a result tracker, and account management (edit profile, change password, delete account). In parallel, publish the customer-facing documentation set and cut the Week 6 trial release `v1.3.0`.
- **Focus:** Guest-first authentication and the personal account (profile, single saved bag, feedback, product replacement, result tracker, profile & security), the Assignment 6 customer-facing docs (README entry point, `CONTRIBUTING.md`, `AGENTS.md`, `docs/customer-handover.md`), ADR-004 for authentication, and a stable trial release. Priorities P0/P1 in the issue bodies protect the trial core if some P1 work slips into Week 7.
- **Delivered increment:** the personal-account layer, released as [`v1.3.0`](https://github.com/Koyash-team/koyash/releases/tag/v1.3.0) — the Week 6 trial / handover-candidate release. Customer trial and documentation review completed at the Week 6 meeting; handover level reached: `Ready for independent use`.
- **Planned items:**
  - User stories: [US-21](https://github.com/Koyash-team/koyash/issues/136) (account + sign-in), [US-22](https://github.com/Koyash-team/koyash/issues/137) (profile card), [US-12](https://github.com/Koyash-team/koyash/issues/16) (single saved bag), [US-13](https://github.com/Koyash-team/koyash/issues/17) (feedback), [US-24](https://github.com/Koyash-team/koyash/issues/139) (result tracker), [US-25](https://github.com/Koyash-team/koyash/issues/157) (product replacement), [US-26](https://github.com/Koyash-team/koyash/issues/158) (account & security)
  - Product: [PBI-401](https://github.com/Koyash-team/koyash/issues/140)–[PBI-407](https://github.com/Koyash-team/koyash/issues/146) (auth, profile, single bag, feedback), [PBI-414](https://github.com/Koyash-team/koyash/issues/160)/[PBI-415](https://github.com/Koyash-team/koyash/issues/161) (replacement), [PBI-416](https://github.com/Koyash-team/koyash/issues/162)/[PBI-417](https://github.com/Koyash-team/koyash/issues/163) (tracker), [PBI-418](https://github.com/Koyash-team/koyash/issues/164)/[PBI-419](https://github.com/Koyash-team/koyash/issues/165) (profile & security)
  - Architecture, quality & docs: [PBI-408](https://github.com/Koyash-team/koyash/issues/147) (ADR-004 + config), [PBI-409](https://github.com/Koyash-team/koyash/issues/148) (tests), [PBI-410](https://github.com/Koyash-team/koyash/issues/149) (README), [PBI-411](https://github.com/Koyash-team/koyash/issues/150) (CONTRIBUTING/AGENTS), [PBI-412](https://github.com/Koyash-team/koyash/issues/151) (customer-handover), [PBI-413](https://github.com/Koyash-team/koyash/issues/152) (trial release v1.3.0)

## Sprint 5 — Trial feedback and final transition (Week 7, MVP v3)

- **Milestone:** [Sprint 5](https://github.com/Koyash-team/koyash/milestone/5)
- **Dates:** 2026-07-13 – 2026-07-19 (Mon–Sun)
- **Sprint Goal:** Respond to the Week 6 trial feedback and complete the transition — ship the LLM irritant warning (US-11, prompt approved by the customer), self-service password reset via the customer's mail domain (US-27), and the remaining frontend UX fixes; then deliver the final `MVP v3` release, confirm the transition with the customer, and produce the Week 7 evidence (public demo video, UAT, Sprint Review, Week 7 report).
- **Focus:** Week 6 trial follow-up and the final transition. Scope is fixed after the Week 6 review, with one external dependency: password reset needs the SMTP credentials for the customer's mail domain.
- **Delivered increment:** `MVP v3` — the final course version.
- **Planned items:**
  - User stories: [US-11](https://github.com/Koyash-team/koyash/issues/15) (irritant warning — prompt change approved by the customer), [US-27](https://github.com/Koyash-team/koyash/issues/159) (password reset)
  - Product: [PBI-505](https://github.com/Koyash-team/koyash/issues/184) (irritant warning in the LLM justification), [PBI-503](https://github.com/Koyash-team/koyash/issues/166) (password reset via the customer's mail domain), [PBI-506](https://github.com/Koyash-team/koyash/issues/185) (frontend UX fixes — navigation and missing actions)
  - Transition & delivery: [PBI-507](https://github.com/Koyash-team/koyash/issues/186) (final MVP v3 release), [PBI-508](https://github.com/Koyash-team/koyash/issues/187) (public sanitized demo video), [PBI-509](https://github.com/Koyash-team/koyash/issues/188) (final transition confirmation + handover status), [PBI-510](https://github.com/Koyash-team/koyash/issues/189) (Week 7 UAT), [PBI-511](https://github.com/Koyash-team/koyash/issues/190) (Week 7 report set)
  - **Dropped after the Week 6 review:** tracker email reminders ([PBI-504](https://github.com/Koyash-team/koyash/issues/167)) — the customer will handle reminders with her own Telegram bot, so they are out of the product's scope.

## Course outcome

`MVP v3` (Sprint 5) is the final course version. It delivers the guest questionnaire → justified cosmetic bag together with the personal account (profile, one saved bag, «Подошло / Не подошло» feedback, product replacement, a 12-week result tracker, account management), password reset, and the LLM irritant warning — deployed, documented, and handed over with `docs/customer-handover.md`. The handover level and the customer-confirmation status reached by submission are recorded in that document and in `reports/week7/README.md`.

## Backlog / later (not scheduled)

- Favorites ([US-23](https://github.com/Koyash-team/koyash/issues/138), [PBI-501](https://github.com/Koyash-team/koyash/issues/153)) — not part of the approved account specification; kept for later.
- Product photo on each card ([US-10](https://github.com/Koyash-team/koyash/issues/14)); a mobile version. Fuller skin-progress tracking beyond the 6-checkpoint tracker (daily habit calendar, dynamics charts, before/after photos) remains a product vision, not scheduled course work.

## Continuing work (maintained across Sprints)

The architecture documentation and ADRs, quality requirements and quality requirement tests, CI quality gates, Definition of Done, and the hosted documentation site introduced or maintained in Assignments 4–5 are maintained assets. Later Sprints must keep them current as product scope, architecture, deployment model, or workflow change.
