import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../../src/app.js';

/**
 * Boots the real Express app (via createApp) on an ephemeral port against a
 * temporary data directory, and returns a `fetch`-like helper plus a
 * teardown function. No supertest dependency is needed: Node 20+ ships a
 * global `fetch`, and this is a one-message-shape helper on top of it.
 */
export async function startTestServer(configOverrides = {}) {
  const dataDir = await mkdtemp(join(tmpdir(), 'onboarding-app-test-'));

  const app = await createApp({
    NODE_ENV: 'test',
    isProduction: false,
    PORT: 0,
    CORS_ORIGIN: ['http://localhost:3000'],
    SESSION_SECRET: 'test-secret-at-least-16-chars-long',
    CORPORATE_EMAIL_DOMAIN: 'insidemaps.com',
    DATA_DIR: dataDir,
    ZOHO_MODE: 'simulated',
    ZOHO_DC: 'com',
    ZOHO_ORG_ID: '',
    ZOHO_CLIENT_ID: '',
    ZOHO_CLIENT_SECRET: '',
    ZOHO_REFRESH_TOKEN: '',
    MAIL_MODE: 'outbox',
    MAIL_FROM: 'IT Provisioning <it@insidemaps.com>',
    SMTP_HOST: '',
    SMTP_PORT: 587,
    SMTP_USER: '',
    SMTP_PASS: '',
    ...configOverrides,
  });

  const server = await new Promise((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  let sessionCookie = null;

  async function request(path, options = {}) {
    const headers = { ...(options.headers ?? {}) };
    if (options.body) headers['Content-Type'] = 'application/json';
    if (sessionCookie) headers.Cookie = sessionCookie;

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }

    const text = await response.text();
    const json = text ? JSON.parse(text) : undefined;
    return { status: response.status, body: json };
  }

  function clearSession() {
    sessionCookie = null;
  }

  async function stop() {
    await new Promise((resolve) => server.close(resolve));
    await rm(dataDir, { recursive: true, force: true });
  }

  return { request, clearSession, stop, dataDir };
}
