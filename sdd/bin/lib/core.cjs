/**
 * Core — Shared utilities, constants, and output helpers for spec-driven-devops
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// ─── Path helpers ────────────────────────────────────────────────────────────

function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

/**
 * Walk up from cwd to find a directory containing vibration-plan/.
 * Returns the project root or null.
 */
function resolveProjectRoot(startDir) {
  let dir = startDir || process.cwd();
  while (true) {
    if (fs.existsSync(path.join(dir, 'vibration-plan'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Get the vibration-plan directory path for a given project root.
 */
function getVpDir(projectRoot) {
  return path.join(projectRoot, 'vibration-plan');
}

// ─── Model Profile Table ─────────────────────────────────────────────────────

const MODEL_PROFILES = {
  'vision-assistant':    { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
  'lead-architect':      { quality: 'opus', balanced: 'opus',   budget: 'sonnet' },
  'ui-ux-designer':      { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'retrofit-planner':    { quality: 'opus', balanced: 'opus',   budget: 'sonnet' },
  'project-planner':     { quality: 'opus', balanced: 'opus',   budget: 'sonnet' },
  'stage-manager':       { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'merge-manager':       { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'feature-manager':     { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
  'project-tester':      { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'handoff-tester':      { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'technical-writer':    { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'security-auditor':    { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'codebase-mapper':     { quality: 'sonnet', balanced: 'haiku', budget: 'haiku' },
  'project-deployer':    { quality: 'sonnet', balanced: 'sonnet', budget: 'sonnet' },
  'sre':                 { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
  'vp-verifier':         { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'vp-stage-executor':   { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
};

// ─── Output helpers ──────────────────────────────────────────────────────────

function output(result, raw, rawValue) {
  if (raw && rawValue !== undefined) {
    process.stdout.write(String(rawValue));
  } else {
    const json = JSON.stringify(result, null, 2);
    if (json.length > 50000) {
      const tmpPath = path.join(os.tmpdir(), `vp-${Date.now()}.json`);
      fs.writeFileSync(tmpPath, json, 'utf-8');
      process.stdout.write('@file:' + tmpPath);
    } else {
      process.stdout.write(json);
    }
  }
  process.exit(0);
}

function error(message) {
  process.stderr.write('Error: ' + message + '\n');
  process.exit(1);
}

// ─── File utilities ──────────────────────────────────────────────────────────

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function pathExists(targetPath) {
  try {
    fs.statSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

// ─── Git utilities ───────────────────────────────────────────────────────────

function execGit(cwd, args) {
  try {
    const escaped = args.map(a => {
      if (/^[a-zA-Z0-9._\-/=:@]+$/.test(a)) return a;
      return "'" + a.replace(/'/g, "'\\''") + "'";
    });
    const stdout = execSync('git ' + escaped.join(' '), {
      cwd,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return { exitCode: 0, stdout: stdout.trim(), stderr: '' };
  } catch (err) {
    return {
      exitCode: err.status ?? 1,
      stdout: (err.stdout ?? '').toString().trim(),
      stderr: (err.stderr ?? '').toString().trim(),
    };
  }
}

// ─── Model resolution ────────────────────────────────────────────────────────

function resolveModel(roleId, config) {
  // Check per-role override first
  const override = config.model_overrides?.[roleId];
  if (override) {
    return override === 'opus' ? 'inherit' : override;
  }

  const profile = config.model_profile || 'balanced';
  const roleModels = MODEL_PROFILES[roleId];
  if (!roleModels) return 'sonnet';
  const resolved = roleModels[profile] || roleModels['balanced'] || 'sonnet';
  return resolved === 'opus' ? 'inherit' : resolved;
}

// ─── Misc utilities ──────────────────────────────────────────────────────────

function generateSlug(text) {
  if (!text) return null;
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function currentTimestamp() {
  return new Date().toISOString();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  MODEL_PROFILES,
  toPosixPath,
  resolveProjectRoot,
  getVpDir,
  output,
  error,
  safeReadFile,
  pathExists,
  execGit,
  resolveModel,
  generateSlug,
  currentTimestamp,
  escapeRegex,
};
