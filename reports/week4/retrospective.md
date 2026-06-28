# Sprint 2 Retrospective

## What went well

- Quality/automation work landed cleanly and incrementally: 322 automated tests, 100%
  line coverage on the critical recommendation module, and a full CI pipeline (lint,
  type-check, build, tests, QRTs, coverage, dependency audit) were built up PR by PR
  rather than in one large batch.
- The new dependency-vulnerability scan paid off immediately — it surfaced 9 real known
  CVEs in pinned backend dependencies on its first run, which the team fixed the same
  day. Concrete proof the new gate has real value, not just paperwork.
- The skin-type feature (database markup + matching logic) shipped as two small,
  separately owned, sequenced PBIs and was fully tested before the customer review.
- Design fully addressed last week's customer review feedback — fixed everything that
  was requested, and on top of that improved, added, changed, and removed several
  further elements ahead of this week's review.
- The GitHub repository was migrated to a team organization, directly addressing prior
  TA feedback, and branch protection was hardened with required status checks across
  all CI jobs — stronger, less screenshot-dependent evidence than before.
- UAT was run in person with the customer; a real defect was found live and fixed the
  same day.

## What did not go well

- Moving the repository to a GitHub organization had an unplanned side effect: GitHub
  does not redirect direct issue links (`/issues/N`) the way it redirects PR, milestone,
  release, and commit links. This broke CI and required an unplanned repo-wide pass to
  fix issue links, including in an already-submitted Assignment 3 report.
- Two product questions — how precisely the recommended bag should match the selected
  budget, and how to handle catalog gaps in specific budget segments — were already
  identified during planning, but the team hasn't reached a final decision on either
  yet; the customer review surfaced them again without resolving them.

## What changed compared to the previous Sprint (Sprint 1 retrospective)

- **Applied:** Backend PBIs were scoped narrowly with explicit, non-overlapping
  ownership (e.g., database markup and matching logic were sequenced as two PBIs rather
  than worked on in parallel) — directly following the Sprint 1 lesson to align on a
  shared foundation before splitting work.

## Action points

1. Keep integrating frontend work in small, frequent commits throughout the Sprint
   (as already planned for today), rather than batching it near a customer review.
2. Extend automated frontend coverage to other UI flow variants, not just the one
   exercised most directly, so future UI-specific regressions are caught by CI rather
   than only during a live customer UAT session.
