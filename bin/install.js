#!/usr/bin/env node

/**
 * spec-driven-devops installer — Multi-runtime installation for Claude Code, OpenCode, Gemini CLI, and Codex
 *
 * Usage: npx spec-driven-devops [--claude|--opencode|--gemini|--codex|--all] [-g|--global] [-u|--uninstall]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// ─── Colors ──────────────────────────────────────────────────────────────────

const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const bold = '\x1b[1m';
const reset = '\x1b[0m';

// ─── Package Info ────────────────────────────────────────────────────────────

const pkg = require('../package.json');

// ─── Banner ──────────────────────────────────────────────────────────────────

const banner = '\n' +
  cyan + '  ███████╗██████╗ ██████╗ \n' +
  '  ██╔════╝██╔══██╗██╔══██╗\n' +
  '  ███████╗██║  ██║██║  ██║\n' +
  '  ╚════██║██║  ██║██║  ██║\n' +
  '  ███████║██████╔╝██████╔╝\n' +
  '  ╚══════╝╚═════╝ ╚═════╝ ' + reset + '\n\n' +
  '  ' + bold + 'Spec-Driven DevOps' + reset + ' ' + dim + 'v' + pkg.version + reset + '\n' +
  '  AI-orchestrated development framework\n' +
  '  for Claude Code, OpenCode, Gemini CLI, and Codex\n';

// ─── Parse Args ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');
const hasHelp = args.includes('--help') || args.includes('-h');
const hasAll = args.includes('--all');
const hasClaude = args.includes('--claude');
const hasOpencode = args.includes('--opencode');
const hasGemini = args.includes('--gemini');
const hasCodex = args.includes('--codex');

let selectedRuntimes = [];
if (hasAll) {
  selectedRuntimes = ['claude', 'opencode', 'gemini', 'codex'];
} else {
  if (hasClaude) selectedRuntimes.push('claude');
  if (hasOpencode) selectedRuntimes.push('opencode');
  if (hasGemini) selectedRuntimes.push('gemini');
  if (hasCodex) selectedRuntimes.push('codex');
}

// ─── Help ────────────────────────────────────────────────────────────────────

console.log(banner);

if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} npx spec-driven-devops [options]\n`);
  console.log(`  ${yellow}Options:${reset}`);
  console.log(`    ${cyan}-g, --global${reset}        Install globally (to config directory)`);
  console.log(`    ${cyan}-l, --local${reset}         Install locally (to current directory)`);
  console.log(`    ${cyan}--claude${reset}            Install for Claude Code only`);
  console.log(`    ${cyan}--opencode${reset}          Install for OpenCode only`);
  console.log(`    ${cyan}--gemini${reset}            Install for Gemini CLI only`);
  console.log(`    ${cyan}--codex${reset}             Install for Codex CLI only`);
  console.log(`    ${cyan}--all${reset}               Install for all runtimes`);
  console.log(`    ${cyan}-u, --uninstall${reset}     Remove installed files`);
  console.log(`    ${cyan}-h, --help${reset}          Show this help message\n`);
  console.log(`  ${yellow}Examples:${reset}`);
  console.log(`    ${dim}npx spec-driven-devops --claude --global${reset}    Install for Claude Code`);
  console.log(`    ${dim}npx spec-driven-devops --all --global${reset}       Install for all runtimes`);
  console.log(`    ${dim}npx spec-driven-devops --claude --uninstall${reset} Remove from Claude Code\n`);
  process.exit(0);
}

// ─── Runtime Directories ─────────────────────────────────────────────────────

function expandTilde(p) {
  if (p && p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function getGlobalDir(runtime) {
  switch (runtime) {
    case 'opencode':
      if (process.env.OPENCODE_CONFIG_DIR) return expandTilde(process.env.OPENCODE_CONFIG_DIR);
      if (process.env.XDG_CONFIG_HOME) return path.join(expandTilde(process.env.XDG_CONFIG_HOME), 'opencode');
      return path.join(os.homedir(), '.config', 'opencode');
    case 'gemini':
      if (process.env.GEMINI_CONFIG_DIR) return expandTilde(process.env.GEMINI_CONFIG_DIR);
      return path.join(os.homedir(), '.gemini');
    case 'codex':
      if (process.env.CODEX_HOME) return expandTilde(process.env.CODEX_HOME);
      return path.join(os.homedir(), '.codex');
    default: // claude
      if (process.env.CLAUDE_CONFIG_DIR) return expandTilde(process.env.CLAUDE_CONFIG_DIR);
      return path.join(os.homedir(), '.claude');
  }
}

function getLocalDir(runtime) {
  const names = { opencode: '.opencode', gemini: '.gemini', codex: '.codex', claude: '.claude' };
  return path.join(process.cwd(), names[runtime] || '.claude');
}

function getTargetDir(runtime) {
  return hasLocal ? getLocalDir(runtime) : getGlobalDir(runtime);
}

// ─── Tool Name Mapping ──────────────────────────────────────────────────────

const claudeToOpencodeTools = {
  AskUserQuestion: 'question',
  TodoWrite: 'todowrite',
  WebFetch: 'webfetch',
  WebSearch: 'websearch',
};

const claudeToGeminiTools = {
  Read: 'read_file',
  Write: 'write_file',
  Edit: 'replace',
  Bash: 'run_shell_command',
  Glob: 'glob',
  Grep: 'search_file_content',
  WebSearch: 'google_web_search',
  WebFetch: 'web_fetch',
  TodoWrite: 'write_todos',
  AskUserQuestion: 'ask_user',
};

// ─── Frontmatter Conversion ─────────────────────────────────────────────────

function extractFrontmatterAndBody(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: content };

  const fmLines = match[1].split('\n');
  const fm = {};
  let currentKey = null;
  let currentArray = null;

  for (const line of fmLines) {
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === '' || value === '[]') {
        fm[currentKey] = [];
        currentArray = fm[currentKey];
      } else if (value.startsWith('[')) {
        // Inline array: [Read, Write, Edit]
        fm[currentKey] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        currentArray = null;
      } else if (value.startsWith('"') && value.endsWith('"')) {
        fm[currentKey] = value.slice(1, -1);
        currentArray = null;
      } else {
        fm[currentKey] = value;
        currentArray = null;
      }
    } else if (currentArray !== null && line.match(/^\s+-\s+(.+)$/)) {
      const itemMatch = line.match(/^\s+-\s+(.+)$/);
      currentArray.push(itemMatch[1].trim());
    }
  }

  return { frontmatter: fm, body: match[2] };
}

function buildFrontmatter(fm) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fm)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${item}`);
        }
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function convertForOpencode(content, configDir) {
  const { frontmatter: fm, body } = extractFrontmatterAndBody(content);
  if (!fm) return content;

  // Convert allowed-tools to permission object
  if (fm['allowed-tools']) {
    const tools = fm['allowed-tools'];
    const converted = tools.map(t => claudeToOpencodeTools[t] || t.toLowerCase());
    fm['permission'] = converted;
    delete fm['allowed-tools'];
  }

  // Convert name: sdd:X to sdd-X (flat naming)
  if (fm.name) {
    fm.name = fm.name.replace(':', '-');
  }

  // Replace paths
  let converted = buildFrontmatter(fm) + '\n' + body;
  converted = converted.replace(/~\/\.claude\//g, configDir.replace(os.homedir(), '~/') + '/');
  converted = converted.replace(/\/sdd:/g, '/sdd-');

  return converted;
}

function convertForGemini(content, configDir) {
  const { frontmatter: fm, body } = extractFrontmatterAndBody(content);
  if (!fm) return content;

  // Convert tool names
  if (fm['allowed-tools']) {
    fm['allowed-tools'] = fm['allowed-tools'].map(t => claudeToGeminiTools[t] || t);
  }

  // Strip color field (Gemini validation error)
  delete fm.color;

  let converted = buildFrontmatter(fm) + '\n' + body;
  converted = converted.replace(/~\/\.claude\//g, configDir.replace(os.homedir(), '~/') + '/');
  // Escape ${VAR} to $VAR to avoid Gemini template expansion
  converted = converted.replace(/\$\{([^}]+)\}/g, '$$$$1');

  return converted;
}

function convertForCodex(content, configDir) {
  const { frontmatter: fm, body } = extractFrontmatterAndBody(content);
  if (!fm) return content;

  // Convert name: sdd:X to $sdd-X skill
  if (fm.name) {
    fm.name = fm.name.replace(':', '-');
  }

  let converted = buildFrontmatter(fm) + '\n' + body;
  converted = converted.replace(/~\/\.claude\//g, configDir.replace(os.homedir(), '~/') + '/');
  converted = converted.replace(/\/sdd:/g, '/sdd-');
  // $ARGUMENTS → {{VP_ARGS}}
  converted = converted.replace(/\$ARGUMENTS/g, '{{VP_ARGS}}');

  return converted;
}

// ─── Settings.json Merge ─────────────────────────────────────────────────────

function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try { return JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch { return {}; }
  }
  return {};
}

function writeSettings(settingsPath, settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

function buildHookCommand(configDir, hookName) {
  const hooksPath = configDir.replace(/\\/g, '/') + '/hooks/' + hookName;
  return `node "${hooksPath}"`;
}

// ─── File Copy ───────────────────────────────────────────────────────────────

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ─── Interactive Prompt ──────────────────────────────────────────────────────

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

// ─── Install Logic ───────────────────────────────────────────────────────────

function installForRuntime(runtime) {
  const configDir = getTargetDir(runtime);
  const runtimeLabel = {
    claude: 'Claude Code',
    opencode: 'OpenCode',
    gemini: 'Gemini CLI',
    codex: 'Codex CLI',
  }[runtime];

  console.log(`\n  ${cyan}Installing for ${runtimeLabel}...${reset}`);
  console.log(`  ${dim}Target: ${configDir}${reset}`);

  // 1. Copy commands
  const srcCommands = path.join(__dirname, '..', 'commands', 'sdd');
  let destCommands;

  if (runtime === 'claude') {
    destCommands = path.join(configDir, 'commands', 'sdd');
  } else if (runtime === 'opencode') {
    destCommands = path.join(configDir, 'custom-instructions', 'sdd');
  } else if (runtime === 'gemini') {
    destCommands = path.join(configDir, 'commands', 'sdd');
  } else {
    destCommands = path.join(configDir, 'skills', 'sdd');
  }

  fs.mkdirSync(destCommands, { recursive: true });

  const commandFiles = fs.readdirSync(srcCommands).filter(f => f.endsWith('.md'));
  let convertFn = null;
  if (runtime === 'opencode') convertFn = (c) => convertForOpencode(c, configDir);
  else if (runtime === 'gemini') convertFn = (c) => convertForGemini(c, configDir);
  else if (runtime === 'codex') convertFn = (c) => convertForCodex(c, configDir);

  for (const file of commandFiles) {
    let content = fs.readFileSync(path.join(srcCommands, file), 'utf-8');

    // Replace path references for non-Claude runtimes
    if (runtime !== 'claude') {
      content = content.replace(/\$HOME\/\.claude\//g, configDir.replace(os.homedir(), '$HOME/') + '/');
    }

    if (convertFn) {
      content = convertFn(content);
    }

    // Adjust filename for non-Claude runtimes (flatten colon notation)
    let destFile = file;
    if (runtime === 'opencode' || runtime === 'codex') {
      destFile = file.replace(/^/, 'sdd-').replace('.md', '.md');
    }

    fs.writeFileSync(path.join(destCommands, destFile), content);
  }
  console.log(`  ${green}✓${reset} ${commandFiles.length} commands installed`);

  // 2. Copy internals (sdd/)
  const srcInternals = path.join(__dirname, '..', 'sdd');
  const destInternals = path.join(configDir, 'sdd');
  copyDirRecursive(srcInternals, destInternals);
  console.log(`  ${green}✓${reset} CLI tools and workflows installed`);

  // 3. Install hooks (Claude Code only for now)
  if (runtime === 'claude') {
    const hooksDistDir = path.join(__dirname, '..', 'hooks', 'dist');
    const hooksSrcDir = path.join(__dirname, '..', 'hooks', 'src');
    // Use dist if it has actual hook files, otherwise fall back to src
    const distHasHooks = fs.existsSync(hooksDistDir) && fs.readdirSync(hooksDistDir).some(f => f.startsWith('vp-'));
    const hooksSource = distHasHooks ? hooksDistDir : hooksSrcDir;

    if (fs.existsSync(hooksSource)) {
      const destHooks = path.join(configDir, 'hooks');
      fs.mkdirSync(destHooks, { recursive: true });

      const hookFiles = fs.readdirSync(hooksSource).filter(f => f.startsWith('vp-'));
      for (const file of hookFiles) {
        fs.copyFileSync(path.join(hooksSource, file), path.join(destHooks, file));
      }

      // Merge hooks into settings.json (new matcher format)
      const settingsPath = path.join(configDir, 'settings.json');
      const settings = readSettings(settingsPath);

      if (!settings.hooks) settings.hooks = {};

      // Clean up old-format entries and any previous Statusline hook
      delete settings.hooks.Statusline;
      for (const event of ['PostToolUse', 'SessionStart']) {
        if (Array.isArray(settings.hooks[event])) {
          settings.hooks[event] = settings.hooks[event].filter(h =>
            !(h.command && h.command.includes('vp-')) && // old flat format
            !(h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('vp-'))) // old matcher format
          );
          if (settings.hooks[event].length === 0) delete settings.hooks[event];
        }
      }

      // Hook entries in new matcher format: {matcher, hooks: [{type, command}]}
      const hookConfig = [
        {
          event: 'PostToolUse',
          matcher: '',
          file: 'vp-context-monitor.js',
        },
        {
          event: 'SessionStart',
          matcher: '',
          file: 'vp-session-start.js',
        },
      ];

      for (const config of hookConfig) {
        const cmd = buildHookCommand(configDir, config.file);
        if (!settings.hooks[config.event]) settings.hooks[config.event] = [];

        settings.hooks[config.event].push({
          matcher: config.matcher,
          hooks: [{ type: 'command', command: cmd }],
        });
      }

      // Statusline is a top-level setting, not a hook event
      settings.statusLine = {
        type: 'command',
        command: buildHookCommand(configDir, 'vp-statusline.js'),
      };

      writeSettings(settingsPath, settings);
      console.log(`  ${green}✓${reset} Hooks and statusline installed`);
    }
  }

  console.log(`  ${green}✓ ${runtimeLabel} installation complete${reset}`);
}

function uninstallForRuntime(runtime) {
  const configDir = getTargetDir(runtime);
  const runtimeLabel = {
    claude: 'Claude Code',
    opencode: 'OpenCode',
    gemini: 'Gemini CLI',
    codex: 'Codex CLI',
  }[runtime];

  console.log(`\n  ${yellow}Uninstalling from ${runtimeLabel}...${reset}`);

  // Remove commands
  let commandsDir;
  if (runtime === 'claude') commandsDir = path.join(configDir, 'commands', 'sdd');
  else if (runtime === 'opencode') commandsDir = path.join(configDir, 'custom-instructions', 'sdd');
  else if (runtime === 'gemini') commandsDir = path.join(configDir, 'commands', 'sdd');
  else commandsDir = path.join(configDir, 'skills', 'sdd');

  removeDir(commandsDir);

  // Remove internals
  removeDir(path.join(configDir, 'sdd'));

  // Remove hooks from settings.json (Claude only)
  if (runtime === 'claude') {
    const settingsPath = path.join(configDir, 'settings.json');
    const settings = readSettings(settingsPath);
    if (settings.hooks) {
      for (const event of Object.keys(settings.hooks)) {
        if (!Array.isArray(settings.hooks[event])) {
          delete settings.hooks[event];
          continue;
        }
        settings.hooks[event] = settings.hooks[event].filter(h => {
          // Remove old flat format
          if (h.command && h.command.includes('vp-')) return false;
          // Remove new matcher format
          if (h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('vp-'))) return false;
          return true;
        });
        if (settings.hooks[event].length === 0) delete settings.hooks[event];
      }
      if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
    }
    // Remove statusLine if it's ours
    if (settings.statusLine && settings.statusLine.command && settings.statusLine.command.includes('vp-')) {
      delete settings.statusLine;
    }
    writeSettings(settingsPath, settings);

    // Remove hook files
    const hooksDir = path.join(configDir, 'hooks');
    if (fs.existsSync(hooksDir)) {
      const hookFiles = fs.readdirSync(hooksDir).filter(f => f.startsWith('vp-'));
      for (const file of hookFiles) {
        fs.unlinkSync(path.join(hooksDir, file));
      }
    }
  }

  console.log(`  ${green}✓ ${runtimeLabel} uninstall complete${reset}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // If no runtime selected, prompt
  if (selectedRuntimes.length === 0) {
    console.log(`  ${yellow}Select runtime(s):${reset}`);
    console.log(`    1. Claude Code`);
    console.log(`    2. OpenCode`);
    console.log(`    3. Gemini CLI`);
    console.log(`    4. Codex CLI`);
    console.log(`    5. All\n`);

    const choice = await prompt(`  ${cyan}Enter choice (1-5): ${reset}`);
    switch (choice) {
      case '1': selectedRuntimes = ['claude']; break;
      case '2': selectedRuntimes = ['opencode']; break;
      case '3': selectedRuntimes = ['gemini']; break;
      case '4': selectedRuntimes = ['codex']; break;
      case '5': selectedRuntimes = ['claude', 'opencode', 'gemini', 'codex']; break;
      default:
        console.log(`  ${yellow}Invalid choice. Defaulting to Claude Code.${reset}`);
        selectedRuntimes = ['claude'];
    }
  }

  // If no location specified, default to global
  if (!hasGlobal && !hasLocal) {
    // Default to global install
  }

  // Execute
  for (const runtime of selectedRuntimes) {
    if (hasUninstall) {
      uninstallForRuntime(runtime);
    } else {
      installForRuntime(runtime);
    }
  }

  if (!hasUninstall) {
    console.log(`\n  ${green}${bold}Installation complete!${reset}`);
    console.log(`\n  ${dim}Start a new session and run /sdd:start to begin.${reset}\n`);
  } else {
    console.log(`\n  ${green}${bold}Uninstall complete!${reset}\n`);
  }
}

main().catch(err => {
  console.error(`  ${yellow}Error: ${err.message}${reset}`);
  process.exit(1);
});
