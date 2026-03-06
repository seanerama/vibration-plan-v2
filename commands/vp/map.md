---
name: vp:map
description: Start a Codebase Mapper session to create an interactive diagram
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
Run the Codebase Mapper role: explore the entire codebase and produce
an interactive HTML diagram showing tech stack, architecture, data flows,
and user interactions. Available at any time during the workflow.

Produces: codebase-map.html
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
</execution_context>

<context>
Role: codebase-mapper
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role codebase-mapper`
</context>

<process>
1. Load context — no dependencies, available anytime.
2. Mark role active.
3. Execute Codebase Mapper workflow:
   - **Phase 1: Discovery** — List files, read configs, identify tech stack
   - **Phase 2: Architecture Mapping** — Trace frontend, API, services, data
   - **Phase 3: Flow Tracing** — Pick 3-5 major user actions, trace full paths
   - **Phase 4: Diagram Construction** — Build interactive HTML with:
     - Dark theme, color-coded nodes by layer
     - Clickable nodes showing file paths and connections
     - Animated data flow connections
     - Layer toggle, view presets, search
     - Zoom and pan support
4. Write codebase-map.html at project root.
5. Complete role.
</process>
