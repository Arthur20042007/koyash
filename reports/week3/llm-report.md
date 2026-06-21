# LLM Usage Report — Week 3

The team used AI/LLM tools as productivity aids during Assignment 3. All AI-assisted
output was reviewed, edited, and validated by the team before inclusion. The
substantive product decisions — the recommendation logic, the MVP v1 scope,
prioritization, the design direction, and the customer-facing choices — are the team's
own. AI accelerated implementation and routine drafting; it did not make the product
decisions.

## Tools and how they were used

**Claude Code** — used to write essentially all of the code in this Sprint:

- Backend `/recommend` implementation: hard filters, core-chain assembly, occasional
  block, total-price budget passes (downgrade/upgrade), and the high-segment guard.
  *The selection logic itself was designed by the team; Claude Code implemented the
  agreed design.*
- Database / data-layer work: normalizing `allergens_norm`, deriving
  `main_actives_short`, and validating field distributions.
- Frontend: scaffolding the questionnaire and results screens, integration with the
  API, and translating the agreed design into code.
- Deployment fixes (Dockerfile / Railway `PORT` compatibility).

**Claude (chat)** — used for drafting and structuring, with team review on every output:

- Drafting and refining the wording of issues and their acceptance criteria.
  The team decided what counts as a separate PBI, which criteria were testable, and
  what belonged in MVP v1; the model helped phrase and format them.
- Helping structure the Week 3 reports (reflection, retrospective, this report) and
  the customer review summary.
- Consolidating and sanitizing the customer review transcript: cleanup, English
  translation, PII/redaction, and timestamp formatting.

**ChatGPT** — used for design assets only:

- Generating the sun-mascot illustrations. The overall design and its refinement were
  done by the team; only the images were AI-generated.

