# LLM Usage Report — Week 6

This report discloses how AI / LLM tools were used **as development assistance** during
Assignment 6, Week 6 (Sprint 4).

## AI tool used

The team used AI assistance during the Sprint: **Claude Code** (an AI coding/writing assistant)
and **ChatGPT** (for design image generation). They were used to help with:

- **Code** — the personal-account layer on the backend (authentication and JWT sessions,
  profile and single-bag persistence, «worked / didn't work» feedback, single-step product
  replacement, the result tracker, and account security: profile edit, password change,
  account deletion), together with the account frontend (the personal cabinet, «Текущий уход»,
  the replacement screen, the result tracker, and the profile/security screens), and the
  accompanying tests.
- **Documentation** — **structuring** the customer-facing set (README, `CONTRIBUTING.md`,
  `AGENTS.md`, `docs/customer-handover.md`), the authentication ADR-004, and the maintained
  testing / UAT updates: organizing the sections and layout rather than composing the content.
- **Design images** — **ChatGPT** was used to generate the illustrations used in the design
  (for example the tracker and account visuals).
- **Product-backlog text** — drafting PBI descriptions and user-story acceptance criteria for
  the Sprint 4 / Sprint 5 scope, which the team then reviewed and adjusted.
- **Reports** — structuring and editing the text of this week's reports.

## How it was controlled

All AI-assisted output was **reviewed by the team and merged through the normal issue-linked,
peer-reviewed PR workflow**, with the CI quality gates (lint, type-check, build, tests,
coverage, quality-requirement tests, dependency scans, and the Markdown link check) enforced on
the protected `main` branch — one approving review from another team member on every PR, no
admin bypass. Every change was verified by the team before it was accepted. Product and process
decisions — scope, the account model, the customer conversation, and the handover status — were
made by the team; the AI was used as an assistant, not an authority.

## Transcription / translation

The Week 6 Sprint Review / customer trial was held in Russian; the published transcript is an
English rendering, **sanitized by the team** to use roles instead of names. One brief off-record
business matter was excluded at the customer's request.
