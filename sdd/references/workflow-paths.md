# Workflow Paths

## New Project

For building something from scratch.

**Sequence**: VA → LA (+UXD) → PP → SM(s) → PT/HT → TW/SA → PD → SRE

1. **/vp:start** → choose "new project"
2. **/vp:vision** (optional) → clarify your idea
3. **/vp:architect** + **/vp:designer** (parallel) → design architecture + visual system
4. **/vp:plan** → break into stages
5. **/vp:build** → implement stages (one or parallel)
6. **/vp:test** + **/vp:handoff** (parallel) → test + UX feedback
7. **/vp:docs** + **/vp:security** (parallel) → documentation + security review
8. **/vp:deploy** → deploy
9. **/vp:sre** → operational setup

## Existing Project

For enhancing, refactoring, or fixing an existing codebase.

**Sequence**: RP → PP → SM(s) → PT/HT → TW/SA → PD → SRE

1. **/vp:start** → choose "existing project"
2. **/vp:retrofit** → analyze codebase, document state, plan changes
3. **/vp:plan** → break changes into stages
4. (same as new project from step 5 onward)

## On-Demand Roles

Available at any time, triggered by events:

- **/vp:map** — Create codebase diagram (no dependencies)
- **/vp:merge** — Resolve merge conflicts (triggered by parallel stage work)
- **/vp:feature** — Assess feature requests (triggered by user or handoff tester)
