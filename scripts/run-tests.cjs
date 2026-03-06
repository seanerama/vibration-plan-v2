#!/usr/bin/env node

/**
 * Test runner for spec-driven-devops
 */

const fs = require('fs');
const path = require('path');

const testsDir = path.join(__dirname, '..', 'tests');
const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.cjs'));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    failures.push(message);
    console.log(`  ✗ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  totalTests++;
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passedTests++;
  } else {
    failedTests++;
    const msg = `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
    failures.push(msg);
    console.log(`  ✗ ${msg}`);
  }
}

// Export test utilities
global.assert = assert;
global.assertEqual = assertEqual;

console.log('\nSpec-Driven DevOps Test Suite\n');

for (const file of testFiles) {
  const testName = file.replace('.test.cjs', '');
  console.log(`Running: ${testName}`);
  try {
    require(path.join(testsDir, file));
  } catch (err) {
    failedTests++;
    failures.push(`${testName}: ${err.message}`);
    console.log(`  ✗ ${testName} crashed: ${err.message}`);
  }
  console.log('');
}

console.log(`\nResults: ${passedTests} passed, ${failedTests} failed, ${totalTests} total\n`);

if (failedTests > 0) {
  console.log('Failures:');
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
  process.exit(1);
}
