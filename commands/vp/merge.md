---
name: vp:merge
description: Start a Merge Manager session to resolve branch conflicts
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
Run the Merge Manager role: resolve merge conflicts between parallel
stage branches. Event-triggered when parallel Stage Managers create conflicts.
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
</execution_context>

<context>
Role: merge-manager
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role merge-manager`
</context>

<process>
1. Load context — requires stage-manager active/complete. Event-triggered role.
2. Mark role active.
3. Identify conflicting branches and affected files.
4. Resolve merge conflicts:
   - Read both versions of conflicted files
   - Understand intent from stage instructions
   - Merge intelligently, preserving both changes
   - Run tests to verify merged code works
5. Document resolution in merge report.
6. Complete role and auto-continue → check `vp-tools graph next` and immediately invoke the next available role (do NOT just display next steps).
</process>
