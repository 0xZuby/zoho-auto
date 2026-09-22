import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { proposeCorporateEmail, slugifyName } from '../src/domain/corporate-email.js';

describe('slugifyName', () => {
  test('lowercases and splits on whitespace', () => {
    assert.deepEqual(slugifyName('Jane Doe'), ['jane', 'doe']);
  });

  test('strips diacritics', () => {
    assert.deepEqual(slugifyName('José Núñez'), ['jose', 'nunez']);
  });

  test('handles a single name', () => {
    assert.deepEqual(slugifyName('Madonna'), ['madonna']);
  });
});

describe('proposeCorporateEmail', () => {
  test('builds first.last@domain for a two-part name', () => {
    const email = proposeCorporateEmail('Jane Doe', 'insidemaps.com', []);
    assert.equal(email, 'jane.doe@insidemaps.com');
  });

  test('uses the middle name(s) between the first and last as part of the join, taking first+last only', () => {
    const email = proposeCorporateEmail('Jane Middle Doe', 'insidemaps.com', []);
    assert.equal(email, 'jane.doe@insidemaps.com');
  });

  test('falls back to a placeholder local part when no name is given', () => {
    const email = proposeCorporateEmail('', 'insidemaps.com', []);
    assert.equal(email, 'new.employee@insidemaps.com');
  });

  test('appends a numeric suffix on collision with an existing email', () => {
    const email = proposeCorporateEmail('Jane Doe', 'insidemaps.com', ['jane.doe@insidemaps.com']);
    assert.equal(email, 'jane.doe1@insidemaps.com');
  });

  test('keeps incrementing the suffix until a free address is found', () => {
    const existing = ['jane.doe@insidemaps.com', 'jane.doe1@insidemaps.com', 'jane.doe2@insidemaps.com'];
    const email = proposeCorporateEmail('Jane Doe', 'insidemaps.com', existing);
    assert.equal(email, 'jane.doe3@insidemaps.com');
  });

  test('collision checks are case-insensitive', () => {
    const email = proposeCorporateEmail('Jane Doe', 'insidemaps.com', ['JANE.DOE@insidemaps.com']);
    assert.equal(email, 'jane.doe1@insidemaps.com');
  });
});
