/**
 * State — STATE.md operations for spec-driven-devops
 *
 * Uses **Field:** value pattern for human-readable + machine-parseable state.
 * YAML frontmatter synced on every write for hooks/scripts.
 */

const fs = require('fs');
const path = require('path');
const { output, error, safeReadFile } = require('./core.cjs');

// ─── Frontmatter Helpers ─────────────────────────────────────────────────────

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  for (const line of yaml.split('\n')) {
    const kv = line.match(/^(\w[\w_]*)\s*:\s*(.+)$/);
    if (kv) {
      let val = kv[2].trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (!isNaN(val) && val !== '') val = Number(val);
      result[kv[1]] = val;
    }
  }
  return result;
}

function reconstructFrontmatter(obj) {
  const lines = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;
    if (typeof val === 'object' && !Array.isArray(val)) {
      // Nested object: inline
      lines.push(`${key}:`);
      for (const [k2, v2] of Object.entries(val)) {
        lines.push(`  ${k2}: ${JSON.stringify(v2)}`);
      }
    } else if (Array.isArray(val)) {
      lines.push(`${key}: [${val.map(v => JSON.stringify(v)).join(', ')}]`);
    } else if (typeof val === 'string') {
      lines.push(`${key}: "${val}"`);
    } else {
      lines.push(`${key}: ${val}`);
    }
  }
  return lines.join('\n');
}

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, '');
}

// ─── Field Extraction ────────────────────────────────────────────────────────

function stateExtractField(content, fieldName) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*(.+)`, 'i');
  const match = content.match(pattern);
  return match ? match[1].trim() : null;
}

function stateReplaceField(content, fieldName, newValue) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(\\*\\*${escaped}:\\*\\*\\s*)(.*)`, 'i');
  if (pattern.test(content)) {
    return content.replace(pattern, (_match, prefix) => `${prefix}${newValue}`);
  }
  return null;
}

// ─── Frontmatter Sync ────────────────────────────────────────────────────────

function buildStateFrontmatter(bodyContent, cwd) {
  const ef = (f) => stateExtractField(bodyContent, f);

  const fm = { vp_state_version: '1.0' };

  const workflowPath = ef('Path');
  if (workflowPath) fm.workflow_path = workflowPath.toLowerCase();

  const phase = ef('Current Phase');
  if (phase) fm.current_phase = phase;

  const status = ef('Status');
  if (status) fm.status = status.toLowerCase();

  fm.last_updated = new Date().toISOString();

  // Parse completed roles from checklist
  const completedRoles = [];
  const roleChecklistPattern = /- \[x\] (.+?)(?:\s*—|\s*$)/gim;
  let m;
  while ((m = roleChecklistPattern.exec(bodyContent)) !== null) {
    completedRoles.push(m[1].trim());
  }
  if (completedRoles.length > 0) fm.completed_roles = completedRoles;

  // Parse active roles
  const activeSection = bodyContent.match(/## Active Roles?\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (activeSection) {
    const activeNames = [];
    const activePattern = /\*\*(.+?):\*\*/g;
    while ((m = activePattern.exec(activeSection[1])) !== null) {
      activeNames.push(m[1].trim());
    }
    if (activeNames.length > 0) fm.active_roles = activeNames;
  }

  // Count progress
  const totalPattern = /- \[[ x]\]/gi;
  const totalMatches = bodyContent.match(totalPattern);
  const completedPattern = /- \[x\]/gi;
  const completedMatches = bodyContent.match(completedPattern);
  const total = totalMatches ? totalMatches.length : 0;
  const completed = completedMatches ? completedMatches.length : 0;
  if (total > 0) {
    fm.progress = {
      total_roles: total,
      completed_roles: completed,
      percent: Math.round((completed / total) * 100),
    };
  }

  return fm;
}

function syncStateFrontmatter(content, cwd) {
  const body = stripFrontmatter(content);
  const fm = buildStateFrontmatter(body, cwd);
  const yamlStr = reconstructFrontmatter(fm);
  return `---\n${yamlStr}\n---\n\n${body}`;
}

function writeStateMd(statePath, content, cwd) {
  const synced = syncStateFrontmatter(content, cwd);
  fs.writeFileSync(statePath, synced, 'utf-8');
}

// ─── State Path Helper ───────────────────────────────────────────────────────

function getStatePath(cwd) {
  return path.join(cwd, 'vibration-plan', 'STATE.md');
}

// ─── CLI Commands ────────────────────────────────────────────────────────────

