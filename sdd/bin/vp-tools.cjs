#!/usr/bin/env node

/**
 * vp-tools — CLI dispatcher for spec-driven-devops
 *
 * Usage: node vp-tools.cjs <command> [subcommand] [args...] [--raw] [--cwd <path>]
 *
 * Commands:
 *   state load                         Load config + state summary
 *   state get [field]                  Get a specific field from STATE.md
 *   state update <field> <value>       Update a field in STATE.md
 *   state json                         STATE.md frontmatter as JSON
 *   state snapshot                     Full structured state parse
 *   state complete-role <role-id>      Mark role completed
 *     [--output <path>...]             Register output files
 *   state start-role <role-id>         Mark role as active
 *   state record-session               Save session state
 *     [--stopped-at <text>]
 *
 *   graph check <role-id>              Can this role run?
 *   graph next                         What roles can run next?
 *   graph status                       Full dependency graph with status
 *   graph available                    All roles available to run now
 *   graph path <new|existing>          Show workflow sequence for path
 *
 *   config ensure                      Initialize vibration-plan/config.json
 *   config get <key.path>              Get config value
 *   config set <key.path> <value>      Set config value
 *
 *   role list                          List all roles with status
 *   role info <role-id>                Role metadata
 *   role outputs <role-id>             Expected output files
 *
 *   validate state                     Check STATE.md integrity
 *   validate outputs <role-id>         Verify role outputs exist
 *
 *   init run-role <role-id>            All context for running a role
 *   init start                         All context for /sdd:start
 *   init build [stage-number]          All context for stage execution
 *   init status                        All context for /sdd:status
 *   init next                          All context for /sdd:next
 *
 *   generate-slug <text>               URL-safe slug
 *   current-timestamp                  ISO timestamp
 *   verify-path <path>                 File/dir existence check
 */

const { error, output, resolveProjectRoot, generateSlug, currentTimestamp, pathExists } = require('./lib/core.cjs');

// ─── Argument Parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const raw = args.includes('--raw');

// Extract --cwd
let cwd = process.cwd();
const cwdIdx = args.indexOf('--cwd');
if (cwdIdx !== -1 && args[cwdIdx + 1]) {
  cwd = args[cwdIdx + 1];
  args.splice(cwdIdx, 2);
}

// Remove flags from args
const cleanArgs = args.filter(a => a !== '--raw');

const command = cleanArgs[0];
const subcommand = cleanArgs[1];

// ─── Dispatch ────────────────────────────────────────────────────────────────

if (!command) {
  error('Usage: vp-tools <command> [subcommand] [args...]\nRun with --help for details.');
}

