---
name: vp:deploy
description: Start a Project Deployer session to deploy the project
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
Run the Project Deployer role: deploy the project using the instructions
from deploy-instruct.md. May use MCP tools for cloud platforms.
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
</execution_context>

<context>
Role: project-deployer
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role project-deployer`
</context>

<process>
1. Load context — requires project-tester complete.
2. Mark role active.
3. Read vibration-plan/deploy-instruct.md for deployment instructions.
4. Execute deployment:
   - Follow deploy-instruct.md step by step
   - Use MCP tools if available (Render, Cloudflare, etc.)
   - Configure environment variables
   - Run deployment commands
   - Verify deployment is live and healthy
5. Update project-state.md with deployment status.
6. Complete role and auto-continue → immediately invoke `/vp:sre` (do NOT just display next steps)
</process>
