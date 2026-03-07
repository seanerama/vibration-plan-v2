# Start New Project Workflow

Initializes vibration-plan/ for a brand new project.

## Steps

1. **Create directory structure**:
   ```
   vibration-plan/
   ├── STATE.md
   ├── config.json
   ├── stage-instructions/
   ├── contracts/
   ├── tests/
   └── ux-feedback/
   ```

2. **Initialize STATE.md** from template with:
   - Path: New Project
   - Current Phase: 1 - Design
   - Status: Not Started
   - All roles unchecked in the new project sequence

3. **Initialize config.json** from template:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" config ensure
   ```

4. **Update .gitignore**:
   - Add `vibration-plan/` if not already present
   - Add `.env` if not already present

5. **Initialize git** (if not already a repo):
   ```bash
   git init
   git add .gitignore
   git commit -m "Initial commit: project setup with spec-driven-devops"
   ```

6. **Auto-invoke first role**:
   - Ask: "Do you have a rough idea you'd like to explore first, or should we jump straight to architecture?"
   - If user wants to explore → Immediately invoke `/sdd:vision` (do NOT just tell them to run it)
   - If user wants to skip → Immediately invoke `/sdd:architect` (do NOT just tell them to run it)
   - IMPORTANT: Always invoke the next role directly. Never leave the user with a "run X" instruction.
