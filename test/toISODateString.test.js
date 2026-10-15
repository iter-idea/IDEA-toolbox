'use strict';

// Test suite for `toISODateString` and `nowISODateString` — see src/utils.ts.
// Each case runs in several timezones, switching the process' `TZ` at runtime (Node applies it immediately).
// Plain CommonJS so it is neither linted (eslint targets *.ts) nor compiled by tsc.
// Run with: npm test  (compiles to dist/ first, then `node --test`).

const test = require('node:test');
const assert = require('node:assert/strict');

const { toISODateString, nowISODateString } = require('../dist/index.js');

// [timezone, its day at the instant `2026-07-15T10:00:00.000Z`]
const TIMEZONES = [
  ['UTC', '2026-07-15'],
  ['Europe/Rome', '2026-07-15'],
  ['America/New_York', '2026-07-15'],
  ['Asia/Tokyo', '2026-07-15'],
  ['Australia/Sydney', '2026-07-15'],
  ['Pacific/Fiji', '2026-07-15'], // +12
  ['Pacific/Auckland', '2026-07-15'], // +12, +13 in summer
  ['Pacific/Chatham', '2026-07-15'], // +12:45, +13:45 in summer
  ['Pacific/Tongatapu', '2026-07-15'], // +13
  ['Pacific/Kiritimati', '2026-07-16'], // +14: it's already the next day
  ['Etc/GMT+12', '2026-07-14'] // −12: it's still the previous day
];

/**
 * Run `fn` with the process set in a timezone.
 */
const inTimezone = (timezone, fn) => {
  const previous = process.env.TZ;
  process.env.TZ = timezone;
  try {
    fn();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
};

/**
 * Today in a timezone, according to Intl (ICU) rather than to the local getters of `Date`.
 */
const todayIn = timezone => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(new Date());
  const part = type => parts.find(p => p.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
};

// --- the right day in every timezone -----------------------------------------
for (const [timezone, dayOfInstant] of TIMEZONES)
  test(`toISODateString — ${timezone}`, () =>
    inTimezone(timezone, () => {
      // the cases of #32
      assert.equal(toISODateString('2026-07-15'), '2026-07-15');
      assert.equal(toISODateString(new Date(2026, 0, 15, 12)), '2026-01-15');
      assert.equal(toISODateString(new Date(2026, 6, 15, 0, 30)), '2026-07-15');
      assert.equal(toISODateString(new Date(2026, 6, 15, 23, 30)), '2026-07-15');
      // an instant (ISO date-time or epoch) gives its day in the local timezone
      assert.equal(toISODateString('2026-07-15T10:00:00.000Z'), dayOfInstant);
      assert.equal(toISODateString(Date.parse('2026-07-15T10:00:00.000Z')), dayOfInstant);
      // every day of the year (summer and winter time), from its first to its last moment
      for (let day = 1; day <= 365; day++) {
        const expected = new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
        assert.equal(toISODateString(expected), expected);
        assert.equal(toISODateString(new Date(2026, 0, day)), expected, `${expected} at 00:00`);
        assert.equal(toISODateString(new Date(2026, 0, day, 12)), expected, `${expected} at 12:00`);
        assert.equal(toISODateString(new Date(2026, 0, day, 23, 59, 59, 999)), expected, `${expected} at 23:59`);
      }
      // today (read before and after, in case the day changes meanwhile)
      const before = todayIn(timezone);
      const today = nowISODateString();
      assert.ok([before, todayIn(timezone)].includes(today), `nowISODateString() → ${today}, expected ${before}`);
    }));

// --- empty and invalid inputs ------------------------------------------------
test('toISODateString — empty and invalid inputs', () => {
  for (const [timezone] of TIMEZONES)
    inTimezone(timezone, () => {
      for (const empty of [null, undefined, '', 0, NaN]) assert.equal(toISODateString(empty), null);
      // like `Date.toISOString`, an invalid date throws
      for (const invalid of ['abc', '2026-13-01', '2026-01-32', '0012-25-12', '0001-01-00', new Date('x'), Infinity])
        assert.throws(() => toISODateString(invalid), RangeError);
      // in V8, an overflowing day moves to the next month (JavaScriptCore throws instead)
      assert.equal(toISODateString('2026-02-30'), '2026-03-02');
      // the year is always on 4 digits
      const date = new Date(2026, 6, 15);
      date.setFullYear(50);
      assert.equal(toISODateString(date), '0050-07-15');
    });
});
