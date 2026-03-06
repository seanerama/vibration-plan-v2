/**
 * Tests for state.cjs — STATE.md operations
 */

const { stateExtractField, stateReplaceField, extractFrontmatter, stripFrontmatter, buildStateFrontmatter } = require('../sdd/bin/lib/state.cjs');

// ─── Field Extraction ────────────────────────────────────────────────────────

const sampleState = `
# VibrationPlan State

## Workflow

**Path:** New Project
**Current Phase:** 1 - Design
**Status:** In Progress

## Completed Roles

- [x] Vision Assistant — vibration-plan/vision-document.md (2026-02-27)
- [ ] Lead Architect — project-plan.md, deploy-instruct.md
- [ ] Project Planner — stage-instructions/

## Active Roles

**Lead Architect:** In progress — architecture discussion

## Outputs Produced

| Role | Output | Path | Date |
|------|--------|------|------|
| Vision Assistant | vision-document.md | vibration-plan/vision-document.md | 2026-02-27 |

## Session Continuity

**Last Session:** 2026-02-27T15:30:00Z
**Stopped At:** Discussing tech stack
**Resume Context:** Continue architecture discussion
`;

assertEqual(stateExtractField(sampleState, 'Path'), 'New Project', 'Extract Path field');
assertEqual(stateExtractField(sampleState, 'Current Phase'), '1 - Design', 'Extract Current Phase');
assertEqual(stateExtractField(sampleState, 'Status'), 'In Progress', 'Extract Status');
assertEqual(stateExtractField(sampleState, 'Last Session'), '2026-02-27T15:30:00Z', 'Extract Last Session');
assertEqual(stateExtractField(sampleState, 'Stopped At'), 'Discussing tech stack', 'Extract Stopped At');
assertEqual(stateExtractField(sampleState, 'Nonexistent'), null, 'Extract returns null for missing');

// ─── Field Replacement ───────────────────────────────────────────────────────

const updated = stateReplaceField(sampleState, 'Status', 'Complete');
assert(updated !== null, 'stateReplaceField should return updated content');
assertEqual(stateExtractField(updated, 'Status'), 'Complete', 'Replaced Status value');
// Original field should be unchanged
assertEqual(stateExtractField(updated, 'Path'), 'New Project', 'Other fields preserved after replace');

const notFound = stateReplaceField(sampleState, 'Nonexistent', 'value');
assert(notFound === null, 'stateReplaceField returns null for missing field');

// ─── Frontmatter Extraction ─────────────────────────────────────────────────

const withFm = `---
vp_state_version: "1.0"
workflow_path: "new"
status: "in_progress"
---

# VibrationPlan State
`;

const fm = extractFrontmatter(withFm);
assertEqual(fm.vp_state_version, '1.0', 'Extract frontmatter string value');
assertEqual(fm.workflow_path, 'new', 'Extract frontmatter workflow_path');
assertEqual(fm.status, 'in_progress', 'Extract frontmatter status');

const noFm = extractFrontmatter('# No frontmatter here');
assert(Object.keys(noFm).length === 0, 'No frontmatter returns empty object');

// ─── Strip Frontmatter ──────────────────────────────────────────────────────

const stripped = stripFrontmatter(withFm);
assert(!stripped.includes('---'), 'stripFrontmatter removes frontmatter delimiters');
assert(stripped.includes('# VibrationPlan State'), 'stripFrontmatter preserves body');

const noFmStripped = stripFrontmatter('# No frontmatter');
assertEqual(noFmStripped, '# No frontmatter', 'stripFrontmatter is no-op without frontmatter');

// ─── Build Frontmatter from Body ─────────────────────────────────────────────

const bodyContent = sampleState;
const builtFm = buildStateFrontmatter(bodyContent, null);

assertEqual(builtFm.vp_state_version, '1.0', 'Built FM has version');
assertEqual(builtFm.workflow_path, 'new project', 'Built FM has workflow path (lowercased)');
assert(builtFm.last_updated !== undefined, 'Built FM has last_updated');
assert(builtFm.progress !== undefined, 'Built FM has progress');
assert(builtFm.progress.completed_roles === 1, 'Built FM counts 1 completed role');
assert(builtFm.progress.total_roles === 3, 'Built FM counts 3 total roles');

console.log(`  ✓ All state tests passed`);
