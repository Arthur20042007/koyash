# Sprint 1 Retrospective

## What went well

- The team delivered a working end-to-end increment: questionnaire → rule-based recommendation → ordered, justified cosmetic bag. The happy path runs through the deployed MVP v1, and the customer approved the scope at the Sprint Review.
- The redesign under the handwriting logo was successfully carried into the implemented screens — the design didn't stay in Figma, it shipped.
- The PR/MR review workflow was followed consistently: every merge went through an issue-linked PR with review and approval, enforced by a branch ruleset on `main` rather than by convention alone.

## What did not go well

- Frontend work started without a clear shared starting point, so the first attempts produced throwaway screens before the direction settled.
- Because task division wasn't agreed up front, work overlapped — a full frontend pass was built in parallel with separate per-screen work, and the two collided and had to be reconciled.
- End-to-end integration landed late in the Sprint, leaving little buffer: most of the questionnaire-to-results path came together on the final build day, so a failed integration would have left little to show.

## Action points

- At the start of each Sprint, first align on the shared foundation and only then distribute work across explicitly owned, non-overlapping PBIs, so two people never build the same thing in parallel. 
- Schedule a working end-to-end integration earlier in the Sprint (mid-Sprint, not the final day), leaving the last day for polish rather than first assembly.