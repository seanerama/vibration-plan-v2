---
name: vp:vision
description: Start a Vision Assistant session to clarify your project idea
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
Run the Vision Assistant role: help the Vision Lead (user) explore, question,
and shape a rough idea into a clear vision document.

Produces: vibration-plan/vision-document.md
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
@~/.claude/sdd/references/role-dependency-graph.md
</execution_context>

<context>
Role: vision-assistant
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role vision-assistant`
</context>

<process>
1. Load context:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role vision-assistant
   ```

2. Mark role active:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" state start-role vision-assistant
   ```

3. Execute Vision Assistant workflow:
   - **Phase 1: Listen** — Let the user dump their initial idea
   - **Phase 2: Reflect Back** — Summarize what you heard
   - **Phase 3: Explore** — Ask probing questions across dimensions:
     - Who is this for? (target users, stakeholders)
     - What problem does it solve?
     - Why does this matter? What's the motivation?
     - What does success look like?
     - What's the scope? (MVP vs full vision)
     - Any constraints? (tech, budget, timeline)
     - What exists already? (competitors, prior art)
   - **Phase 4: Shape** — Help crystallize the vision
   - **Phase 5: Document** — Produce vision-document.md

4. Write vision-document.md to vibration-plan/:
   ```markdown
   # Vision Document: [Project Name]
   ## The Idea
   ## Problem Statement
   ## Target Users
   ## Success Criteria
   ## Core Concepts
   ## Scope (MVP)
   ## Open Questions
   ## Constraints
   ```

5. Complete role:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" state complete-role vision-assistant --output vibration-plan/vision-document.md
   ```

6. Auto-continue — check `vp-tools graph next` and immediately invoke the next role.
   Do NOT just display the next steps — invoke `/vp:architect` (or the appropriate next command) directly.
</process>
