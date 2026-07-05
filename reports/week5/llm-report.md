# LLM Usage Report — Week 5

This report discloses how AI / LLM tools were used during Assignment 5, both inside the
product and as development assistance.

## LLM inside the product (delivered feature)

MVP v2 adds an optional **LLM justification layer**: when enabled, `POST /recommend` sends
each already-selected product's context (skin type, concerns, routine step, translated key
actives, `concern_match`) to **gpt-4o-mini** (via an OpenAI-compatible endpoint provided by
the customer) and shows the reworded "why" text on each product card.

- The model **only verbalizes the already-made rule-based recommendation** — it does not
  analyze ingredients or decide whether a product fits (ADR-001). Selection stays
  deterministic.
- It is **off by default** (`LLM_ENABLED=false`) and falls back to the rule-based text on any
  error, so it never changes which products are recommended and never blocks the response.
- The system prompt was authored by the customer and iterated with her over several spike
  runs before integration; it is treated as customer-owned configuration and is not
  committed to the repository. The API key is a secret supplied via the environment.
- The customer expects to change the model (e.g. to Gemini) later, which will require
  re-adapting the prompt.

## AI tools used for development

The team used an AI coding/writing assistant during the Sprint to help with:

- **Writing and editing documentation** — drafting the architecture views commentary, ADRs,
  the development-process document, testing/UAT/DoD updates, and this week's reports.
- **Diagrams-as-code** — drafting the PlantUML sources (component / sequence / deployment)
  and the Mermaid `gitGraph`, which were then rendered and reviewed.
- **Code** — drafting the budget-label changes, the LLM integration layer, and the
  special-condition safety filter, together with their tests.
- **Planning and analysis** — refining backlog items, and a throwaway measurement script used
  to sample real bag totals for the budget decision.

All AI-assisted output was **reviewed by the team and merged through the normal
issue-linked, peer-reviewed PR workflow** with the CI quality gates (lint, type-check,
build, tests, coverage, quality-requirement tests, dependency scan, link check) enforced on
the protected `main` branch. Product and process decisions were made by the team; the AI was
used as an assistant, not an authority.

## Transcription / translation

The Sprint Review was held in Russian; the published transcript is an English rendering,
sanitized by the team to use roles instead of names.
