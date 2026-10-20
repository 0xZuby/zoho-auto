import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { requireRole } from '../middleware/auth.js';
import { ROLE } from '../domain/users.js';
import { getFormCatalog } from '../config/catalog.js';
import { unprocessable } from '../lib/http-error.js';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { encryptSecret } from '../lib/encrypted-secret.js';

function signedState(userId, secret) {
  const payload = Buffer.from(JSON.stringify({ userId, nonce: randomBytes(24).toString('hex'), exp: Date.now() + 10 * 60_000 })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function validState(value, secret, userId) {
  if (typeof value !== 'string') return false;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', secret).update(payload).digest();
  const actual = Buffer.from(signature, 'hex');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return decoded.userId === userId && decoded.exp > Date.now();
  } catch { return false; }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Administrator-only routes (PRD "Administrator" user type + "Administration"
 * MVP scope). The MVP intentionally exposes the deterministic rules engine
 * and field catalog as read-only configuration and adds the one piece of
 * write configuration explicitly listed for the MVP: managing Auditor
 * accounts. Editing department/team/position lists and permission mappings
 * in this release is a file edit to backend/src/config (documented in
 * backend/README.md) rather than a UI, keeping the rules engine's
 * "deterministic and auditable by editing a file" property from PRD
 * section 10 intact; a config UI can be layered on top later without
 * changing the underlying rules module.
 */
export function createAdminRouter({ userRepository, rulesRepository, zohoConfig, zohoCredentials, sessionSecret }) {
  const router = Router();
  router.use(requireRole(ROLE.ADMINISTRATOR));

  router.get(
    '/catalog',
    asyncHandler(async (_req, res) => {
      res.json(getFormCatalog());
    }),
  );

  router.get(
    '/rules',
    asyncHandler(async (_req, res) => {
      res.json(await rulesRepository.getRules());
    }),
  );

  router.put(
    '/rules',
    asyncHandler(async (req, res) => {
      const updated = await rulesRepository.updateRules({
        actorId: req.user.id,
        domainRule: req.body?.domainRule,
        positionMappings: req.body?.positionMappings,
      });
      res.json(updated);
    }),
  );

  router.get(
    '/zoho-integration',
    asyncHandler(async (_req, res) => {
      res.json({
        mode: await zohoCredentials.findOne((entry) => entry.key === 'oauth') ? 'live' : zohoConfig.ZOHO_MODE,
        dataCenter: zohoConfig.ZOHO_DC,
        organizationConfigured: Boolean(zohoConfig.ZOHO_ORG_ID),
        connected: Boolean(await zohoCredentials.findOne((entry) => entry.key === 'oauth') || zohoConfig.ZOHO_REFRESH_TOKEN),
        setupReady: Boolean(zohoConfig.ZOHO_CLIENT_ID && zohoConfig.ZOHO_CLIENT_SECRET && zohoConfig.ZOHO_OAUTH_REDIRECT_URI && zohoConfig.ZOHO_ORG_ID && /^[\da-f]{64}$/i.test(zohoConfig.ZOHO_TOKEN_ENCRYPTION_KEY)),
        insideMapsMode: zohoConfig.INSIDEMAPS_MODE ?? 'simulated',
        insideMapsConfigured: Boolean(zohoConfig.INSIDEMAPS_API_URL && zohoConfig.INSIDEMAPS_API_TOKEN),
      });
    }),
  );

  router.get('/zoho/connect', (req, res) => {
    const { ZOHO_CLIENT_ID, ZOHO_OAUTH_REDIRECT_URI, ZOHO_DC } = zohoConfig;
    if (!ZOHO_CLIENT_ID || !ZOHO_OAUTH_REDIRECT_URI) {
      return res.redirect(`${zohoConfig.FRONTEND_URL}/auditor/integrations/zoho?error=setup`);
    }
    const url = new URL(`https://accounts.zoho.${ZOHO_DC}/oauth/v2/auth`);
    url.search = new URLSearchParams({
      response_type: 'code', client_id: ZOHO_CLIENT_ID, scope: 'ZohoMail.organization.accounts.ALL',
      redirect_uri: ZOHO_OAUTH_REDIRECT_URI, access_type: 'offline', prompt: 'consent',
      state: signedState(req.user.id, sessionSecret),
    }).toString();
    return res.redirect(url.toString());
  });

  router.get('/zoho/callback', asyncHandler(async (req, res) => {
    const fail = (reason) => res.redirect(`${zohoConfig.FRONTEND_URL}/auditor/integrations/zoho?error=${reason}`);
    if (!req.query.code || !validState(req.query.state, sessionSecret, req.user.id)) return fail('authorization');
    if (!zohoConfig.ZOHO_TOKEN_ENCRYPTION_KEY || !zohoConfig.ZOHO_CLIENT_SECRET) return fail('setup');
    const params = new URLSearchParams({
      code: String(req.query.code), grant_type: 'authorization_code', client_id: zohoConfig.ZOHO_CLIENT_ID,
      client_secret: zohoConfig.ZOHO_CLIENT_SECRET, redirect_uri: zohoConfig.ZOHO_OAUTH_REDIRECT_URI,
    });
    const response = await fetch(`https://accounts.zoho.${zohoConfig.ZOHO_DC}/oauth/v2/token`, { method: 'POST', body: params });
    const token = await response.json();
    if (!response.ok || !token.refresh_token) return fail('token');
    const encrypted = encryptSecret(token.refresh_token, zohoConfig.ZOHO_TOKEN_ENCRYPTION_KEY);
    const current = await zohoCredentials.findOne((entry) => entry.key === 'oauth');
    if (current) {
      await zohoCredentials.updateOne((entry) => entry.key === 'oauth', (entry) => ({ ...entry, encryptedRefreshToken: encrypted, connectedBy: req.user.id, connectedAt: new Date().toISOString() }));
    } else {
      await zohoCredentials.insertOne({ key: 'oauth', encryptedRefreshToken: encrypted, connectedBy: req.user.id, connectedAt: new Date().toISOString() });
    }
    return res.redirect(`${zohoConfig.FRONTEND_URL}/auditor/integrations/zoho?connected=1`);
  }));

  router.get(
    '/auditors',
    asyncHandler(async (_req, res) => {
      res.json(await userRepository.list());
    }),
  );

  router.post(
    '/auditors',
    asyncHandler(async (req, res) => {
      const { name, email, password, role } = req.body ?? {};
      const errors = {};
      if (!String(name ?? '').trim()) errors.name = 'Name is required.';
      if (!EMAIL_PATTERN.test(email ?? '')) errors.email = 'Enter a valid email address.';
      if (!password || String(password).length < 8) errors.password = 'Password must be at least 8 characters.';
      if (![ROLE.AUDITOR, ROLE.ADMINISTRATOR, ROLE.HR].includes(role)) errors.role = 'Select a valid role.';
      if (Object.keys(errors).length) throw unprocessable('Please correct the highlighted fields.', errors);

      const user = await userRepository.create({ name, email, password, role });
      res.status(201).json(userRepository.toPublicUser(user));
    }),
  );

  return router;
}
