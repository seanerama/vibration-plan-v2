# Orchestrate Build Workflow

Multi-stage build orchestration for /vp:build.

## Overview

The Stage Manager is unique — it can run multiple instances in parallel.
This workflow reads the Project Planner's stage instructions and orchestrates
implementation across one or more stages.

## Single Stage Execution

When `/vp:build <stage-number>` is called:

1. Read `vibration-plan/stage-instructions/stage-{N}-instruct.md`
2. Read relevant contracts from `vibration-plan/contracts/`
3. Read project-plan.md for cross-cutting standards
4. Read design-system.md if available

5. Create git branch:
   ```bash
   git checkout -b vp/stage-{N}-{slug}
   ```

6. Implement the stage:
   - Follow stage instruction file exactly
   - Build specified files, components, endpoints
   - Respect interface contracts
   - Follow cross-cutting standards (logging, error handling, etc.)
   - Write tests as specified in stage instructions

7. Verify:
   - Run tests
   - Check that all acceptance criteria are met
   - Validate interface contracts

8. Update project-state.md with stage completion

9. If pipeline test = YES:
   - Notify: "Stage {N} requires pipeline testing. Run /vp:test"

10. Merge to main:
    ```bash
    git checkout main
    git merge vp/stage-{N}-{slug}
    ```

## Multi-Stage Execution

When `/vp:build --all` is called:

1. Read all stage instruction files
2. Parse stage dependencies to determine execution order
3. Group independent stages into waves

4. For each wave:
   a. Report what's being built
   b. For each stage in the wave, use Task tool to spawn a sub-agent:
      - Each sub-agent gets: stage instruction, contracts, standards
      - Each works on its own branch
   c. Wait for all sub-agents to complete
   d. Verify all outputs
   e. Merge completed branches

5. Between waves:
   - Check for merge conflicts → suggest /vp:merge if needed
   - Run integration tests if specified
   - Update project-state.md

## Stage Instruction Format

Expected format from Project Planner:
```markdown
# Stage N: [Name]

## Objectives
- [What this stage accomplishes]

## What to Build
- [Files, components, endpoints]

## Interface Contracts
- Exposes: [What this stage provides to others]
- Consumes: [What this stage needs from others]

## Testing Requirements
- [Unit tests, integration tests]

## Pipeline Test: YES/NO

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```
