---
name: sdd:status
description: Show current VibrationPlan workflow state and progress
allowed-tools:
  - Read
  - Bash
---
<objective>
Display the current state of the VibrationPlan workflow: completed roles,
active roles, available next steps, and overall progress.
</objective>

<context>
Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init status`
</context>

<process>
1. Load full status:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" init status
   ```

2. Display a formatted status report:

   ## VibrationPlan Status

   **Workflow**: [New/Existing] Project
   **Progress**: [██████░░░░] X% (Y of Z roles complete)

   ### Completed
   - [list completed roles with outputs and dates]

   ### Active
   - [list currently active roles]

   ### Available Next
   - [list roles that can run now, with /sdd:command]
   - [note parallel opportunities]

   ### Waiting
   - [list roles waiting on dependencies]

   ### Event-Triggered (on demand)
   - /sdd:merge — when merge conflicts arise
   - /sdd:feature — when feature requests come in
   - /sdd:map — anytime (codebase diagram)
</process>
