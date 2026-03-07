---
name: sdd:sre
description: Start an SRE session for post-deployment operations
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
Run the Site Reliability Engineer role: configure monitoring, backups,
recovery procedures, and operational runbooks post-deployment.

Produces: recovery-plan.md
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
</execution_context>

<context>
Role: sre
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role sre`
</context>

<process>
1. Load context — requires project-deployer complete.
2. Mark role active.
3. Read deploy-instruct.md and project-state.md.
4. Execute SRE workflow:
   - Configure health checks and monitoring
   - Set up backup schedule and verification
   - Create disaster recovery procedures
   - Define alert thresholds and channels
   - Write operational runbooks
5. Write recovery-plan.md at project root.
6. Update project-state.md with SRE setup info.
7. Complete role and auto-continue → check `vp-tools graph next` and immediately invoke the next available role, or announce "Workflow complete!" if no roles remain.
</process>
