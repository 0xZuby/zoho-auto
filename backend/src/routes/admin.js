import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { requireRole } from '../middleware/auth.js';
import { ROLE } from '../domain/users.js';
import { getFormCatalog } from '../config/catalog.js';
import { unprocessable } from '../lib/http-error.js';

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
export function createAdminRouter({ userRepository, zohoConfig }) {
  const router = Router();
  router.use(requireRole(ROLE.ADMINISTRATOR));

  router.get(
    '/catalog',
    asyncHandler(async (_req, res) => {
      res.json(getFormCatalog());
    }),
  );

  router.get(
    '/zoho-integration',
    asyncHandler(async (_req, res) => {
      res.json({
        mode: zohoConfig.ZOHO_MODE,
        dataCenter: zohoConfig.ZOHO_DC,
        organizationConfigured: Boolean(zohoConfig.ZOHO_ORG_ID),
      });
    }),
  );

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
      if (![ROLE.AUDITOR, ROLE.ADMINISTRATOR].includes(role)) errors.role = 'Select a valid role.';
      if (Object.keys(errors).length) throw unprocessable('Please correct the highlighted fields.', errors);

      const user = await userRepository.create({ name, email, password, role });
      res.status(201).json(userRepository.toPublicUser(user));
    }),
  );

  return router;
}
