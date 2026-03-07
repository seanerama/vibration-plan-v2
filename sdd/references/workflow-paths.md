# Workflow Paths

## New Project

For building something from scratch.

**Sequence**: VA → LA (+UXD) → PP → SM(s) → PT/HT → TW/SA → PD → SRE

1. **/sdd:start** → choose "new project"
2. **/sdd:vision** (optional) → clarify your idea
3. **/sdd:architect** + **/sdd:designer** (parallel) → design architecture + visual system
4. **/sdd:plan** → break into stages
5. **/sdd:build** → implement stages (one or parallel)
6. **/sdd:test** + **/sdd:handoff** (parallel) → test + UX feedback
7. **/sdd:docs** + **/sdd:security** (parallel) → documentation + security review
8. **/sdd:deploy** → deploy
9. **/sdd:sre** → operational setup

## Existing Project

For enhancing, refactoring, or fixing an existing codebase.

**Sequence**: RP → PP → SM(s) → PT/HT → TW/SA → PD → SRE

1. **/sdd:start** → choose "existing project"
2. **/sdd:retrofit** → analyze codebase, document state, plan changes
3. **/sdd:plan** → break changes into stages
4. (same as new project from step 5 onward)

## On-Demand Roles

Available at any time, triggered by events:

- **/sdd:map** — Create codebase diagram (no dependencies)
- **/sdd:merge** — Resolve merge conflicts (triggered by parallel stage work)
- **/sdd:feature** — Assess feature requests (triggered by user or handoff tester)
