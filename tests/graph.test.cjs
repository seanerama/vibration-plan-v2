/**
 * Tests for graph.cjs — Dependency engine
 */

const {
  canRoleRun, getNextRoles, getWaitingRoles, getGraphStatus, getWorkflowSequence,
  isRoleComplete, isRoleReplaced,
} = require('../sdd/bin/lib/graph.cjs');

// ─── Empty State (new project) ───────────────────────────────────────────────

const emptyState = { workflow_path: 'new', completed_roles: [], active_roles: [] };

// VA has no dependencies — should be runnable
const vaCheck = canRoleRun('vision-assistant', emptyState);
assert(vaCheck.can_run === true, 'VA should be runnable with empty state');

// LA depends on VA (optional) — should be runnable with confirmation
const laCheck = canRoleRun('lead-architect', emptyState);
assert(laCheck.can_run === true, 'LA should be runnable (VA is optional)');
assert(laCheck.needs_confirm === true, 'LA should need confirmation to skip VA');

// PP depends on LA|RP — should not be runnable
const ppCheck = canRoleRun('project-planner', emptyState);
assert(ppCheck.can_run === false, 'PP should not be runnable without LA or RP');

// Codebase mapper has no deps — always runnable
const cmCheck = canRoleRun('codebase-mapper', emptyState);
assert(cmCheck.can_run === true, 'Codebase mapper always runnable');

// ─── After VA Complete ───────────────────────────────────────────────────────

const vaCompleteState = { workflow_path: 'new', completed_roles: ['vision-assistant'], active_roles: [] };

const laCheck2 = canRoleRun('lead-architect', vaCompleteState);
assert(laCheck2.can_run === true, 'LA should be runnable after VA');
assert(!laCheck2.needs_confirm, 'LA should not need confirm after VA');

// UXD has no deps — should also be runnable
const uxdCheck = canRoleRun('ui-ux-designer', vaCompleteState);
assert(uxdCheck.can_run === true, 'UXD should be runnable');

// ─── After LA Complete ───────────────────────────────────────────────────────

const laCompleteState = {
  workflow_path: 'new',
  completed_roles: ['vision-assistant', 'lead-architect'],
  active_roles: [],
};

const ppCheck2 = canRoleRun('project-planner', laCompleteState);
assert(ppCheck2.can_run === true, 'PP should be runnable after LA');

// ─── OR Dependencies ─────────────────────────────────────────────────────────

// PP depends on 'lead-architect|retrofit-planner'
// If RP is complete (existing path), PP should be runnable
const rpCompleteState = {
  workflow_path: 'existing',
  completed_roles: ['retrofit-planner'],
  active_roles: [],
};

const ppCheck3 = canRoleRun('project-planner', rpCompleteState);
assert(ppCheck3.can_run === true, 'PP should be runnable after RP (OR dependency)');

// ─── Replaces Logic ──────────────────────────────────────────────────────────

// RP replaces VA and LA. After RP completes, anything depending on LA should be satisfied.
assert(isRoleReplaced('lead-architect', rpCompleteState) === true, 'LA should be replaced by RP');
assert(isRoleReplaced('vision-assistant', rpCompleteState) === true, 'VA should be replaced by RP');
assert(isRoleReplaced('project-planner', rpCompleteState) === false, 'PP should not be replaced by RP');

// ─── Path Filtering ──────────────────────────────────────────────────────────

// RP should not be runnable in new project path
const rpNewCheck = canRoleRun('retrofit-planner', emptyState);
assert(rpNewCheck.can_run === false, 'RP should not be runnable in new project path');
assert(rpNewCheck.reason.includes('Not applicable'), 'RP reason should mention path');

// VA should not be runnable in existing project path
const vaExistingState = { workflow_path: 'existing', completed_roles: [], active_roles: [] };
const vaExistingCheck = canRoleRun('vision-assistant', vaExistingState);
assert(vaExistingCheck.can_run === false, 'VA should not be runnable in existing path');

// ─── getNextRoles ────────────────────────────────────────────────────────────

const nextRoles = getNextRoles(emptyState);
assert(nextRoles.length > 0, 'Should have next roles for empty state');
assert(nextRoles.some(r => r.role_id === 'vision-assistant'), 'VA should be in next roles');
assert(nextRoles.some(r => r.role_id === 'lead-architect'), 'LA should be in next roles (VA optional)');
assert(nextRoles.some(r => r.role_id === 'codebase-mapper'), 'CM should be in next roles');

// Triggered roles should not appear in next
assert(!nextRoles.some(r => r.role_id === 'merge-manager'), 'MM should not be in next roles');
assert(!nextRoles.some(r => r.role_id === 'feature-manager'), 'FM should not be in next roles');

// ─── getGraphStatus ──────────────────────────────────────────────────────────

const graphStatus = getGraphStatus(laCompleteState);
assert(graphStatus.completed.length === 2, 'Should have 2 completed roles');
assert(graphStatus.available.length > 0, 'Should have available roles');
assert(graphStatus.progress.percent > 0, 'Should have progress > 0');

// ─── getWorkflowSequence ────────────────────────────────────────────────────

const newSeq = getWorkflowSequence('new');
assert(newSeq[0] === 'vision-assistant', 'New sequence starts with VA');
assert(newSeq.includes('lead-architect'), 'New sequence includes LA');
assert(!newSeq.includes('retrofit-planner'), 'New sequence does not include RP');

const existSeq = getWorkflowSequence('existing');
assert(existSeq[0] === 'retrofit-planner', 'Existing sequence starts with RP');
assert(!existSeq.includes('vision-assistant'), 'Existing sequence does not include VA');

// ─── Full Workflow Progression ───────────────────────────────────────────────

const fullState = {
  workflow_path: 'new',
  completed_roles: [
    'vision-assistant', 'lead-architect', 'ui-ux-designer',
    'project-planner', 'stage-manager', 'project-tester',
  ],
  active_roles: [],
};

const lateNext = getNextRoles(fullState);
// Should see deployment phase roles
assert(lateNext.some(r => r.role_id === 'technical-writer'), 'TW should be available after testing');
assert(lateNext.some(r => r.role_id === 'security-auditor'), 'SA should be available after testing');
assert(lateNext.some(r => r.role_id === 'project-deployer'), 'PD should be available after testing');

// TW and SA should show as parallel
const tw = lateNext.find(r => r.role_id === 'technical-writer');
if (tw) {
  assert(tw.parallel_with.some(p => p.role_id === 'security-auditor'), 'TW should show parallel with SA');
}

console.log(`  ✓ All graph tests passed`);
