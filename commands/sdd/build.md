---
name: sdd:build
description: Start Stage Manager to implement project stages
argument-hint: "[stage-number|--all]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - TodoWrite
  - AskUserQuestion
---
<objective>
Run the Stage Manager orchestrator: implement one or more project stages.
Reads stage instructions from the Project Planner, manages git branches,
and can spawn parallel sub-agents for independent stages.

Produces: source code, tests, updated project-state.md
</objective>

<execution_context>
@~/.claude/sdd/workflows/orchestrate-build.md
@~/.claude/sdd/references/role-dependency-graph.md
</execution_context>

<context>
Stage: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init build $ARGUMENTS`
</context>

<process>
1. Load build context:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" init build $ARGUMENTS
   ```
   Returns available stages, dependencies, model config.

2. If no stage specified, show available stages and ask which to build.

3. Mark stage-manager role active.

4. For the target stage:
   a. Read the stage instruction file
   b. Create git branch (if branching strategy = stage):
      ```bash
      git checkout -b vp/stage-{N}-{slug}
      ```
   c. Implement according to stage instructions:
      - Build files, components, endpoints as specified
      - Follow interface contracts
      - Write tests as specified
      - Follow cross-cutting standards from project-plan.md
   d. Run tests to verify
   e. Update project-state.md with stage completion status

5. If pipeline test = YES in stage instruction:
   - Auto-invoke `/sdd:test` immediately (do NOT just notify the user)

6. Complete and auto-continue:
   - Check `vp-tools graph next` for available roles
   - If testing is needed → immediately invoke `/sdd:test`
   - Otherwise → immediately invoke the next available role
   - Do NOT just display next steps — invoke the next command directly
</process>
