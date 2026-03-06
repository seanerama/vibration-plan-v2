/**
 * Tests for roles.cjs — Role registry and metadata
 */

const {
  ROLES, PHASES,
  getRole, getRoleByCommand, roleIdToCommand, commandToRoleId,
  getAllRoles, getRolesForPhase, getRolesForPath, getRoleOutputPaths,
} = require('../sdd/bin/lib/roles.cjs');

// ─── Role Registry ───────────────────────────────────────────────────────────

assert(Object.keys(ROLES).length === 15, 'Should have 15 roles defined');
assert(Object.keys(PHASES).length === 5, 'Should have 5 phases defined');

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

const la = getRole('lead-architect');
assert(la !== null, 'getRole should find lead-architect');
assertEqual(la.name, 'Lead Architect', 'lead-architect name');
assertEqual(la.command, 'architect', 'lead-architect command');
assertEqual(la.phase, 'design', 'lead-architect phase');

assert(getRole('nonexistent') === null, 'getRole should return null for unknown role');

const byCmd = getRoleByCommand('architect');
assertEqual(byCmd.id, 'lead-architect', 'getRoleByCommand should find by command');
assert(getRoleByCommand('nonexistent') === null, 'getRoleByCommand returns null for unknown');

assertEqual(roleIdToCommand('lead-architect'), 'architect', 'roleIdToCommand');
assertEqual(roleIdToCommand('nonexistent'), null, 'roleIdToCommand returns null for unknown');

assertEqual(commandToRoleId('architect'), 'lead-architect', 'commandToRoleId');
assertEqual(commandToRoleId('nonexistent'), null, 'commandToRoleId returns null for unknown');

// ─── Phase Filtering ─────────────────────────────────────────────────────────

const designRoles = getRolesForPhase('design');
assert(designRoles.length >= 3, 'Design phase should have at least 3 roles (VA, LA, UXD, RP)');
assert(designRoles.every(r => r.phase === 'design'), 'All design roles should have phase=design');

// ─── Path Filtering ─────────────────────────────────────────────────────────

const newRoles = getRolesForPath('new');
const existingRoles = getRolesForPath('existing');

assert(newRoles.some(r => r.id === 'vision-assistant'), 'New path should include VA');
assert(newRoles.some(r => r.id === 'lead-architect'), 'New path should include LA');
assert(!newRoles.some(r => r.id === 'retrofit-planner'), 'New path should not include RP');

assert(existingRoles.some(r => r.id === 'retrofit-planner'), 'Existing path should include RP');
assert(!existingRoles.some(r => r.id === 'vision-assistant'), 'Existing path should not include VA');
assert(!existingRoles.some(r => r.id === 'lead-architect'), 'Existing path should not include LA');

// Codebase mapper should be in both (phase=any)
assert(newRoles.some(r => r.id === 'codebase-mapper'), 'Codebase mapper available in new path');
assert(existingRoles.some(r => r.id === 'codebase-mapper'), 'Codebase mapper available in existing path');

// ─── Outputs ─────────────────────────────────────────────────────────────────

const laOutputs = getRoleOutputPaths('lead-architect');
assert(laOutputs.length === 2, 'LA should have 2 output paths');
assert(laOutputs.includes('vibration-plan/project-plan.md'), 'LA outputs project-plan.md');
assert(laOutputs.includes('vibration-plan/deploy-instruct.md'), 'LA outputs deploy-instruct.md');

assertEqual(getRoleOutputPaths('nonexistent'), [], 'Unknown role returns empty outputs');

// ─── Retrofit Planner ────────────────────────────────────────────────────────

const rp = getRole('retrofit-planner');
assert(rp.replaces !== undefined, 'RP should have replaces field');
assert(rp.replaces.includes('vision-assistant'), 'RP replaces VA');
assert(rp.replaces.includes('lead-architect'), 'RP replaces LA');

// ─── Triggered Roles ─────────────────────────────────────────────────────────

const mm = getRole('merge-manager');
assertEqual(mm.trigger, 'merge_conflict', 'Merge manager is triggered by merge_conflict');

const fm = getRole('feature-manager');
assertEqual(fm.trigger, 'feature_request', 'Feature manager is triggered by feature_request');

// ─── Multi-Instance ──────────────────────────────────────────────────────────

const sm = getRole('stage-manager');
assert(sm.multi_instance === true, 'Stage manager supports multi-instance');

console.log(`  ✓ All roles tests passed`);
