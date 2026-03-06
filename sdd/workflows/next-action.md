# Next Action Workflow

Logic for /vp:next — determining what to do next in the workflow.

## Resolution Logic

1. Load graph status via `vp-tools init next`
2. Display results grouped by actionability:

### Priority Order
1. **Active roles** — remind user what's currently in progress
2. **Available roles** — what can run right now (deps satisfied)
3. **Parallel opportunities** — roles that can run simultaneously
4. **Waiting roles** — what's blocked and what it needs

### Contextual Suggestions

Based on current state, provide tailored advice:

- If no roles active and no roles completed:
  → "Run /vp:start to begin your project"

- If in Design phase with VA complete:
  → "Ready for architecture. Run /vp:architect (and optionally /vp:designer in parallel)"

- If in Planning phase:
  → "Break the project into stages with /vp:plan"

- If all stages complete but no testing:
  → "Implementation complete! Time to test: /vp:test"

- If testing complete:
  → "Ready for docs and deployment: /vp:docs and /vp:security can run in parallel"

- If deployment complete:
  → "Project deployed! Consider /vp:sre for operational setup"
