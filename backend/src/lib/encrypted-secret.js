import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function getKey(keyHex) {
  const key = Buffer.from(keyHex ?? '', 'hex');
  if (key.length !== 32) throw new Error('ZOHO_TOKEN_ENCRYPTION_KEY must be 64 hexadecimal characters.');
  return key;
}

export function encryptSecret(value, keyHex) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(keyHex), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}.${cipher.getAuthTag().toString('hex')}.${ciphertext.toString('hex')}`;
}

export function decryptSecret(value, keyHex) {
  const [ivHex, tagHex, ciphertextHex] = String(value ?? '').split('.');
  const decipher = createDecipheriv('aes-256-gcm', getKey(keyHex), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextHex, 'hex')), decipher.final()]).toString('utf8');
}
