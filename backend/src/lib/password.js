import { randomBytes, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

/**
 * scrypt-based password hashing. No external dependency is needed because
 * Node's built-in crypto module has provided scrypt since Node 10.
 */
export async function hashPassword(plainTextPassword) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(plainTextPassword, salt, KEY_LENGTH);
  return `scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(plainTextPassword, storedHash) {
  if (typeof storedHash !== 'string' || !storedHash.startsWith('scrypt:')) return false;
  const [, saltHex, keyHex] = storedHash.split(':');
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expectedKey = Buffer.from(keyHex, 'hex');
  const derivedKey = await scrypt(plainTextPassword, salt, KEY_LENGTH);
  if (derivedKey.length !== expectedKey.length) return false;
  return timingSafeEqual(derivedKey, expectedKey);
}
