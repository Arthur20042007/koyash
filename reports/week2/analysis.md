# Analysis - Week 2

## Learning points

- **User stories: separate the action from the value.** Our first draft tied the questionnaire's narrative format to recommendation quality ("so that I provide data for a good recommendation"). The customer pointed out these are unrelated — a good recommendation is owned by the filtering logic, while the narrative only serves the *experience* of not feeling pressured. We rewrote US-02, US-05, and US-07 to keep the user value clean and honest.
- **Personas are not one-size-fits-all.** We had defaulted most stories to the "overwhelmed chooser." The ethics story (US-07) is really a values motivation, not a choice-overload one, so it got its own persona.
- **MoSCoW is project-level; task-level needs a different tool.** MoSCoW fits the whole-course product scope, but for prioritizing day-to-day tasks the customer recommended ICE / RICE. We learned these operate at different granularities and shouldn't be conflated.
- **A rough prototype is enough to unblock design.** A low-fidelity, clickable prototype was sufficient to get concrete, actionable feedback. We did not need a polished design to validate direction.
- **A foundational brand choice cascades through the whole design.** We built the prototype around one logo; when the customer saw the handwritten-logo variant she preferred it and asked us to redo the design under it, so we reworked the visual design entirely. The lesson is to confirm the foundational brand element before building the full design on top of it, and to bring intermediate versions for early sign-off rather than polishing one direction.

## Validated assumptions

- **Photos are not needed; icons work — confirmed.** The assumption that product photos add value was rejected: photo quality across ~70 products is inconsistent, and the customer endorsed category icons. US-10 stays Could Have.
- **Landing page is not required for the first working version — confirmed.** This rejected our initial scope assumption and led to dropping US-01 from the MVP v1 scope.
- **Skin-type handling — revised, not deferred.** We assumed the empty `skintype` data forced US-09 down to Should Have. After the customer offered that the team could fill the markup, we took ownership of it and kept US-09 as Must Have.
- **Logo direction — confirmed.** The handwriting-based logo got a strong positive reaction and was selected; the team-designed wordmark was dropped.

## Needs clarification

- **Final customer approval pending.** The updated stories and trimmed MVP v1 scope still need explicit customer approval.
- **Redesigned prototype not yet reviewed by the customer.** Following the logo change, the visual design was fully redone under the selected logo. The redesigned prototype is being sent to the customer for review, but with only a few hours before submission she is unlikely to review it in time, so design feedback and approval remain open. 
- **Per-product reasoning text format.** The structural reasoning shown on each card (built from dataset fields, no LLM) still needs a defined format spec.
- **Backend↔frontend API contract.** The contract between the recommendation backend and the frontend needs to be finalized before MVP v1 build.

## Planned response

- **Story edits applied.** Some user stories reworded; US-09 kept Must with team-owned skin-type markup.
- **MVP v1 scope trimmed.** Scope is US-02–US-08 (questionnaire → controlled budget → ordered, justified bag from the real catalog).
- **Prioritization for Assignment 3.** Adopt a task tracker used daily, and apply ICE / RICE at the task level when the scope is estimated and finalized.
- **Skin-type markup scheduled** as a parallel team task so US-09 remains deliverable (US-09).
- **Resolve technical seams before building MVP v1:** deployment architecture, the backend↔frontend API contract, and the per-product reasoning format.
- **Design review.** Send the redesigned prototype to the customer.
- **Book a customer slot** to obtain final approval of the updated stories, scope, and design.