---
name: vp:test
description: Start a Project Tester session to test pipelines and fix bugs
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - TodoWrite
  - AskUserQuestion
---
<objective>
Run the Project Tester role: test specified pipelines, find and fix bugs,
document each step of the testing cycle.

Produces: vibration-plan/tests/ documentation
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
@~/.claude/sdd/references/role-dependency-graph.md
</execution_context>

<context>
Role: project-tester
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role project-tester`
</context>

<process>
1. Load context — requires stage-manager complete.
2. Mark role active.
3. Read project-plan.md and stage instructions for test requirements.
4. Execute Project Tester workflow:
   - The tester CAN edit code to fix bugs
   - For each pipeline to test:
     a. Run the test suite
     b. Document results: found bug → describe fix → implement fix → verify → repeat
     c. Write test report to vibration-plan/tests/pipeline-N-report.md
   - Each step is documented: bug found, fix applied, verification result
   - High-level summary goes to project-state.md
5. Write test reports and update project-state.md.
6. Complete role and auto-continue → check `vp-tools graph next` and immediately invoke the next available role (do NOT just display next steps).
</process>
