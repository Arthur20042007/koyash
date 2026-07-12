# User Acceptance Tests

End-user-facing UAT scenarios for KOYASH, following
[Process Requirements](Process_Requirements.md#user-acceptance-tests) (stable
`UAT-NNN` IDs, status, execution history).

## UAT-001: Complete the questionnaire and receive a personalized cosmetic bag

**Status:** Active

**User goal:** As a new user, I want to answer the guided questionnaire and receive a
structured, justified cosmetic bag, so that I can trust the recommendation enough to
act on it.

**Preconditions:** The deployed app (frontend + backend) is reachable; no account is
required.

**Steps:**
1. Open the deployed app.
2. Go through the questionnaire: skin type, concerns, budget, allergies, values (vegan,
   cruelty-free, minimalism).
3. Submit and view the results screen.

**Expected outcome:** The user receives an ordered cosmetic bag (cleanse → tone → serum
→ moisturize → spf, plus any occasional steps such as exfoliant/mask) with a
justification shown for each product and the total price.

**Execution results (2026-06-26, in-person customer session):** Passed. Executed via
the short (non-storytelling) questionnaire variant — the storytelling variant
intermittently failed (blank screen) partway through the flow during this session, so
the team switched to the short variant for the remainder of the demo. Both variants
share identical questions and matching logic, so this is valid evidence for the
underlying recommendation engine regardless of which questionnaire UI was used.

**Customer comments / observed issues:** Raised a product question on how precisely
the assembled bag should match the selected budget (fill close to the budget ceiling
vs. prioritize full category coverage); no defect, a product decision still pending.
Also surfaced a catalog gap: no low-budget product for the "toning" step, correctly
reported as an empty step rather than filled incorrectly.

