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

## UAT-006: Special conditions exclude contraindicated products

**Status:** Active

**User goal:** As a user with a special condition (e.g. pregnancy), I do not want products
that are unsuitable for my condition in my bag.

**Preconditions:** The deployed app is reachable.

**Steps:**
1. Complete the questionnaire and, on the conditions step, declare a condition (e.g.
   pregnancy).
2. Open the results screen and inspect the bag.

**Expected outcome:** No product whose ingredients are contraindicated for the declared
condition (e.g. a retinoid product during pregnancy) appears in the bag; the affected step
is filled with a suitable alternative or reported as empty, never with a contraindicated
product. Declaring no condition does not change the result.

**Related:** [US-20](https://github.com/Koyash-team/koyash/issues/124), [PBI-312](https://github.com/Koyash-team/koyash/issues/125).

**Execution results:** Not yet customer-executed — the safety filter (PBI-312) was
delivered after the 2026-07-03 review. Verified by automated tests
(`backend/tests/test_conditions.py`); scheduled for the next customer session.

**Customer comments / observed issues:** The customer approved the deterministic
rules-based approach at the 2026-07-03 review and may share an ingredient guide to refine
the mapping.

**Resulting PBIs or issues:** None open — mapping refinement is a follow-up on [PBI-312](https://github.com/Koyash-team/koyash/issues/125).