function cmdStateLoad(cwd, raw) {
  const { loadConfig } = require('./config.cjs');
  const config = loadConfig(cwd);
  const vpDir = path.join(cwd, 'vibration-plan');

  let stateRaw = '';
  try {
    stateRaw = fs.readFileSync(getStatePath(cwd), 'utf-8');
  } catch {}

  const stateExists = stateRaw.length > 0;
  const configExists = fs.existsSync(path.join(vpDir, 'config.json'));

  const result = { config, state_raw: stateRaw, state_exists: stateExists, config_exists: configExists };

  if (raw) {
    const lines = [
      `model_profile=${config.model_profile}`,
      `state_exists=${stateExists}`,
      `config_exists=${configExists}`,
    ];
    process.stdout.write(lines.join('\n'));
    process.exit(0);
  }

  output(result);
}

function cmdStateGet(cwd, section, raw) {
  const statePath = getStatePath(cwd);
  try {
    const content = fs.readFileSync(statePath, 'utf-8');

    if (!section) {
      output({ content }, raw, content);
      return;
    }

    // Try **field:** value
    const fieldEscaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const fieldPattern = new RegExp(`\\*\\*${fieldEscaped}:\\*\\*\\s*(.*)`, 'i');
    const fieldMatch = content.match(fieldPattern);
    if (fieldMatch) {
      output({ [section]: fieldMatch[1].trim() }, raw, fieldMatch[1].trim());
      return;
    }

    // Try ## Section
    const sectionPattern = new RegExp(`##\\s*${fieldEscaped}\\s*\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
    const sectionMatch = content.match(sectionPattern);
    if (sectionMatch) {
      output({ [section]: sectionMatch[1].trim() }, raw, sectionMatch[1].trim());
      return;
    }

    output({ error: `Field "${section}" not found` }, raw, '');
  } catch {
    error('STATE.md not found');
  }
}

function cmdStateUpdate(cwd, field, value) {
  if (!field || value === undefined) {
    error('field and value required');
  }

  const statePath = getStatePath(cwd);
  try {
    let content = fs.readFileSync(statePath, 'utf-8');
    const result = stateReplaceField(content, field, value);
    if (result) {
      writeStateMd(statePath, result, cwd);
      output({ updated: true });
    } else {
      output({ updated: false, reason: `Field "${field}" not found in STATE.md` });
    }
  } catch {
    output({ updated: false, reason: 'STATE.md not found' });
  }
}

function cmdStateJson(cwd, raw) {
  const statePath = getStatePath(cwd);
  if (!fs.existsSync(statePath)) {
    output({ error: 'STATE.md not found' }, raw);
    return;
  }

  const content = fs.readFileSync(statePath, 'utf-8');
  const fm = extractFrontmatter(content);

  if (!fm || Object.keys(fm).length === 0) {
    const body = stripFrontmatter(content);
    const built = buildStateFrontmatter(body, cwd);
    output(built, raw, JSON.stringify(built, null, 2));
    return;
  }

  output(fm, raw, JSON.stringify(fm, null, 2));
}

function cmdStateSnapshot(cwd, raw) {
  const statePath = getStatePath(cwd);
  if (!fs.existsSync(statePath)) {
    output({ error: 'STATE.md not found' }, raw);
    return;
  }

  const content = fs.readFileSync(statePath, 'utf-8');
  const body = stripFrontmatter(content);

  const ef = (f) => stateExtractField(body, f);

  // Parse completed roles into IDs
  const completedRoles = [];
  const roleNameToId = {};
  const { ROLES } = require('./roles.cjs');
  for (const role of Object.values(ROLES)) {
    roleNameToId[role.name.toLowerCase()] = role.id;
  }

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

  // Parse outputs table
  const outputs = [];
  const outputsSection = body.match(/## Outputs Produced\s*\n[\s\S]*?\n\|[^\n]+\n\|[-|\s]+\n([\s\S]*?)(?=\n##|$)/i);
  if (outputsSection) {
    const rows = outputsSection[1].trim().split('\n').filter(r => r.includes('|'));
    for (const row of rows) {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 3) {
        outputs.push({ role: cells[0], output: cells[1], path: cells[2], date: cells[3] || '' });
      }
    }
  }

  const result = {
    workflow_path: (ef('Path') || 'new').toLowerCase(),
    current_phase: ef('Current Phase'),
    status: ef('Status'),
    completed_roles: completedRoles,
    active_roles: activeRoles,
    outputs_produced: outputs,
    last_session: ef('Last Session'),
    stopped_at: ef('Stopped At'),
    resume_context: ef('Resume Context'),
  };

  output(result, raw);
}

function cmdStateCompleteRole(cwd, roleId, outputPaths, raw) {
  const { ROLES } = require('./roles.cjs');
  const role = ROLES[roleId];
  if (!role) {
    error(`Unknown role: ${roleId}`);
  }

  const statePath = getStatePath(cwd);
  if (!fs.existsSync(statePath)) {
    error('STATE.md not found');
  }

  let content = fs.readFileSync(statePath, 'utf-8');
  const today = new Date().toISOString().split('T')[0];

  // Mark role as completed in checklist: [ ] Name → [x] Name — output (date)
  const outputStr = outputPaths && outputPaths.length > 0 ? outputPaths.join(', ') : role.outputs.join(', ');
  const uncheckedPattern = new RegExp(
    `- \\[ \\] ${role.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`,
    'i'
  );
  const replacement = `- [x] ${role.name} — ${outputStr} (${today})`;
  content = content.replace(uncheckedPattern, replacement);

  // Clear from Active Roles section
  const activePattern = new RegExp(
    `\\*\\*${role.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\*\\*.*\\n?`,
    'i'
  );
  content = content.replace(activePattern, '');

  // Add to Outputs Produced table
  if (outputPaths && outputPaths.length > 0) {
    for (const op of outputPaths) {
      const row = `| ${role.name} | ${path.basename(op)} | ${op} | ${today} |`;
      const tableEndPattern = /(## Outputs Produced[\s\S]*?\n\|[-|\s]+\n)([\s\S]*?)(?=\n##|$)/i;
      const tableMatch = content.match(tableEndPattern);
      if (tableMatch) {
        let tableBody = tableMatch[2].trimEnd();
        if (!tableBody || tableBody.includes('None')) {
          tableBody = row;
        } else {
          tableBody = tableBody + '\n' + row;
        }
        content = content.replace(tableEndPattern, (_m, header) => `${header}${tableBody}\n`);
      }
    }
  }

  // Update status
  content = stateReplaceField(content, 'Status', 'In Progress') || content;

  writeStateMd(statePath, content, cwd);
  output({ completed: true, role: roleId, role_name: role.name }, raw, 'true');
}

function cmdStateStartRole(cwd, roleId, raw) {
  const { ROLES } = require('./roles.cjs');
  const role = ROLES[roleId];
  if (!role) {
    error(`Unknown role: ${roleId}`);
  }

  const statePath = getStatePath(cwd);
  if (!fs.existsSync(statePath)) {
    error('STATE.md not found');
  }

  let content = fs.readFileSync(statePath, 'utf-8');

  // Add to Active Roles section
  const activeSection = content.match(/(## Active Roles?\s*\n)([\s\S]*?)(?=\n##|$)/i);
  if (activeSection) {
    let body = activeSection[2];
    // Remove "None" placeholder
    body = body.replace(/None\.?\s*\n?/gi, '');
    body = body.trimEnd() + `\n**${role.name}:** In progress\n`;
    content = content.replace(
      /(## Active Roles?\s*\n)([\s\S]*?)(?=\n##|$)/i,
      (_m, header) => `${header}${body}`
    );
  }

  // Update status
  content = stateReplaceField(content, 'Status', 'In Progress') || content;

  writeStateMd(statePath, content, cwd);
  output({ started: true, role: roleId, role_name: role.name }, raw, 'true');
}

function cmdStateRecordSession(cwd, stoppedAt, raw) {
  const statePath = getStatePath(cwd);
  if (!fs.existsSync(statePath)) {
    output({ error: 'STATE.md not found' }, raw);
    return;
  }

  let content = fs.readFileSync(statePath, 'utf-8');
  const now = new Date().toISOString();
  const updated = [];

  let result = stateReplaceField(content, 'Last Session', now);
  if (result) { content = result; updated.push('Last Session'); }

  if (stoppedAt) {
    result = stateReplaceField(content, 'Stopped At', stoppedAt);
    if (result) { content = result; updated.push('Stopped At'); }
  }

  if (updated.length > 0) {
    writeStateMd(statePath, content, cwd);
    output({ recorded: true, updated }, raw, 'true');
  } else {
    output({ recorded: false, reason: 'No session fields found' }, raw, 'false');
  }
}

module.exports = {
  stateExtractField,
  stateReplaceField,
  writeStateMd,
  getStatePath,
  extractFrontmatter,
  stripFrontmatter,
  buildStateFrontmatter,
  cmdStateLoad,
  cmdStateGet,
  cmdStateUpdate,
  cmdStateJson,
  cmdStateSnapshot,
  cmdStateCompleteRole,
  cmdStateStartRole,
  cmdStateRecordSession,
};