**Resulting PBIs or issues:** The budget-matching-precision question is resolved
as [PBI-302](https://github.com/Koyash-team/koyash/issues/103) — decision: keep
the segment-first engine and make the budget presentation honest (tier +
approximate per-product price + approximate total, with an "approximate price"
note in the results) rather than force the total into a fixed range. The
low-budget "toning" catalog gap remains an open follow-up (see
[reports/week4/customer-review-summary.md](../reports/week4/customer-review-summary.md),
action point A2).

**Also exercised (2026-07-11, Week 6 review):** the questionnaire was re-taken during the
demo and produced a saved cosmetic bag; no defect.

## UAT-002: Declared allergens are never recommended

**Status:** Active

**User goal:** As a user with an allergy, I want products containing my declared
allergen to be excluded, so that nothing recommended can harm my skin.

**Preconditions:** Same as UAT-001; the tester knows at least one allergen present in
the catalog (e.g. Fragrance).

**Steps:**
1. Complete the questionnaire, declaring a specific allergen (e.g. Fragrance) in the
   allergens step.
2. Submit and review the resulting bag.

**Expected outcome:** None of the recommended products are associated with the declared
allergen. If a step has no safe candidate, that step is dropped from the bag rather than
filled with an unsafe product — the omission is reflected in the results note (e.g. "Нет
товаров для шагов: …"), without naming the allergen as the cause. 

**Execution results (2026-06-26, in-person customer session):** Passed. Executed via
the short questionnaire variant for the same reason noted under UAT-001 (the
storytelling variant was intermittently failing during this session); the allergen
hard-filter logic is shared between both variants.

**Customer comments / observed issues:** None specific to allergen handling.

**Resulting PBIs or issues:** None — no defect found in this scenario.

## UAT-003: Recommendations reflect declared skin concerns

**Status:** Active

**User goal:** As a user with specific skin concerns (e.g. acne, dryness), I want the
recommended products to address those concerns where possible, so that the routine
feels tailored rather than generic.

**Preconditions:** Same as UAT-001; the tester selects two or more concerns during the
questionnaire.

**Steps:**
1. Complete the questionnaire, declaring two or more skin concerns.
2. Review the justification text for each recommended product.

**Expected outcome:** Each step's chosen product's justification mentions addressing at
least one declared concern where a matching candidate existed for that step. Steps with
no concern-matching candidate still return a product chosen by routine role and price,
not an empty result without explanation.

**Execution results (2026-06-26, in-person customer session):** Passed. Confirmed
working during the same multi-pass questionnaire walkthrough as UAT-001/UAT-002.

**Customer comments / observed issues:** None specific to concern-matching.

**Resulting PBIs or issues:** None — no defect found in this scenario.

## UAT-004: Budget is presented honestly and the real total is shown

**Status:** Active

**User goal:** As a user, I want to understand roughly what I will spend before I start
and see the real total afterwards, without being promised an exact price range.

**Preconditions:** The deployed app is reachable.

**Steps:**
1. Start the questionnaire and reach the budget step.
2. Read the budget options.
3. Finish the questionnaire and open the results screen.
4. Read the total and the price note.

**Expected outcome:** Each budget option shows a tier plus an approximate per-product
price and an approximate whole-set total (no exact "до 3500 / 3500–8000 / 8000+" ranges).
The results screen shows the real assembled total and a note that prices are approximate
and the current price is available via each product's link.

**Related:** [US-03](https://github.com/Koyash-team/koyash/issues/7), [PBI-302](https://github.com/Koyash-team/koyash/issues/103).

**Execution results (2026-07-03, recorded customer review):** Passed. The customer viewed
the live budget presentation and total; approved it ("it's great", "well done") and noted
the clear range distribution made the price easier to understand. No changes requested.

**Customer comments / observed issues:** None — approved.

**Resulting PBIs or issues:** None — no defect found in this scenario.

## UAT-005: LLM justification explains why each product is in the bag

**Status:** Active

**User goal:** As a user, I want a short, human explanation of why each product was
picked for me.

**Preconditions:** The deployed app is reachable with the LLM layer enabled
(`LLM_ENABLED=true`).

**Steps:**
1. Complete the questionnaire (state a skin type and one or two concerns).
2. Open the results screen.
3. Read the "why" text under two or three product cards.

**Expected outcome:** Each product has a short, warm justification grounded strictly in
the input data. For products with no concern match (steps included for routine coverage),
the text explains the step function neutrally without tying the product to the user's skin
type or concerns. Product names and prices are not distorted. If the LLM is unavailable,
the previous rule-based text is shown instead of an error.

**Related:** [US-14](https://github.com/Koyash-team/koyash/issues/18), [PBI-303](https://github.com/Koyash-team/koyash/issues/104).

**Execution results (2026-07-03, recorded customer review):** Passed at this stage. The
customer reviewed the LLM justifications live and accepted them for now; a few minor tone
residuals were noted for later tuning, and the model may be switched to Gemini in a future
iteration (with a re-adapted prompt).

**Customer comments / observed issues:** Minor: occasional over-generic phrasing and rare
mis-attribution of a function to an ingredient — to refine when the prompt/model is next
revised.

**Resulting PBIs or issues:** Prompt/model refinement tracked on [PBI-303](https://github.com/Koyash-team/koyash/issues/104) for a later iteration.

## UAT-006: A declared special condition excludes contraindicated products

**Status:** Active

**User goal:** As a user with a special condition (pregnancy, rosacea, or dermatitis), I
want products with ingredients contraindicated for that condition to be excluded, so that
the recommendation is safe for me.

**Preconditions:** The deployed app is reachable. No account is required.

**Steps:**
1. Complete the questionnaire and declare **pregnancy** as a special condition.
2. Open the results screen and inspect the key actives listed for each product.
3. Repeat the questionnaire with the same answers but **without** the special condition.

**Expected outcome:** With pregnancy declared, no product in the bag lists a retinoid
(retinol / retinal / tretinoin / adapalene), hydroquinone, or a salicylate among its
ingredients. Without the condition, such a product may appear. If excluding them empties a
routine step, the step is reported as empty rather than filled with a contraindicated
product. The result is deterministic — it is a rules-based safety filter, not an LLM
judgement.

**Related:** [US-20](https://github.com/Koyash-team/koyash/issues/124), [PBI-312](https://github.com/Koyash-team/koyash/issues/125).

**Execution results (2026-07-11, Week 6 review):** Demonstrated and accepted. The
special-condition handling was shown as part of the questionnaire flow (a declared condition
such as pregnancy excludes contraindicated products), consistent with the deterministic
approach the customer approved at the 2026-07-03 review. It was not called out verbally in
this session and is additionally covered by automated tests
(`backend/tests/test_conditions.py`).

**Customer comments / observed issues:** Approach approved at the prior review; no defect
raised.

**Resulting PBIs or issues:** —

## UAT-007: Create an account and keep the cosmetic bag

**Status:** Active

**User goal:** As a returning user, I want to create an account so that my cosmetic bag is
saved to me instead of being lost after the session.

**Preconditions:** The Week 6 trial release is deployed and reachable. A sanitized demo
email address is available (no real personal data).

**Steps:**
1. As a guest (not signed in), complete the questionnaire and view the cosmetic bag.
2. Register an account: name, email, password (repeat it). Leave age and phone empty.
3. Open the personal account and go to the saved cosmetic bag ("Текущий уход").
4. Sign out, sign back in with the same email and password, and reopen the bag.

**Expected outcome:** Registration succeeds without requiring age or phone, and signs the
user in immediately. The bag generated as a guest is present in the account after
registration. After signing out and back in, the same bag is still there. The guest flow
in step 1 works without any account. A password shorter than 8 characters, a mismatched
repeat, or an already-registered email is rejected with a clear message.

**Related:** [US-21](https://github.com/Koyash-team/koyash/issues/136), [US-12](https://github.com/Koyash-team/koyash/issues/16).

**Execution results (2026-07-11, Week 6 review):** Demonstrated and accepted. The signed-in
account held a saved cosmetic bag, and re-taking the questionnaire saved a new one; the
skin-type mini-quiz and the age validation (10–100) were shown. The customer confirmed she
had tried the version herself. Not executed as a fresh guest → register step sequence by the
customer in this session; validation rejections were not re-checked live.

**Customer comments / observed issues:** Noticed and approved the age limit. No defect
raised.

**Resulting PBIs or issues:** —

## UAT-008: See my skincare profile in the account

**Status:** Active

**User goal:** As a signed-in user, I want to see at a glance what the service knows about
my skin, so that I understand why it recommends what it recommends.

**Preconditions:** Signed in with an account that has completed the questionnaire at least
once (UAT-007).

**Steps:**
1. Open the personal account.
2. Read the profile card.
3. Re-take the questionnaire with a different skin type and one different concern.
4. Return to the personal account and read the profile card again.

**Expected outcome:** The profile card shows the skin type, concerns, allergens, budget,
value preferences, special conditions, and age from the **latest** questionnaire. After
re-taking the questionnaire the card reflects the new answers. Before the very first
questionnaire the account shows an empty state inviting the user to get a recommendation.

**Related:** [US-22](https://github.com/Koyash-team/koyash/issues/137).

**Execution results (2026-07-11, Week 6 review):** Demonstrated and accepted. The profile
card in the personal cabinet was shown; the customer could see her skin type. The
profile-refresh-after-re-take and the empty-state cases were not exercised step by step in
this session.

**Customer comments / observed issues:** No defect raised.

**Resulting PBIs or issues:** —

## UAT-009: Mark whether a product suited me

**Status:** Active

**User goal:** As a signed-in user, I want to record whether each product worked for me, so
that I can keep track of what suits my skin.

**Preconditions:** Signed in with a saved cosmetic bag (UAT-007).

**Steps:**
1. Open the saved cosmetic bag.
2. Mark one product as **«Подошло»**.
3. Mark another product as **«Не подошло»** and try to submit without writing a comment.
4. Write a short comment for that product and submit.
5. Reload the page.

**Expected outcome:** «Подошло» is recorded with a single tap and asks for no comment.
«Не подошло» requires a comment — submitting without one is refused with a clear message.
After submitting, the reaction and the comment are shown and survive a reload. A reaction
can be changed afterwards. The bag total counts only the products in the routine.

**Related:** [US-13](https://github.com/Koyash-team/koyash/issues/17).

**Execution results (2026-07-11, Week 6 review):** Demonstrated and accepted. The
per-product «подошло / не подошло» controls and the comment box were shown. The
required-comment validation and the persist-after-reload case were not exercised step by
step in this session.

**Customer comments / observed issues:** No defect raised.

**Resulting PBIs or issues:** —

## UAT-010: Replace a product that did not suit me

**Status:** Active

**User goal:** As a signed-in user, I want to swap a product that did not suit me for a
similar one, so that my routine fits me better without starting over.

**Preconditions:** Signed in with a saved cosmetic bag in which at least one product has
been marked «Не подошло» with a comment (UAT-009).

**Steps:**
1. On the product marked «Не подошло», choose **«Заменить на похожий продукт»**.
2. Review the offered alternatives and pick one.
3. Inspect the bag: find the new product and the old one.
4. Repeat the replacement for the same routine step twice more.

**Expected outcome:** Replacement is offered only after «Не подошло» with a submitted
comment. The alternatives are products of the **same routine step**, chosen with the same
profile filters (budget, ethics, allergens, skin type, special conditions), and exclude the
current and previously replaced products. The chosen alternative becomes the active
product; the old one stays in the bag, dimmed and moved to the bottom, with its comment
preserved. The bag total updates to count only active products. After **two** replacements
for that step, the replace option is no longer offered. If no alternative exists, the user
is told so and the current product stays.

**Related:** [US-25](https://github.com/Koyash-team/koyash/issues/157).

**Execution results (2026-07-11, Week 6 review):** Demonstrated and accepted. Replacing a
product was shown: the chosen alternative became active and the replaced product moved to the
bottom, dimmed, keeping its comment. The 2-per-step limit and the "no alternatives" case were
not explicitly exercised in this session.

**Customer comments / observed issues:** No defect raised.

**Resulting PBIs or issues:** —

## UAT-011: Follow the result tracker

**Status:** Active

**User goal:** As a signed-in user, I want to see how my skin is expected to be tracked
over the care period, so that I know when and what to report.

**Preconditions:** Signed in with a saved cosmetic bag (UAT-007).

**Steps:**
1. Open the result tracker from the personal account.
2. Read the checkpoint schedule and the criteria offered for rating.
3. Try to open a future checkpoint.
4. Re-take the questionnaire, then reopen the tracker.

**Expected outcome:** The tracker shows **6 checkpoints, one every two weeks** over 12
weeks, counted from the moment the current bag was created, with the date of the next one.
Checkpoints whose date has not arrived are **locked** and cannot be filled. The rating
criteria are chosen from the user's own profile (skin type and concerns), are all phrased
as symptoms on a 1–5 scale where **lower is better**, and the overall rating offers
"better / no change / worse" plus a comment. Re-taking the questionnaire starts a new
12-week tracker.

> **Note for the Week 6 trial:** the first checkpoint opens only two weeks after the bag is
> created, so during the trial session every checkpoint is legitimately locked. This
> scenario therefore verifies the schedule, the derived criteria, and the locked state —
> not the act of submitting a checkpoint.

**Related:** [US-24](https://github.com/Koyash-team/koyash/issues/139).

**Execution results (2026-07-11, Week 6 review):** Demonstrated and accepted. A checkpoint was
unlocked for the demo (via a backdated start date) to show the flow: the criteria derived from
the questionnaire, a base set when no problems are declared, the overall rating with a comment,
and the per-checkpoint statistics. Real over-time unlocking was not exercised (it spans weeks).

**Customer comments / observed issues:** Approved the criteria approach (deriving them from the
declared problems and skin type, with a base fallback). Asked that the tracker match the design
once the UI polish is finished.

**Resulting PBIs or issues:** —

## UAT-012: Manage and delete my account

**Status:** Active

**User goal:** As a signed-in user, I want to keep my details current and be able to remove
my account and data entirely.

**Preconditions:** Signed in with a **throwaway sanitized demo account** — this scenario
destroys the account it is run against.

**Steps:**
1. Open "Профиль и безопасность" and edit the name and age; save.
2. Change the password: enter a wrong current password, then the correct one.
3. Sign out and sign back in with the new password.
4. Delete the account, confirming with the password.
5. Try to sign in again with the deleted account.

**Expected outcome:** Personal data is saved; an email already used by another account is
refused. Changing the password requires the correct current password — a wrong one is
refused. The old password stops working and the new one works. Deleting the account
requires the password, and afterwards the saved bag and the tracker are gone and signing in
with those credentials fails.

**Note:** There is no self-service password reset in this release — "Forgot password?" is
intentionally hidden until a transactional email service is connected (see
[customer handover](customer-handover.md#known-limitations-unfinished-areas-and-risks)).

**Related:** [US-26](https://github.com/Koyash-team/koyash/issues/158).

**Execution results (2026-07-11, Week 6 review):** Demonstrated and accepted. Change-password
and delete-account were shown in the personal cabinet. Deletion was not run destructively, and
the edit-personal-data / wrong-password / re-login paths were not exercised step by step in
this session.

**Customer comments / observed issues:** No defect raised. (There is no self-service password
reset in this release; the customer will provide a mail domain so it can be built — see the
Week 6 Sprint Review summary.)

**Resulting PBIs or issues:** —
