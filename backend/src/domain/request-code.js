import { randomInt } from 'node:crypto';

/** Human-friendly request identifiers, e.g. ONB-2026-3F8A21 (PRD section 17). */
export function generateRequestCode(date = new Date()) {
  const year = date.getFullYear();
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[randomInt(alphabet.length)];
  }
  return `ONB-${year}-${suffix}`;
}
