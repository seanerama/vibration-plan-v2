/**
 * Roles — Role registry and metadata for all VibrationPlan roles
 */

// ─── Role Definitions ────────────────────────────────────────────────────────

const ROLES = {
  'vision-assistant': {
    id: 'vision-assistant',
    name: 'Vision Assistant',
    command: 'vision',
    phase: 'design',
    description: 'Clarify rough ideas before architecture',
    outputs: ['vibration-plan/vision-document.md'],
    paths: ['new'],
    optional: true,
    depends_on: [],
    blocks: ['lead-architect'],
    parallel_with: [],
    trigger: null,
    multi_instance: false,
  },
  'lead-architect': {
    id: 'lead-architect',
    name: 'Lead Architect',
    command: 'architect',
    phase: 'design',
    description: 'Co-design project plan, tech stack, and deployment strategy',
    outputs: ['vibration-plan/project-plan.md', 'vibration-plan/deploy-instruct.md'],
    paths: ['new'],
    optional: false,
    depends_on: ['vision-assistant'],
    blocks: ['project-planner'],
    parallel_with: ['ui-ux-designer'],
    trigger: null,
    multi_instance: false,
  },
  'ui-ux-designer': {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    command: 'designer',
    phase: 'design',
    description: 'Define visual system and UX patterns',
    outputs: ['vibration-plan/design-system.md'],
    paths: ['new'],
    optional: true,
    depends_on: [],
    blocks: [],
    parallel_with: ['lead-architect'],
    trigger: null,
    multi_instance: false,
  },
  'retrofit-planner': {
    id: 'retrofit-planner',
    name: 'Retrofit Planner',
    command: 'retrofit',
    phase: 'design',
    description: 'Analyze existing codebase and plan changes (replaces VA + LA)',
    outputs: ['vibration-plan/project-plan.md', 'vibration-plan/project-state.md'],
    paths: ['existing'],
    optional: false,
    depends_on: [],
    blocks: ['project-planner'],
    parallel_with: [],
    trigger: null,
    multi_instance: false,
    replaces: ['vision-assistant', 'lead-architect'],
  },
  'project-planner': {
    id: 'project-planner',
    name: 'Project Planner',
    command: 'plan',
    phase: 'planning',
    description: 'Break project into stages with contracts',
    outputs: ['vibration-plan/stage-instructions/', 'vibration-plan/contracts/'],
    paths: ['new', 'existing'],
    optional: false,
    depends_on: ['lead-architect|retrofit-planner'],
    blocks: ['stage-manager'],
    parallel_with: [],
    trigger: null,
    multi_instance: false,
  },
  'stage-manager': {
    id: 'stage-manager',
    name: 'Stage Manager',
    command: 'build',
    phase: 'implementation',
    description: 'Implement stages, write tests, update project state',
    outputs: ['src/', 'tests/'],
    paths: ['new', 'existing'],
    optional: false,
    depends_on: ['project-planner'],
    blocks: ['project-tester'],
    parallel_with: ['stage-manager'],
    trigger: null,
    multi_instance: true,
  },
  'merge-manager': {
    id: 'merge-manager',
    name: 'Merge Manager',
    command: 'merge',
    phase: 'implementation',
    description: 'Resolve merge conflicts between parallel branches',
    outputs: [],
    paths: ['new', 'existing'],
    optional: true,
    depends_on: ['stage-manager'],
    blocks: [],
    parallel_with: [],
    trigger: 'merge_conflict',
    multi_instance: false,
  },
  'feature-manager': {
    id: 'feature-manager',
    name: 'Feature Manager',
    command: 'feature',
    phase: 'implementation',
    description: 'Assess mid-development feature requests',
    outputs: ['vibration-plan/feature-assessments/'],
    paths: ['new', 'existing'],
    optional: true,
    depends_on: ['project-planner'],
    blocks: [],
    parallel_with: [],
    trigger: 'feature_request',
    multi_instance: false,
  },
  'project-tester': {
    id: 'project-tester',
    name: 'Project Tester',
    command: 'test',
    phase: 'testing',
    description: 'Test pipelines, find and fix bugs',
    outputs: ['vibration-plan/tests/'],
    paths: ['new', 'existing'],
    optional: false,
    depends_on: ['stage-manager'],
    blocks: ['project-deployer'],
    parallel_with: ['handoff-tester'],
    trigger: null,
    multi_instance: false,
  },
  'handoff-tester': {
    id: 'handoff-tester',
    name: 'Handoff Tester',
    command: 'handoff',
    phase: 'testing',
    description: 'Document UX feedback with end users',
    outputs: ['vibration-plan/ux-feedback/'],
    paths: ['new', 'existing'],
    optional: true,
    depends_on: ['stage-manager'],
    blocks: [],
    parallel_with: ['project-tester'],
    trigger: null,
    multi_instance: false,
  },
  'technical-writer': {
    id: 'technical-writer',
    name: 'Technical Writer',
    command: 'docs',
    phase: 'deployment',
    description: 'Create public documentation (README, API docs, user guides)',
    outputs: ['README.md', 'docs/'],
    paths: ['new', 'existing'],
    optional: true,
    depends_on: ['stage-manager'],
    blocks: [],
    parallel_with: ['security-auditor'],
    trigger: null,
    multi_instance: false,
  },
  'security-auditor': {
    id: 'security-auditor',
    name: 'Security Auditor',
    command: 'security',
    phase: 'deployment',
    description: 'Review for security vulnerabilities',
    outputs: ['vibration-plan/security-report.md'],
    paths: ['new', 'existing'],
    optional: true,
    depends_on: ['stage-manager'],
    blocks: [],
    parallel_with: ['technical-writer'],
    trigger: null,
    multi_instance: false,
  },
  'codebase-mapper': {
    id: 'codebase-mapper',
    name: 'Codebase Mapper',
    command: 'map',
    phase: 'any',
    description: 'Explore codebase and produce interactive HTML diagram',
    outputs: ['codebase-map.html'],
    paths: ['new', 'existing'],
    optional: true,
    depends_on: [],
    blocks: [],
    parallel_with: [],
    trigger: null,
    multi_instance: false,
  },
  'project-deployer': {
    id: 'project-deployer',
    name: 'Project Deployer',
    command: 'deploy',
    phase: 'deployment',
    description: 'Deploy the project via MCP or deploy instructions',
    outputs: [],
    paths: ['new', 'existing'],
    optional: false,
    depends_on: ['project-tester'],
    blocks: ['sre'],
    parallel_with: [],
    trigger: null,
    multi_instance: false,
  },
  'sre': {
    id: 'sre',
    name: 'Site Reliability Engineer',
    command: 'sre',
    phase: 'deployment',
    description: 'Post-deployment ops: monitoring, backups, recovery',
    outputs: ['recovery-plan.md'],
    paths: ['new', 'existing'],
    optional: true,
    depends_on: ['project-deployer'],
    blocks: [],
    parallel_with: [],
    trigger: null,
    multi_instance: false,
  },
};