switch (command) {
  // ── State Commands ──
  case 'state': {
    const {
      cmdStateLoad, cmdStateGet, cmdStateUpdate, cmdStateJson,
      cmdStateSnapshot, cmdStateCompleteRole, cmdStateStartRole,
      cmdStateRecordSession,
    } = require('./lib/state.cjs');

    switch (subcommand) {
      case 'load':
        cmdStateLoad(cwd, raw);
        break;
      case 'get':
        cmdStateGet(cwd, cleanArgs[2], raw);
        break;
      case 'update':
        cmdStateUpdate(cwd, cleanArgs[2], cleanArgs.slice(3).join(' '));
        break;
      case 'json':
        cmdStateJson(cwd, raw);
        break;
      case 'snapshot':
        cmdStateSnapshot(cwd, raw);
        break;
      case 'complete-role': {
        const roleId = cleanArgs[2];
        const outputPaths = [];
        for (let i = 3; i < cleanArgs.length; i++) {
          if (cleanArgs[i] === '--output' && cleanArgs[i + 1]) {
            outputPaths.push(cleanArgs[++i]);
          }
        }
        cmdStateCompleteRole(cwd, roleId, outputPaths.length > 0 ? outputPaths : null, raw);
        break;
      }
      case 'start-role':
        cmdStateStartRole(cwd, cleanArgs[2], raw);
        break;
      case 'record-session': {
        let stoppedAt = null;
        const saIdx = cleanArgs.indexOf('--stopped-at');
        if (saIdx !== -1) {
          stoppedAt = cleanArgs.slice(saIdx + 1).join(' ');
        }
        cmdStateRecordSession(cwd, stoppedAt, raw);
        break;
      }
      default:
        error(`Unknown state subcommand: ${subcommand}\nAvailable: load, get, update, json, snapshot, complete-role, start-role, record-session`);
    }
    break;
  }

  // ── Graph Commands ──
  case 'graph': {
    const { canRoleRun, getNextRoles, getGraphStatus, getWorkflowSequence } = require('./lib/graph.cjs');
    const { parseStateForGraph } = require('./lib/init.cjs');

    switch (subcommand) {
      case 'check': {
        const roleId = cleanArgs[2];
        if (!roleId) error('Usage: graph check <role-id>');
        const state = parseStateForGraph(cwd);
        const result = canRoleRun(roleId, state);
        output(result, raw, result.can_run ? 'true' : 'false');
        break;
      }
      case 'next': {
        const state = parseStateForGraph(cwd);
        const nextRoles = getNextRoles(state);
        output(nextRoles, raw);
        break;
      }
      case 'status': {
        const state = parseStateForGraph(cwd);
        const status = getGraphStatus(state);
        output(status, raw);
        break;
      }
      case 'available': {
        const state = parseStateForGraph(cwd);
        const nextRoles = getNextRoles(state);
        const available = nextRoles.map(r => r.command).join('\n');
        output(nextRoles, raw, available);
        break;
      }
      case 'path': {
        const wp = cleanArgs[2] || 'new';
        const seq = getWorkflowSequence(wp);
        output({ path: wp, sequence: seq }, raw, seq.join('\n'));
        break;
      }
      default:
        error(`Unknown graph subcommand: ${subcommand}\nAvailable: check, next, status, available, path`);
    }
    break;
  }

  // ── Config Commands ──
  case 'config': {
    const { cmdConfigEnsure, cmdConfigGet, cmdConfigSet } = require('./lib/config.cjs');

    switch (subcommand) {
      case 'ensure':
        cmdConfigEnsure(cwd, raw);
        break;
      case 'get':
        cmdConfigGet(cwd, cleanArgs[2], raw);
        break;
      case 'set':
        cmdConfigSet(cwd, cleanArgs[2], cleanArgs.slice(3).join(' '), raw);
        break;
      default:
        error(`Unknown config subcommand: ${subcommand}\nAvailable: ensure, get, set`);
    }
    break;
  }

  // ── Role Commands ──
  case 'role': {
    const { ROLES, PHASES, getRole, getRoleOutputPaths } = require('./lib/roles.cjs');

    switch (subcommand) {
      case 'list': {
        let state = { workflow_path: 'new', completed_roles: [], active_roles: [] };
        try {
          const { parseStateForGraph } = require('./lib/init.cjs');
          state = parseStateForGraph(cwd);
        } catch {}

        const { getGraphStatus } = require('./lib/graph.cjs');
        const graphStatus = getGraphStatus(state);

        const roles = Object.values(ROLES).map(role => {
          let status = 'pending';
          if (graphStatus.completed.some(r => r.role_id === role.id)) status = 'completed';
          else if (graphStatus.active.some(r => r.role_id === role.id)) status = 'active';
          else if (graphStatus.available.some(r => r.role_id === role.id)) status = 'available';
          else if (graphStatus.waiting.some(r => r.role_id === role.id)) status = 'waiting';

          return {
            id: role.id,
            name: role.name,
            command: `/sdd:${role.command}`,
            phase: PHASES[role.phase]?.name || role.phase,
            status,
            optional: role.optional,
          };
        });

        output(roles, raw);
        break;
      }
      case 'info': {
        const roleId = cleanArgs[2];
        if (!roleId) error('Usage: role info <role-id>');
        const role = getRole(roleId);
        if (!role) error(`Unknown role: ${roleId}`);
        output(role, raw);
        break;
      }
      case 'outputs': {
        const roleId = cleanArgs[2];
        if (!roleId) error('Usage: role outputs <role-id>');
        const outputs = getRoleOutputPaths(roleId);
        output(outputs, raw, outputs.join('\n'));
        break;
      }
      default:
        error(`Unknown role subcommand: ${subcommand}\nAvailable: list, info, outputs`);
    }
    break;
  }

  // ── Validate Commands ──
  case 'validate': {
    switch (subcommand) {
      case 'state': {
        const { getStatePath } = require('./lib/state.cjs');
        const statePath = getStatePath(cwd);
        const fs = require('fs');
        if (!fs.existsSync(statePath)) {
          output({ valid: false, reason: 'STATE.md not found' }, raw, 'false');
          break;
        }
        const content = fs.readFileSync(statePath, 'utf-8');
        const { stateExtractField } = require('./lib/state.cjs');
        const checks = [];
        const requiredFields = ['Path', 'Current Phase', 'Status'];
        for (const field of requiredFields) {
          const val = stateExtractField(content, field);
          checks.push({ field, present: !!val, value: val });
        }
        const allPresent = checks.every(c => c.present);
        output({ valid: allPresent, checks }, raw, allPresent ? 'true' : 'false');
        break;
      }
      case 'outputs': {
        const roleId = cleanArgs[2];
        if (!roleId) error('Usage: validate outputs <role-id>');
        const { getRoleOutputPaths } = require('./lib/roles.cjs');
        const outputs = getRoleOutputPaths(roleId);
        const fs = require('fs');
        const path = require('path');
        const results = outputs.map(op => {
          const fullPath = path.join(cwd, op);
          return { path: op, exists: fs.existsSync(fullPath) };
        });
        const allExist = results.every(r => r.exists);
        output({ valid: allExist, outputs: results }, raw, allExist ? 'true' : 'false');
        break;
      }
      default:
        error(`Unknown validate subcommand: ${subcommand}\nAvailable: state, outputs`);
    }
    break;
  }

  // ── Init Commands ──
  case 'init': {
    const { cmdInitRunRole, cmdInitStart, cmdInitBuild, cmdInitStatus, cmdInitNext } = require('./lib/init.cjs');

    switch (subcommand) {
      case 'run-role':
        cmdInitRunRole(cwd, cleanArgs[2], raw);
        break;
      case 'start':
        cmdInitStart(cwd, raw);
        break;
      case 'build':
        cmdInitBuild(cwd, cleanArgs[2], raw);
        break;
      case 'status':
        cmdInitStatus(cwd, raw);
        break;
      case 'next':
        cmdInitNext(cwd, raw);
        break;
      default:
        error(`Unknown init subcommand: ${subcommand}\nAvailable: run-role, start, build, status, next`);
    }
    break;
  }

  // ── Utility Commands ──
  case 'generate-slug': {
    const text = cleanArgs.slice(1).join(' ');
    const slug = generateSlug(text);
    output({ slug }, raw, slug || '');
    break;
  }
  case 'current-timestamp': {
    const ts = currentTimestamp();
    output({ timestamp: ts }, raw, ts);
    break;
  }
  case 'verify-path': {
    const targetPath = cleanArgs[1];
    if (!targetPath) error('Usage: verify-path <path>');
    const exists = pathExists(require('path').isAbsolute(targetPath) ? targetPath : require('path').join(cwd, targetPath));
    output({ exists }, raw, exists ? 'true' : 'false');
    break;
  }

  default:
    error(`Unknown command: ${command}\nAvailable: state, graph, config, role, validate, init, generate-slug, current-timestamp, verify-path`);
}
