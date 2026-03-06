---
name: vp:architect
description: Start a Lead Architect session to design project architecture
argument-hint: "[resume]"
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
Run the Lead Architect role: co-design the project's technical architecture,
tech stack, deployment strategy, and standards with the Vision Lead (user).

Produces: vibration-plan/project-plan.md and vibration-plan/deploy-instruct.md
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
@~/.claude/sdd/references/role-dependency-graph.md
</execution_context>

<context>
Role: lead-architect
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role lead-architect`
</context>

<process>
1. Load context:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role lead-architect
   ```
   Validates Vision Assistant dependency (optional — can skip with confirmation).

2. If dependencies not met, report and offer alternatives.

3. Mark role active:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" state start-role lead-architect
   ```

4. Load vision-document.md if available.

5. Execute Lead Architect workflow:
   - Clarify and refine the project idea
   - Define technical architecture
   - Choose tech stack
   - Identify core features and scope
   - Establish project structure
   - Define cross-cutting standards (logging, error handling, auth, code style)
   - Define deployment strategy
   - Define secrets management (.env by default)
   - Set initial project version
   - Produce project-plan.md and deploy-instruct.md

6. Write outputs to vibration-plan/:
   - project-plan.md (comprehensive architecture doc)
   - deploy-instruct.md (deployment instructions for Project Deployer)

7. Complete role:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" state complete-role lead-architect --output vibration-plan/project-plan.md --output vibration-plan/deploy-instruct.md
   ```

8. Auto-continue — check `vp-tools graph next` and immediately invoke the next role.
   Do NOT just display the next steps — invoke the next command (typically `/vp:plan`) directly.
</process>
