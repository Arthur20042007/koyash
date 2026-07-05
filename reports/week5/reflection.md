# Week 5 Reflection

## Learning points

- **Documenting the architecture surfaced implicit decisions.** Writing the static, dynamic,
  and deployment views plus the ADRs forced us to state choices that were previously
  implicit — a rule-based selection engine with the LLM only *verbalizing* the result, and
  safety filters as deterministic rules. Once written down (ADR-001), later choices fell out
  of it naturally (e.g. handling special conditions with rules, not the LLM).
- **Measure before deciding.** The budget "precision" problem dissolved once we measured real
  bag totals against the displayed ranges: the ranges were arbitrary, per-item tiers were
  clean, and the honest fix was in the presentation — not in re-engineering selection.
- **An external LLM is safest as an additive, bypassable layer.** Config-gating the LLM with
  a rule-based fallback let us integrate and demo it without betting the deployed product on
  a variable-latency external service.

## Validated assumptions

- Keeping the LLM strictly to "reword the already-made decision" held up in practice — the
  customer's own prompt reinforced it, and it kept safety-relevant logic (allergens,
  conditions) in deterministic, testable code.
- Small issue-linked PRs plus a required-status-checks ruleset on `main` kept the default
  branch releasable across a Sprint with a lot of parallel work.

## Friction and gaps

- The customer-authored LLM prompt is not final (a model change to Gemini is expected), so
  prompt/model is a moving target and required several iterations.
- Frontend capacity was the bottleneck: the skin-type mini-quiz reached design-only.
- Some maintained documentation drifted from the delivered state and needed a consistency
  pass late in the week.

## Planned response

- Sequence the mini-quiz frontend work first next Sprint and pair on it.
- Continue treating the LLM prompt/model as configuration and re-adapt when the customer
  switches to Gemini.
- Add a lightweight "do the maintained docs still match reality?" check to our
  Definition-of-Done review so drift is caught during the Sprint, not at the end.
