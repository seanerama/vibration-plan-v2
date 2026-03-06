/**
 * Graph — Dependency engine for VibrationPlan role orchestration
 *
 * Handles: dependency checking, path filtering, OR dependencies,
 * role replacement (retrofit-planner replaces VA+LA), and next-role resolution.
 */

const { ROLES, PHASES, getRolesForPath } = require('./roles.cjs');

// ─── State Helpers ───────────────────────────────────────────────────────────

/**
 * Check if a role is completed in the current state.
 * State has a `completed_roles` array of role IDs.
 */
function isRoleComplete(roleId, state) {
  return (state.completed_roles || []).includes(roleId);
}

/**
 * Check if a role is replaced by another completed role.
 * e.g., retrofit-planner replaces vision-assistant and lead-architect.
 */
function isRoleReplaced(roleId, state) {
  const completedRoles = state.completed_roles || [];
  for (const completedId of completedRoles) {
    const completedRole = ROLES[completedId];
    if (completedRole && completedRole.replaces && completedRole.replaces.includes(roleId)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a role is currently active.
 */
function isRoleActive(roleId, state) {
  return (state.active_roles || []).includes(roleId);
}

// ─── Dependency Resolution ───────────────────────────────────────────────────

/**
 * Check if a role can run given the current state.
 * Returns { can_run, reason, missing, needs_confirm, skipping }
 */
function canRoleRun(roleId, state) {
  const role = ROLES[roleId];
  if (!role) {
    return { can_run: false, reason: `Unknown role: ${roleId}` };
  }

  const workflowPath = state.workflow_path;

  // Check path applicability
  if (role.phase !== 'any' && !role.paths.includes(workflowPath)) {
    return { can_run: false, reason: `Not applicable for ${workflowPath} project path` };
  }

  // Already completed
  if (isRoleComplete(roleId, state)) {
    return { can_run: true, already_complete: true };
  }

  // Check dependencies
  for (const dep of role.depends_on) {
    if (dep.includes('|')) {
      // OR dependency: at least one must be complete or replaced
      const alternatives = dep.split('|');
      const anyComplete = alternatives.some(alt =>
        isRoleComplete(alt, state) || isRoleReplaced(alt, state)
      );
      if (!anyComplete) {
        // Check if all alternatives are optional
        const allOptional = alternatives.every(alt => {
          const altRole = ROLES[alt];
          return altRole && altRole.optional;
        });
        if (allOptional) {
          return { can_run: true, needs_confirm: true, skipping: alternatives };
        }
        return {
          can_run: false,
          reason: `Requires one of: ${alternatives.join(' or ')}`,
          missing: alternatives,
        };
      }
    } else {
      // AND dependency: must be complete or replaced
      if (!isRoleComplete(dep, state) && !isRoleReplaced(dep, state)) {
        const depRole = ROLES[dep];
        if (depRole && depRole.optional) {
          return { can_run: true, needs_confirm: true, skipping: [dep] };
        }
        return {
          can_run: false,
          reason: `Requires: ${depRole ? depRole.name : dep}`,
          missing: [dep],
        };
      }
    }
  }

  return { can_run: true };
}

// ─── Next Role Resolution ────────────────────────────────────────────────────

/**
 * Get all roles that can run next, given the current state.
 * Excludes event-triggered roles (merge-manager, feature-manager).
 */
function getNextRoles(state) {
  const workflowPath = state.workflow_path || 'new';
  const applicableRoles = getRolesForPath(workflowPath);
  const available = [];

  for (const role of applicableRoles) {
    // Skip completed roles
    if (isRoleComplete(role.id, state)) continue;
    // Skip currently active roles
    if (isRoleActive(role.id, state)) continue;
    // Skip event-triggered roles (they appear when triggered)
    if (role.trigger) continue;

    const check = canRoleRun(role.id, state);
    if (check.can_run && !check.already_complete) {
      // Find which roles from parallel_with are also available
      const parallelAvailable = role.parallel_with.filter(pId => {
        if (isRoleComplete(pId, state)) return false;
        if (isRoleActive(pId, state)) return false;
        const pCheck = canRoleRun(pId, state);
        return pCheck.can_run && !pCheck.already_complete;
      });

      available.push({
        role_id: role.id,
        name: role.name,
        command: `/vp:${role.command}`,
        phase: role.phase,
        phase_name: PHASES[role.phase]?.name || role.phase,
        description: role.description,
        needs_confirm: check.needs_confirm || false,
        skipping: check.skipping || null,
        parallel_with: parallelAvailable.map(pId => ({
          role_id: pId,
          name: ROLES[pId]?.name,
          command: `/vp:${ROLES[pId]?.command}`,
        })),
      });
    }
  }

  // Sort by phase order
  available.sort((a, b) => {
    const aOrder = PHASES[a.phase]?.order || 99;
    const bOrder = PHASES[b.phase]?.order || 99;
    return aOrder - bOrder;
  });

  return available;
}

/**
 * Get roles waiting on dependencies (not yet available).
 */
function getWaitingRoles(state) {
  const workflowPath = state.workflow_path || 'new';
  const applicableRoles = getRolesForPath(workflowPath);
  const waiting = [];

  for (const role of applicableRoles) {
    if (isRoleComplete(role.id, state)) continue;
    if (role.trigger) continue;

    const check = canRoleRun(role.id, state);
    if (!check.can_run) {
      waiting.push({
        role_id: role.id,
        name: role.name,
        command: `/vp:${role.command}`,
        phase: role.phase,
        reason: check.reason,
        missing: check.missing || [],
      });
    }
  }

  return waiting;
}

/**
 * Get full graph status: completed, active, available, waiting, triggered.
 */
function getGraphStatus(state) {
  const workflowPath = state.workflow_path || 'new';
  const applicableRoles = getRolesForPath(workflowPath);

  const completed = [];
  const active = [];
  const available = [];
  const waiting = [];
  const triggered = [];

  for (const role of applicableRoles) {
    const entry = {
      role_id: role.id,
      name: role.name,
      command: `/vp:${role.command}`,
      phase: role.phase,
      phase_name: PHASES[role.phase]?.name || role.phase,
    };

    if (isRoleComplete(role.id, state)) {
      completed.push(entry);
    } else if (isRoleActive(role.id, state)) {
      active.push(entry);
    } else if (role.trigger) {
      triggered.push({ ...entry, trigger: role.trigger });
    } else {
      const check = canRoleRun(role.id, state);
      if (check.can_run) {
        available.push(entry);
      } else {
        waiting.push({ ...entry, reason: check.reason, missing: check.missing });
      }
    }
  }

  const totalRoles = applicableRoles.filter(r => !r.trigger).length;
  const completedCount = completed.length;
  const percent = totalRoles > 0 ? Math.round((completedCount / totalRoles) * 100) : 0;

  return {
    workflow_path: workflowPath,
    progress: { completed: completedCount, total: totalRoles, percent },
    completed,
    active,
    available,
    waiting,
    triggered,
  };
}

/**
 * Get the workflow sequence for a given path (new or existing).
 * Returns an ordered array of role IDs.
 */
function getWorkflowSequence(workflowPath) {
  if (workflowPath === 'existing') {
    return [
      'retrofit-planner',
      'project-planner',
      'stage-manager',
      'project-tester',
      'handoff-tester',
      'technical-writer',
      'security-auditor',
      'project-deployer',
      'sre',
    ];
  }

  return [
    'vision-assistant',
    'lead-architect',
    'ui-ux-designer',
    'project-planner',
    'stage-manager',
    'project-tester',
    'handoff-tester',
    'technical-writer',
    'security-auditor',
    'project-deployer',
    'sre',
  ];
}

module.exports = {
  isRoleComplete,
  isRoleReplaced,
  isRoleActive,
  canRoleRun,
  getNextRoles,
  getWaitingRoles,
  getGraphStatus,
  getWorkflowSequence,
};
