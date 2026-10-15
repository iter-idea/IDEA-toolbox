'use strict';

// Test suite for `TimeInterval.validate` — see src/timeInterval.model.ts.
// Plain CommonJS so it is neither linted (eslint targets *.ts) nor compiled by tsc.
// Run with: npm test  (compiles to dist/ first, then `node --test`).

const test = require('node:test');
const assert = require('node:assert/strict');

const { TimeInterval } = require('../dist/index.js');

const anHourInMs = 3600000;

test('TimeInterval.validate — from', () => {
  assert.deepEqual(new TimeInterval({ from: 0, to: anHourInMs }).validate(), [], 'midnight is a valid start');
  assert.deepEqual(new TimeInterval({ from: anHourInMs, to: 2 * anHourInMs }).validate(), []);
  assert.deepEqual(new TimeInterval({ from: -1, to: anHourInMs }).validate(), ['from']);
  assert.deepEqual(new TimeInterval({ from: 'abc', to: anHourInMs }).validate(), ['from'], "'abc' (loaded as NaN)");
});
