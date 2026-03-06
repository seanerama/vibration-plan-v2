/**
 * Config — Configuration CRUD operations for spec-driven-devops
 *
 * Three-tier resolution: hardcoded → user (~/.sdd/defaults.json) → project (vibration-plan/config.json)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { output, error } = require('./core.cjs');

// ─── Defaults ────────────────────────────────────────────────────────────────

const HARDCODED_DEFAULTS = {
  model_profile: 'balanced',
  workflow: {
    auto_advance: false,
    fresh_sessions: true,
    parallel_stages: true,
  },
  git: {
    branching_strategy: 'stage',
    stage_branch_template: 'vp/stage-{stage}-{slug}',
    commit_docs: true,
  },
  gates: {
    confirm_architecture: true,
    confirm_stages: true,
    confirm_deployment: true,
  },
  safety: {
    always_confirm_destructive: true,
  },
  model_overrides: {},
};

// ─── Config Loading ──────────────────────────────────────────────────────────

function getUserDefaultsPath() {
  return path.join(os.homedir(), '.sdd', 'defaults.json');
}

function getProjectConfigPath(cwd) {
  return path.join(cwd, 'vibration-plan', 'config.json');
}

function loadUserDefaults() {
  try {
    const p = getUserDefaultsPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {}
  return {};
}

function loadProjectConfig(cwd) {
  try {
    const p = getProjectConfigPath(cwd);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {}
  return {};
}

/**
 * Deep merge two objects. Right values override left.
 */
function deepMerge(left, right) {
  const result = { ...left };
  for (const key of Object.keys(right)) {
    if (
      result[key] && typeof result[key] === 'object' && !Array.isArray(result[key]) &&
      right[key] && typeof right[key] === 'object' && !Array.isArray(right[key])
    ) {
      result[key] = deepMerge(result[key], right[key]);
    } else {
      result[key] = right[key];
    }
  }
  return result;
}

/**
 * Load fully resolved config: hardcoded → user → project.
 */
function loadConfig(cwd) {
  const userDefaults = loadUserDefaults();
  const projectConfig = loadProjectConfig(cwd);

  let config = deepMerge(HARDCODED_DEFAULTS, userDefaults);
  config = deepMerge(config, projectConfig);

  return config;
}

/**
 * Get a value from config using dot notation.
 */
function configGet(config, keyPath) {
  const keys = keyPath.split('.');
  let current = config;
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

/**
 * Set a value in an object using dot notation.
 */
function configSet(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

// ─── CLI Commands ────────────────────────────────────────────────────────────

function cmdConfigEnsure(cwd, raw) {
  const configPath = getProjectConfigPath(cwd);
  const vpDir = path.join(cwd, 'vibration-plan');

  // Ensure vibration-plan directory exists
  try {
    if (!fs.existsSync(vpDir)) {
      fs.mkdirSync(vpDir, { recursive: true });
    }
  } catch (err) {
    error('Failed to create vibration-plan directory: ' + err.message);
  }

  if (fs.existsSync(configPath)) {
    output({ created: false, reason: 'already_exists' }, raw, 'exists');
    return;
  }

  // Merge hardcoded + user defaults for initial project config
  const userDefaults = loadUserDefaults();
  const defaults = deepMerge(HARDCODED_DEFAULTS, userDefaults);

  try {
    fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2), 'utf-8');
    output({ created: true, path: 'vibration-plan/config.json' }, raw, 'created');
  } catch (err) {
    error('Failed to create config.json: ' + err.message);
  }
}

function cmdConfigGet(cwd, keyPath, raw) {
  if (!keyPath) {
    error('Usage: config get <key.path>');
  }

  const config = loadConfig(cwd);
  const value = configGet(config, keyPath);

  if (value === undefined) {
    error(`Key not found: ${keyPath}`);
  }

  output(value, raw, String(value));
}

function cmdConfigSet(cwd, keyPath, value, raw) {
  if (!keyPath) {
    error('Usage: config set <key.path> <value>');
  }

  const configPath = getProjectConfigPath(cwd);

  // Parse value
  let parsedValue = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (!isNaN(value) && value !== '') parsedValue = Number(value);

  // Load existing project config
  let projectConfig = {};
  try {
    if (fs.existsSync(configPath)) {
      projectConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (err) {
    error('Failed to read config.json: ' + err.message);
  }

  configSet(projectConfig, keyPath, parsedValue);

  try {
    fs.writeFileSync(configPath, JSON.stringify(projectConfig, null, 2), 'utf-8');
    output({ updated: true, key: keyPath, value: parsedValue }, raw, `${keyPath}=${parsedValue}`);
  } catch (err) {
    error('Failed to write config.json: ' + err.message);
  }
}

module.exports = {
  HARDCODED_DEFAULTS,
  loadConfig,
  configGet,
  configSet,
  deepMerge,
  cmdConfigEnsure,
  cmdConfigGet,
  cmdConfigSet,
};
