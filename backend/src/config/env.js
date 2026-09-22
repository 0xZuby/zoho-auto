import 'dotenv/config';
import { fileURLToPath } from 'node:url';

function requireInProduction(name, value, isProduction) {
  if (isProduction && !value) {
    throw new Error(`${name} must be set when NODE_ENV=production.`);
  }
  return value;
}

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProduction = NODE_ENV === 'production';

export const env = {
  NODE_ENV,
  isProduction,
  PORT: Number(process.env.PORT ?? 4000),
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  SESSION_SECRET: requireInProduction(
    'SESSION_SECRET',
    process.env.SESSION_SECRET ?? 'dev-only-insecure-secret-change-me-0123456789',
    isProduction,
  ),
  CORPORATE_EMAIL_DOMAIN: process.env.CORPORATE_EMAIL_DOMAIN ?? 'insidemaps.com',
  // `.pathname` on a file:// URL yields a POSIX-style path (e.g.
  // "/C:/Users/...") on Windows, which is not a usable filesystem path.
  // fileURLToPath() converts correctly on every platform.
  DATA_DIR: process.env.DATA_DIR ?? fileURLToPath(new URL('../../data', import.meta.url)),

  ZOHO_MODE: process.env.ZOHO_MODE === 'live' ? 'live' : 'simulated',
  ZOHO_DC: process.env.ZOHO_DC ?? 'com',
  ZOHO_ORG_ID: process.env.ZOHO_ORG_ID ?? '',
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID ?? '',
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET ?? '',
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN ?? '',

  MAIL_MODE: process.env.MAIL_MODE === 'smtp' ? 'smtp' : 'outbox',
  MAIL_FROM: process.env.MAIL_FROM ?? 'IT Provisioning <it@insidemaps.com>',
  SMTP_HOST: process.env.SMTP_HOST ?? '',
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASS: process.env.SMTP_PASS ?? '',
};

if (env.ZOHO_MODE === 'live') {
  for (const key of ['ZOHO_ORG_ID', 'ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN']) {
    if (!env[key]) {
      throw new Error(`${key} must be set when ZOHO_MODE=live.`);
    }
  }
}
