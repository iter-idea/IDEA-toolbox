'use strict';

// Test suite for `isEmpty` (and its alias `Resource.iE`) — see src/utils.ts.
// Plain CommonJS so it is neither linted (eslint targets *.ts) nor compiled by tsc.
// Run with: npm test  (compiles to dist/ first, then `node --test`).

const test = require('node:test');
const assert = require('node:assert/strict');

const { isEmpty, Resource } = require('../dist/index.js');

/**
 * Run a `[input, expected]` matrix for a given field type.
 * `label` is used only to make failures readable.
 */
const matrix = (fieldType, cases) => {
  test(`isEmpty — ${fieldType}`, () => {
    for (const [input, expected, label] of cases) {
      const got = isEmpty(input, fieldType);
      assert.equal(
        got,
        expected,
        `isEmpty(${label ?? JSON.stringify(input)}, '${fieldType}') → ${got}, expected ${expected}`
      );
    }
  });
};

// --- number: a finite, non-zero number is the only non-empty value -----------
matrix('number', [
  [0, true],
  [3, false],
  [-1, false],
  [3.5, false],
  [NaN, true, 'NaN'],
  [Infinity, true, 'Infinity'],
  [-Infinity, true, '-Infinity'],
  ['5', true, "'5' (string)"],
  ['abc', true, "'abc'"],
  [null, true],
  [undefined, true]
]);

// --- positiveNumber: finite and > 0 ------------------------------------------
matrix('positiveNumber', [
  [2, false],
  [0.5, false],
  [0, true],
  [-1, true],
  [NaN, true, 'NaN'],
  [Infinity, true, 'Infinity'],
  ['x', true, "'x'"],
  ['5', true, "'5' (string)"]
]);

// --- integer: an integer (any sign) other than 0 -----------------------------
matrix('integer', [
  [3, false],
  [-2, false],
  [0, true],
  [3.5, true],
  [NaN, true, 'NaN'],
  [Infinity, true, 'Infinity'],
  ['3', true, "'3' (string)"]
]);

// --- positiveInteger: an integer > 0 -----------------------------------------
matrix('positiveInteger', [
  [3, false],
  [0, true],
  [-2, true],
  [3.5, true],
  [NaN, true, 'NaN'],
  ['3', true, "'3' (string)"]
]);

// --- date: strict YYYY-MM-DD calendar-valid string ---------------------------
matrix('date', [
  ['2026-05-22', false],
  ['2026-13-01', true, 'invalid month'],
  ['2026-02-30', true, 'Feb 30'],
  ['2026-5-2', true, 'non-padded'],
  ['2026', true, 'bare year'],
  ['05/22/2026', true, 'US format'],
  ['2026-05-22T00:00:00Z', true, 'datetime string'],
  [1716379200000, true, 'numeric timestamp'],
  [new Date(), true, 'Date object'],
  ['', true, 'empty string'],
  [null, true]
]);

// --- datetime: complete ISO 8601 date-time string ----------------------------
matrix('datetime', [
  ['2026-05-22T10:00:00.000Z', false],
  ['2026-05-22T10:00:00Z', false, 'no millis'],
  ['2026-05-22', true, 'date-only → use "date"'],
  ['2026-02-30T10:00:00.000Z', true, 'Feb 30'],
  ['abc', true, "'abc'"],
  [new Date(), true, 'Date object'],
  [null, true]
]);

// --- boolean: both true and false are valid (D6 option B) --------------------
matrix('boolean', [
  [true, false],
  [false, false],
  [null, true],
  [undefined, true],
  [1, true, '1 (number)'],
  ['true', true, "'true' (string)"]
]);

// --- string: a non-whitespace string -----------------------------------------
matrix('string', [
  ['x', false],
  [' ', true, 'whitespace'],
  ['', true, 'empty'],
  [123, true, '123 (number)'],
  [null, true]
]);

// --- object → array measures cardinality, not truthiness (D7) ----------------
matrix('object', [
  [[1], false, '[1]'],
  [[], true, '[]'],
  [[0], false, '[0]'],
  [[false], false, '[false]'],
  [new Set([1]), false, 'Set{1}'],
  [new Set(), true, 'empty Set'],
  [{ a: 1 }, false, '{a:1}'],
  [{}, true, '{}'],
  [new Date('2026-05-22'), false, 'valid Date'],
  [new Date('not-a-date'), true, 'Invalid Date']
]);

// --- email / phone / url / domain: format validity ---------------------------
matrix('email', [
  ['a@b.com', false],
  ['not-an-email', true],
  [123, true, '123 (number)']
]);
matrix('url', [
  ['https://iter-idea.com', false],
  ['not a url', true],
  [123, true, '123 (number)']
]);
matrix('domain', [
  ['iter-idea.com', false],
  ['localhost', false, 'no TLD allowed'],
  ['not a domain', true]
]);

// --- type auto-detection (no fieldType given) --------------------------------
test('isEmpty — auto-detected type', () => {
  assert.equal(isEmpty(null), true);
  assert.equal(isEmpty(undefined), true);
  assert.equal(isEmpty(''), true, "'' auto → string");
  assert.equal(isEmpty('x'), false);
  assert.equal(isEmpty(0), true, '0 auto → number');
  assert.equal(isEmpty(3), false);
  assert.equal(isEmpty([]), true, '[] auto → object');
  assert.equal(isEmpty([1]), false);
});

// --- Resource.iE is a thin alias of isEmpty ----------------------------------
test('Resource.iE delegates to isEmpty', () => {
  class Sample extends Resource {}
  const r = new Sample();
  assert.equal(r.iE(NaN, 'positiveNumber'), true);
  assert.equal(r.iE(5, 'positiveNumber'), false);
  assert.equal(r.iE('2026-05-22', 'date'), false);
  assert.equal(r.iE(false, 'boolean'), false);
});
