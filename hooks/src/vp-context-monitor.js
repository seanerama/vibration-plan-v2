#!/usr/bin/env node

/**
 * vp-context-monitor — PostToolUse hook for Claude Code
 *
 * Monitors context window usage and warns when running low.
 * Reads metrics from the statusline bridge file.
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

    // Read context metrics from bridge file
    const bridgePath = path.join(os.tmpdir(), 'vp-context-bridge.json');
    let bridge = {};
    try {
      if (fs.existsSync(bridgePath)) {
        bridge = JSON.parse(fs.readFileSync(bridgePath, 'utf-8'));
      }
    } catch {}

    // Calculate remaining context
    const totalTokens = data.total_tokens || bridge.total_tokens || 0;
    const maxTokens = data.max_tokens || bridge.max_tokens || 200000;
    const remaining = maxTokens > 0 ? (maxTokens - totalTokens) / maxTokens : 1;

    const result = {};

    if (remaining <= 0.25) {
      // CRITICAL
      result.message = [
        '⚠️ CRITICAL: Context window nearly full (< 25% remaining).',
        'STOP current work. Save your progress:',
        '',
        'If using VibrationPlan, run:',
        '  node "$HOME/.claude/sdd/bin/vp-tools.cjs" state record-session --stopped-at "description of where you stopped"',
        '',
        'Then start a fresh session and run /sdd:next to continue.',
      ].join('\n');
    } else if (remaining <= 0.35) {
      // WARNING
      result.message = [
        '⚠️ Context window getting low (< 35% remaining).',
        'Begin wrapping up current work.',
        'Consider running /sdd:status to save state before the session ends.',
      ].join('\n');
    }

    process.stdout.write(JSON.stringify(result));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
});
