---
name: sdd:docs
description: Start a Technical Writer session to create public documentation
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
Run the Technical Writer role: create public-facing documentation including
README, API docs, and user guides. Can run parallel with Security Auditor.

Produces: README.md, docs/ directory
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
</execution_context>

<context>
Role: technical-writer
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role technical-writer`
</context>

<process>
1. Load context — requires stage-manager complete.
2. Mark role active.
3. Read project-plan.md, project-state.md, and explore the codebase.
4. Execute Technical Writer workflow:
   - Write project README.md (features, installation, usage, API reference)
   - Create docs/api.md if the project exposes an API
   - Create docs/user-guide.md if there are non-technical end users
   - No framework leakage — don't mention VibrationPlan or internal roles
   - User-first writing: show don't tell, code examples, progressive disclosure
5. Write documentation files.
6. Complete role and auto-continue → check `vp-tools graph next` and immediately invoke the next available role (do NOT just display next steps).
</process>
