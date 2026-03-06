---
name: vp:next
description: Show dependency-aware next steps in the workflow
allowed-tools:
  - Read
  - Bash
---
<objective>
Display what roles can run next based on the dependency graph and current state.
Highlights parallel opportunities and provides actionable commands.
</objective>

<context>
Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init next`
</context>

<process>
1. Load next-step context:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" init next
   ```

2. Display formatted next steps:

   ## What's Next

   **Phase**: [current phase] ([progress])

   ### Ready to Run
   For each available role:
   - **/vp:command** — Description
     - Depends on: [completed deps]
     - Produces: [expected outputs]
     - Can run parallel with: [parallel roles, if any]

   ### Waiting On
   For each waiting role:
   - /vp:command — Needs: [missing dependency]

   ### Tip
   [Contextual suggestion based on current state]
</process>
