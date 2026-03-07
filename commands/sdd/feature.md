---
name: sdd:feature
description: Start a Feature Manager session to assess a feature request
argument-hint: "<feature-description>"
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - TodoWrite
  - AskUserQuestion
---
<objective>
Run the Feature Manager role: assess a mid-development feature request.
Determine impact, recommend accept/defer/reject, and if accepted,
create instructions for implementation.

Produces: vibration-plan/feature-assessments/
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
</execution_context>

<context>
Role: feature-manager
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role feature-manager`
</context>

<process>
1. Load context — requires project-planner complete. Event-triggered role.
2. Mark role active.
3. Read project-plan.md, current stage instructions, and project-state.md.
4. Assess the feature request:
   - Impact on existing stages and contracts
   - Scope and complexity estimate
   - Recommend: accept (add to current plan), defer (post-v1), or reject (out of scope)
5. If accepted, create stage instructions for the new feature.
6. Write assessment to vibration-plan/feature-assessments/.
7. Complete role and auto-continue → check `vp-tools graph next` and immediately invoke the next available role (do NOT just display next steps).
</process>
