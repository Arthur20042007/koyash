# LLM Usage Report — Week 4

The team used AI/LLM tools as productivity aids during Assignment 4. All AI-assisted output was reviewed, edited, and validated by the team before inclusion; the substantive product and process decisions — the recommendation logic, the selected quality requirements, the Sprint scope, and the customer-facing choices — are the team's own.

## Tools and how they were used

**Claude Code** — used for all code-related work this Sprint:

- Implementing skin-type personalization in the `/recommend` matching logic.
- Writing automated unit and integration tests for the recommendation engine, including the QRT-001/QRT-002/QRT-003 checks, and reaching the target line coverage on the critical recommendation module.
- Configuring the CI pipeline (lint, type-check, build, tests, quality requirement tests, coverage, dependency-vulnerability scan).
- Fixing the dependency vulnerabilities (CVEs) flagged by the new dependency-vulnerability scan.
- Applying the customer's Sprint 1 review feedback in the frontend (button sizing, replacing «аптечный», background/gradient adjustments, layout changes).
- Building out the storytelling-questionnaire frontend flow and the short questionnaire variant, and adding automated frontend test coverage for the storytelling-questionnaire flow.
- Deployment-related fixes as needed (Docker / Railway configuration).

**Claude (chat)** — used for structuring text in documentation and reports, with the team responsible for all underlying content and decisions:

- Structuring `docs/quality-requirements.md` and `docs/quality-requirement-tests.md`.
- Structuring `docs/testing.md` and the Week 4 reports (`README.md`, `customer-review-summary.md`, `reflection.md`, `retrospective.md`, this report).