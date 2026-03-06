/**
 * Init — Compound context-loading commands for spec-driven-devops
 *
 * These are called by slash commands to load all context needed for a role.
 * Each returns a JSON blob with dependency status, config, and existing outputs.
 */

const fs = require('fs');
const path = require('path');
const { output, error, resolveModel, safeReadFile } = require('./core.cjs');
const { loadConfig } = require('./config.cjs');
const { ROLES, PHASES } = require('./roles.cjs');
const { canRoleRun, getNextRoles, getGraphStatus } = require('./graph.cjs');
const { cmdStateSnapshot, getStatePath, extractFrontmatter, stripFrontmatter, stateExtractField } = require('./state.cjs');

/**
 * Parse STATE.md into a structured state object for graph operations.
 */
function parseStateForGraph(cwd) {
  const statePath = getStatePath(cwd);
  if (!fs.existsSync(statePath)) {
    return {
      workflow_path: 'new',
      completed_roles: [],
      active_roles: [],
    };
  }

  const content = fs.readFileSync(statePath, 'utf-8');
  const body = stripFrontmatter(content);

  // Build role name → id mapping
  const roleNameToId = {};
  for (const role of Object.values(ROLES)) {
    roleNameToId[role.name.toLowerCase()] = role.id;
  }

  // Parse completed roles
  const completedRoles = [];
  const checklistPattern = /- \[x\] (.+?)(?:\s*—|\s*$)/gim;
  let m;
  while ((m = checklistPattern.exec(body)) !== null) {
    const name = m[1].trim().toLowerCase();
    const id = roleNameToId[name];
    if (id) completedRoles.push(id);
  }

  // Parse active roles
  const activeRoles = [];
  const activeSection = body.match(/## Active Roles?\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (activeSection) {
    const activePattern = /\*\*(.+?):\*\*/g;
    while ((m = activePattern.exec(activeSection[1])) !== null) {
      const name = m[1].trim().toLowerCase();
      const id = roleNameToId[name];
      if (id) activeRoles.push(id);
    }
  }

  const workflowPath = (stateExtractField(body, 'Path') || 'new').toLowerCase();

  return {
    workflow_path: workflowPath,
    completed_roles: completedRoles,
    active_roles: activeRoles,
  };
}

// ─── Init Commands ───────────────────────────────────────────────────────────

/**
 * init run-role <role-id>
 * Validates dependencies, loads context, returns role execution info.
 */
function cmdInitRunRole(cwd, roleId, raw) {
  const role = ROLES[roleId];
  if (!role) {
    error(`Unknown role: ${roleId}`);
  }

  const config = loadConfig(cwd);
  const state = parseStateForGraph(cwd);
  const depCheck = canRoleRun(roleId, state);
  const model = resolveModel(roleId, config);

  // Find existing outputs from previous roles
  const existingOutputs = {};
  for (const completedId of state.completed_roles) {
    const completedRole = ROLES[completedId];
    if (completedRole) {
      for (const op of completedRole.outputs) {
        const fullPath = path.join(cwd, op);
        if (fs.existsSync(fullPath)) {
          existingOutputs[completedId] = existingOutputs[completedId] || [];
          existingOutputs[completedId].push(op);
        }
      }
    }
  }

  // Check if this is a re-invocation
  const isReinvocation = state.completed_roles.includes(roleId);

  const result = {
    role_id: roleId,
    role_name: role.name,
    command: `/vp:${role.command}`,
    phase: role.phase,
    phase_name: PHASES[role.phase]?.name || role.phase,
    can_run: depCheck.can_run,
    already_complete: depCheck.already_complete || false,
    is_reinvocation: isReinvocation,
    needs_confirm: depCheck.needs_confirm || false,
    skipping: depCheck.skipping || null,
    missing_deps: depCheck.missing || null,
    reason: depCheck.reason || null,
    model,
    config: {
      model_profile: config.model_profile,
      fresh_sessions: config.workflow?.fresh_sessions,
      gates: config.gates,
    },
    expected_outputs: role.outputs,
    existing_outputs: existingOutputs,
    workflow_path: state.workflow_path,
  };

  output(result, raw);
}

