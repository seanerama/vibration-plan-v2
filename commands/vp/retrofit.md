---
name: vp:retrofit
description: Start a Retrofit Planner session for existing project analysis
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
Run the Retrofit Planner role: analyze an existing codebase, document current state,
and work with the Vision Lead to define planned changes. Replaces Vision Assistant
and Lead Architect for existing projects.

Produces: vibration-plan/project-plan.md and vibration-plan/project-state.md
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
@~/.claude/sdd/references/role-dependency-graph.md
</execution_context>

<context>
Role: retrofit-planner
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role retrofit-planner`
</context>

<process>
1. Load context and check dependencies.
2. Mark role active.
3. Execute Retrofit Planner workflow:
   - **Phase 1: Codebase Analysis**
     - Explore all directories, files, configs
     - Identify tech stack (languages, frameworks, DBs)
     - Map architecture (frontend, backend, APIs, data layer)
     - Find entry points and key patterns
   - **Phase 2: Document Current State**
     - Write project-state.md with current system description
     - Document what works, what doesn't, known issues
   - **Phase 3: Define Changes**
     - Work with VL to define what needs to change
     - Capture high-level goals (refactors, features, fixes)
     - Document in project-plan.md
   - **Phase 4: Output**
     - project-plan.md (architecture + planned changes)
     - project-state.md (current state documentation)
4. Complete role and auto-continue → immediately invoke `/vp:plan` (do NOT just display next steps)
</process>
