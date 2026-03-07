# Start Existing Project Workflow

Initializes vibration-plan/ for an existing project that needs changes.

## Steps

1. **Create directory structure** (same as new project):
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
   - Path: Existing Project
   - Current Phase: 1 - Design
   - Status: Not Started
   - Roles set for existing project sequence (Retrofit Planner instead of VA + LA)

3. **Initialize config.json**:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" config ensure
   ```

4. **Update .gitignore**:
   - Add `vibration-plan/` if not already present
   - Add `.env` if not already present

5. **Auto-invoke first role**:
   - Immediately invoke `/sdd:retrofit` to analyze the codebase and plan changes.
   - IMPORTANT: Do NOT just tell the user to run it — invoke it directly.