// ─── Phase Definitions ───────────────────────────────────────────────────────

const PHASES = {
  design: { order: 1, name: 'Design', description: 'Vision, architecture, and design' },
  planning: { order: 2, name: 'Planning', description: 'Break project into stages' },
  implementation: { order: 3, name: 'Implementation', description: 'Build stages' },
  testing: { order: 4, name: 'Testing', description: 'Test and validate' },
  deployment: { order: 5, name: 'Docs & Deploy', description: 'Documentation, security, deployment' },
};

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

function getRole(roleId) {
  return ROLES[roleId] || null;
}

function getRoleByCommand(command) {
  return Object.values(ROLES).find(r => r.command === command) || null;
}

function roleIdToCommand(roleId) {
  const role = ROLES[roleId];
  return role ? role.command : null;
}

function commandToRoleId(command) {
  const role = getRoleByCommand(command);
  return role ? role.id : null;
}

function getAllRoles() {
  return Object.values(ROLES);
}

function getRolesForPhase(phase) {
  return Object.values(ROLES).filter(r => r.phase === phase);
}

function getRolesForPath(workflowPath) {
  return Object.values(ROLES).filter(r =>
    r.phase === 'any' || r.paths.includes(workflowPath)
  );
}

function getRoleOutputPaths(roleId) {
  const role = ROLES[roleId];
  return role ? role.outputs : [];
}

module.exports = {
  ROLES,
  PHASES,
  getRole,
  getRoleByCommand,
  roleIdToCommand,
  commandToRoleId,
  getAllRoles,
  getRolesForPhase,
  getRolesForPath,
  getRoleOutputPaths,
};