/**
 * init start
 * Context for /vp:start — checks existing state.
 */
function cmdInitStart(cwd, raw) {
  const vpDir = path.join(cwd, 'vibration-plan');
  const statePath = getStatePath(cwd);
  const stateExists = fs.existsSync(statePath);
  const vpDirExists = fs.existsSync(vpDir);
  const config = loadConfig(cwd);

  let resumeInfo = null;
  if (stateExists) {
    const content = fs.readFileSync(statePath, 'utf-8');
    const body = stripFrontmatter(content);
    resumeInfo = {
      workflow_path: stateExtractField(body, 'Path'),
      current_phase: stateExtractField(body, 'Current Phase'),
      status: stateExtractField(body, 'Status'),
      stopped_at: stateExtractField(body, 'Stopped At'),
    };
  }

  const result = {
    vp_dir_exists: vpDirExists,
    state_exists: stateExists,
    resume_info: resumeInfo,
    config,
    cwd,
  };

  output(result, raw);
}

/**
 * init build <stage-number>
 * Context for /vp:build — loads stage instructions.
 */
function cmdInitBuild(cwd, stageNumber, raw) {
  const stageDir = path.join(cwd, 'vibration-plan', 'stage-instructions');
  const config = loadConfig(cwd);
  const state = parseStateForGraph(cwd);

  // Check if stage-manager can run
  const depCheck = canRoleRun('stage-manager', state);

  if (!depCheck.can_run) {
    output({
      can_run: false,
      reason: depCheck.reason,
      missing: depCheck.missing,
    }, raw);
    return;
  }

  // Find stage instruction files
  let stageFiles = [];
  if (fs.existsSync(stageDir)) {
    stageFiles = fs.readdirSync(stageDir)
      .filter(f => f.endsWith('.md'))
      .sort();
  }

  // If specific stage requested, find it
  let targetStage = null;
  if (stageNumber) {
    const pattern = new RegExp(`stage-${stageNumber}`, 'i');
    targetStage = stageFiles.find(f => pattern.test(f));
    if (targetStage) {
      targetStage = {
        file: targetStage,
        path: path.join('vibration-plan/stage-instructions', targetStage),
        content: safeReadFile(path.join(stageDir, targetStage)),
      };
    }
  }

  const model = resolveModel('stage-manager', config);

  const result = {
    can_run: true,
    stage_number: stageNumber || null,
    target_stage: targetStage,
    all_stages: stageFiles,
    total_stages: stageFiles.length,
    model,
    parallel_stages: config.workflow?.parallel_stages || false,
    branching_strategy: config.git?.branching_strategy || 'stage',
    branch_template: config.git?.stage_branch_template || 'vp/stage-{stage}-{slug}',
  };

  output(result, raw);
}

/**
 * init status
 * Full context for /vp:status.
 */
function cmdInitStatus(cwd, raw) {
  const state = parseStateForGraph(cwd);
  const graphStatus = getGraphStatus(state);
  const config = loadConfig(cwd);

  const result = {
    ...graphStatus,
    config: {
      model_profile: config.model_profile,
      auto_advance: config.workflow?.auto_advance,
    },
  };

  output(result, raw);
}

/**
 * init next
 * Dependency-aware next-step info for /vp:next.
 */
function cmdInitNext(cwd, raw) {
  const state = parseStateForGraph(cwd);
  const nextRoles = getNextRoles(state);
  const graphStatus = getGraphStatus(state);

  const result = {
    workflow_path: state.workflow_path,
    progress: graphStatus.progress,
    next_roles: nextRoles,
    active_roles: graphStatus.active,
    waiting_roles: graphStatus.waiting,
    triggered_roles: graphStatus.triggered,
  };

  output(result, raw);
}

module.exports = {
  parseStateForGraph,
  cmdInitRunRole,
  cmdInitStart,
  cmdInitBuild,
  cmdInitStatus,
  cmdInitNext,
};
