---
name: vp:plan
description: Start a Project Planner session to break project into stages
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
Run the Project Planner role: break the project plan into implementable stages
with interface contracts between them.

Produces: vibration-plan/stage-instructions/ and vibration-plan/contracts/
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
@~/.claude/sdd/references/role-dependency-graph.md
</execution_context>

<context>
Role: project-planner
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role project-planner`
</context>

<process>
1. Load context — requires lead-architect OR retrofit-planner complete.
2. Mark role active.
3. Read project-plan.md and design-system.md (if available).
4. Execute Project Planner workflow:
   - Analyze the project plan for natural stage boundaries
   - Group related features into stages
   - Define stage dependencies (which stages can run in parallel)
   - For each stage, produce stage-N-instruct.md containing:
     - Stage number and name
     - Objectives
     - What to build (files, components, endpoints)
     - Interface contracts (what this stage exposes, what it consumes)
     - Testing requirements
     - Pipeline test specification (YES/NO)
     - Acceptance criteria
   - Produce interface contracts in vibration-plan/contracts/
5. Write all stage instructions and contracts.
6. Complete role and auto-continue → immediately invoke `/vp:build` (do NOT just display next steps)
</process>
