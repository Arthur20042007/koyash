# Sprint 3 Retrospective

## What went well

- The large Assignment-5 documentation block landed as small, reviewable, per-topic PRs:
  the static/dynamic/deployment architecture views and three ADRs, the development-process
  doc with a Mermaid `gitGraph`, and the MkDocs → GitHub Pages hosted docs site — each its
  own issue-linked PR rather than one batch.
- The two budget questions left open at the previous review were finally resolved with a
  *measured* decision: real assembled-bag totals were sampled against the displayed ranges,
  which showed the ranges were arbitrary and that per-item tiers are clean — so the fix
  became an honest presentation change instead of risky price-band engineering.
- The LLM justification layer shipped safely: additive, config-gated (`LLM_ENABLED=false`
  by default), with a rule-based fallback, so enabling it never risked the deployed product.
  The prompt was iterated with the customer over several spike runs before any integration.
- The special-condition safety filter was built as deterministic rules (not via the LLM),
  with automated tests — keeping a safety-relevant behaviour verifiable and predictable.

## What did not go well

- The skin-type mini-quiz (US-19 / PBI-301) only reached the Figma-design stage; the
  frontend implementation slipped and is not yet in the product.
- The customer-authored LLM prompt needed several back-and-forth iterations, and gpt-4o-mini
  still doesn't perfectly hold the tone/≤200-char rules (a switch to Gemini is anticipated) —
  some mid-Sprint churn.
- A few maintained docs had drifted from reality (stale org links, "MVP v1" status,
  "in progress" markers) and needed a cleanup pass late in the Sprint.

## What the team changed or attempted to change based on the previous Sprint Retrospective, and what results they observed

- **Applied Sprint 2 AP1 (keep integrating work in small, frequent commits):** architecture
  and product work were split into many small issue-linked PRs (one per view/feature)
  instead of batching near the review. Result: fast CI feedback and easy reviews; `main`
  stayed releasable throughout.
- **Applied Sprint 2 AP2 (extend automated frontend coverage to other flows):** the
  `buildRequest` change for conditions shipped with an added frontend test, and existing
  frontend tests were kept green across the payload changes. Result: partial — request-shape
  logic is well covered, but broad UI-screen coverage is still limited (carried forward).

## Action points

1. Land the skin-type mini-quiz in the frontend early next Sprint — pair backend/frontend on
   the flow so design-ready work does not slip to design-only again.
2. Before enabling an external LLM in production, agree the final model and prompt with the
   customer up front to cut the mid-Sprint prompt churn.
