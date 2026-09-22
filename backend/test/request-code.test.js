import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateRequestCode } from '../src/domain/request-code.js';

describe('generateRequestCode', () => {
  test('matches the ONB-YYYY-XXXXXX pattern', () => {
    const code = generateRequestCode(new Date('2026-09-18T00:00:00Z'));
    assert.match(code, /^ONB-2026-[0-9A-Z]{6}$/);
  });

  test('uses the year from the provided date', () => {
    const code = generateRequestCode(new Date('2030-01-01T00:00:00Z'));
    assert.match(code, /^ONB-2030-/);
  });

  test('generates distinct codes across calls (collision resistance)', () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateRequestCode()));
    assert.equal(codes.size, 200);
  });
});
