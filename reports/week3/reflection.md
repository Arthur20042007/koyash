# Week 3 Reflection

## Learning points

- Using custom fields (MoSCoW, Story Points, Status, MVP version) in a single GitHub Project let us keep the Product Backlog and Sprint Backlog as two separate views without copying data around.
- The split between user stories and supporting PBIs only clicked when we were under deadline: a PR closes a supporting PBI (`Closes #PBI`), and we move the user story to Done by hand once all its PBIs are done. This kept things traceable even when one backend PR closed several PBIs at once.
- Doing the data layer first paid off. Since derived fields (`main_actives_short`, `allergens_norm`, `concerns_addressed`) were locked early, the recommendation logic and the per-product justification engine could be built on a stable contract instead of parsing raw INCI text at runtime.
- In a short Sprint, order matters more than effort. Design tokens had to be locked before screen work, and justification fields had to exist before the frontend could render them. When we followed this order, work flowed; when dependencies were hidden, we ended up redoing things.

## Validated assumptions

- **Icons over photos — reconfirmed.** At the review the customer again preferred category icons over per-product photos, same as in Assignment 2; US-10 stays Could Have.
- **Rule-based justification is enough for MVP v1.** The customer approved the MVP scope at the Sprint Review, which confirms we can ship structural justification (`role`, `what_it_does`, `key_actives`, `why_for_you`) now and leave LLM reasoning for later.
- **A 3-segment budget picker is good enough.** The free numeric input from Assignment 2 did not survive implementation — we shipped `low`/`mid`/`high` instead, and the customer was fine with it.
- **Skin-type filtering will be the next useful step.** The customer agreed to do the skin-type markup herself, which tells us this is the right next feature and that she sees real value in it.

## Friction and gaps

- Branch naming (`<issue-number>-short-description`) was not followed for the first ~4 PRs of the Sprint; the team only converged on the convention from PR #31 onward.
- `CHANGELOG.md` updates lagged behind delivery (backend was current, frontend had to be backfilled during `v1.0.0` release prep) instead of being updated in the same PR as each user-visible change.
- No automated tests yet for the recommendation engine or the frontend; the only CI gate we have is the markdown link checker.

## Planned response

- Send the customer 3–5 sample `/recommend` request/response JSON pairs, covering at least one low, one mid, and one empty/edge profile.
- Apply the design feedback from the review in the next Sprint: smaller buttons, bring back the gradient/brush-stroke background she liked, drop the word «аптечный» (reads like a marketing trigger), and make the history entry point more visible.
- Add the first automated check for the recommendation engine, starting with the two edge cases we already verified by hand, so we stop relying on manual checks.
- Add skin-type markup to the database and build filtering by skin type on top of it, so the next version can actually use the markup the customer will provide.