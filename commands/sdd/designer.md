---
name: sdd:designer
description: Start a UI/UX Designer session to define visual system
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
Run the UI/UX Designer role: define the visual system, design tokens,
component patterns, and UX guidelines. Can run in parallel with Lead Architect.

Produces: vibration-plan/design-system.md
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
@~/.claude/sdd/references/role-dependency-graph.md
</execution_context>

<context>
Role: ui-ux-designer
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role ui-ux-designer`
</context>

<process>
1. Load context and check dependencies.
2. Mark role active.
3. Load vision-document.md if available for design context.
4. Execute UI/UX Designer workflow:
   - Define color palette and design tokens
   - Establish typography scale
   - Design component patterns (buttons, forms, cards, navigation)
   - Define layout system and responsive breakpoints
   - Create UX guidelines (interaction patterns, accessibility standards)
   - Define animation and transition patterns
   - Document the design system
5. Write vibration-plan/design-system.md.
6. Complete role and auto-continue → check `vp-tools graph next` and immediately invoke the next available role (do NOT just display next steps).
</process>
