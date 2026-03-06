/**
 * Tests for config.cjs — Configuration management
 */

const { deepMerge, configGet, configSet, HARDCODED_DEFAULTS } = require('../sdd/bin/lib/config.cjs');

// ─── Deep Merge ──────────────────────────────────────────────────────────────

const left = { a: 1, b: { c: 2, d: 3 }, e: 'hello' };
const right = { b: { c: 99 }, f: 'new' };
const merged = deepMerge(left, right);

assertEqual(merged.a, 1, 'deepMerge preserves left values');
assertEqual(merged.b.c, 99, 'deepMerge overrides nested values');
assertEqual(merged.b.d, 3, 'deepMerge preserves non-overridden nested values');
assertEqual(merged.e, 'hello', 'deepMerge preserves string values');
assertEqual(merged.f, 'new', 'deepMerge adds new keys');

// Ensure no mutation of originals
assertEqual(left.b.c, 2, 'deepMerge does not mutate left');

// ─── Config Get (dot notation) ───────────────────────────────────────────────

const config = {
  model_profile: 'balanced',
  workflow: {
    auto_advance: false,
    fresh_sessions: true,
  },
  git: {
    branching_strategy: 'stage',
  },
};

assertEqual(configGet(config, 'model_profile'), 'balanced', 'configGet top-level key');
assertEqual(configGet(config, 'workflow.auto_advance'), false, 'configGet nested key');
assertEqual(configGet(config, 'workflow.fresh_sessions'), true, 'configGet nested boolean');
assertEqual(configGet(config, 'git.branching_strategy'), 'stage', 'configGet deep nested');
assertEqual(configGet(config, 'nonexistent'), undefined, 'configGet returns undefined for missing');
assertEqual(configGet(config, 'workflow.nonexistent'), undefined, 'configGet returns undefined for missing nested');

// ─── Config Set (dot notation) ───────────────────────────────────────────────

const obj = {};
configSet(obj, 'model_profile', 'quality');
assertEqual(obj.model_profile, 'quality', 'configSet sets top-level');

configSet(obj, 'workflow.auto_advance', true);
assertEqual(obj.workflow.auto_advance, true, 'configSet creates nested path');

configSet(obj, 'workflow.fresh_sessions', false);
assertEqual(obj.workflow.fresh_sessions, false, 'configSet sets in existing nested path');
assertEqual(obj.workflow.auto_advance, true, 'configSet preserves existing nested values');

// ─── Hardcoded Defaults ──────────────────────────────────────────────────────

assert(HARDCODED_DEFAULTS.model_profile === 'balanced', 'Default profile is balanced');
assert(HARDCODED_DEFAULTS.workflow.auto_advance === false, 'Default auto_advance is false');
assert(HARDCODED_DEFAULTS.git.branching_strategy === 'stage', 'Default branching is stage');
assert(HARDCODED_DEFAULTS.gates.confirm_architecture === true, 'Default gate is true');

console.log(`  ✓ All config tests passed`);
