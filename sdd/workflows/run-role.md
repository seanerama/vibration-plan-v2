# Run Role Workflow

Generic wrapper for executing any VibrationPlan role. All role commands reference this workflow.

## Pre-Execution

1. **Load context** via `vp-tools init run-role <role-id>`
   - Returns: `can_run`, `missing_deps`, `model`, `existing_outputs`, `workflow_path`

2. **Dependency check**:
   - If `can_run: false` → Report missing dependencies, suggest the correct command to run first
   - If `needs_confirm: true` → Tell user an optional dependency was skipped, confirm to proceed
   - If `already_complete: true` → This is a re-invocation. Load previous outputs for context

3. **Mark role active**: `vp-tools state start-role <role-id>`

## Execution

4. **Load existing outputs** from completed dependencies:
   - Read files listed in `existing_outputs` for context
   - These inform the current role's work

5. **Execute the role-specific workflow**:
   - Follow the `<process>` section from the command file
   - The role prompt content guides the actual work
   - Collaborate with the Vision Lead (user) throughout

6. **Produce outputs**:
   - Write expected output files to their designated paths
   - Validate outputs exist before marking complete

## Post-Execution

7. **Complete role**: `vp-tools state complete-role <role-id> --output <path> [--output <path>...]`
   - Marks checklist item as [x] in STATE.md
   - Records outputs in the Outputs Produced table
   - Removes from Active Roles section

8. **Check next steps**: `vp-tools graph next`
   - Parse the output to determine available next roles

9. **Auto-continue the workflow**:
   - If exactly **1 next role** is available → Immediately invoke it via `/vp:<command>` (do NOT ask the user, just proceed)
   - If **multiple roles** are available that can run in parallel → Tell the user which are available and ask which to start first, then invoke the chosen one
   - If **no roles** are available → Announce "Workflow complete!" with a summary of all outputs produced
   - IMPORTANT: The goal is a continuous flow. The user should not have to manually type the next command.

## Error Handling

- If the role cannot complete (blocked, needs user decision):
  - Record session state: `vp-tools state record-session --stopped-at "description"`
  - Do NOT mark the role as complete
  - Inform user what's needed to continue
