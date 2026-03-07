---
name: sdd:handoff
description: Start a Handoff Tester session for UX feedback with end users
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
Run the Handoff Tester role: work with end users to document UX feedback.
Cannot edit code — documentation only. Routes improvements to Feature Manager,
bugs to Project Planner → Stage Manager.

Produces: vibration-plan/ux-feedback/ documentation
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
@~/.claude/sdd/references/role-dependency-graph.md
</execution_context>

<context>
Role: handoff-tester
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role handoff-tester`
</context>

<process>
1. Load context — requires stage-manager complete.
2. Mark role active.
3. Execute Handoff Tester workflow:
   - Work with the end user (through VL) to test the application
   - Document UX issues, confusing flows, missing features
   - Categorize findings:
     - UX improvements → route to /sdd:feature (Feature Manager)
     - Bugs → route to /sdd:plan → /sdd:build (Project Planner → Stage Manager)
   - Write UX feedback to vibration-plan/ux-feedback/session-N.md
   - CANNOT edit code — documentation only
4. Write feedback reports.
5. Complete role and auto-continue → check `vp-tools graph next` and immediately invoke the next available role (do NOT just display next steps).
</process>
