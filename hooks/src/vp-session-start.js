#!/usr/bin/env node

/**
 * vp-session-start — SessionStart hook for Claude Code
 *
 * Checks for spec-driven-devops updates (cached, once per day) and displays
 * VP state summary if STATE.md exists in the current project.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const cwd = data.cwd || process.cwd();
    const messages = [];

    // Check if VP project exists in current directory
    const statePath = path.join(cwd, 'vibration-plan', 'STATE.md');
    if (fs.existsSync(statePath)) {
      const content = fs.readFileSync(statePath, 'utf-8');

      const extractField = (fieldName) => {
        const pattern = new RegExp(`\\*\\*${fieldName}:\\*\\*\\s*(.+)`, 'i');
        const match = content.match(pattern);
        return match ? match[1].trim() : null;
      };

      const vpPath = extractField('Path') || 'Unknown';
      const phase = extractField('Current Phase') || 'Unknown';
      const status = extractField('Status') || 'Unknown';
      const stoppedAt = extractField('Stopped At');

      messages.push(`VibrationPlan project detected (${vpPath})`);
      messages.push(`  Phase: ${phase} | Status: ${status}`);
      if (stoppedAt && stoppedAt !== 'Initial setup') {
        messages.push(`  Last stopped at: ${stoppedAt}`);
      }
      messages.push(`  Run /vp:next to see what to do next.`);
    }

    // Version check (cached, once per day)
    const cachePath = path.join(os.tmpdir(), 'vp-version-check.json');
    let shouldCheck = true;
    try {
      if (fs.existsSync(cachePath)) {
        const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        const lastCheck = new Date(cache.timestamp);
        const now = new Date();
        // Only check once per day
        if (now - lastCheck < 24 * 60 * 60 * 1000) {
          shouldCheck = false;
          if (cache.updateAvailable) {
            messages.push(`\nUpdate available: ${cache.latestVersion} (current: ${cache.currentVersion})`);
            messages.push(`  Run: npx spec-driven-devops --claude --global`);
          }
        }
      }
    } catch {}

    if (shouldCheck) {
      // We won't block on network check — just note the cache attempt
      try {
        const pkg = require(path.join(__dirname, '..', '..', 'sdd', 'package.json'));
        fs.writeFileSync(cachePath, JSON.stringify({
          timestamp: new Date().toISOString(),
          currentVersion: pkg?.version || 'unknown',
          updateAvailable: false,
        }), 'utf-8');
      } catch {}
    }

    const result = {};
    if (messages.length > 0) {
      result.message = messages.join('\n');
    }

    process.stdout.write(JSON.stringify(result));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
});
