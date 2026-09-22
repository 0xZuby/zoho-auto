import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { requireRole } from '../middleware/auth.js';
import { ROLE } from '../domain/users.js';
import { STATUS } from '../domain/statuses.js';
import { badRequest, unprocessable } from '../lib/http-error.js';
import { validateEmployeeInfoEdit, hasErrors } from '../domain/validation.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Authenticated Auditor/Administrator routes (PRD sections 8-15, 17).
 * Every route here requires an authenticated session with AUDITOR or
 * ADMINISTRATOR role.
 */
export function createAuditorRouter({ requestRepository, provisioningService, notificationService }) {
  const router = Router();
  router.use(requireRole(ROLE.AUDITOR, ROLE.ADMINISTRATOR));

  router.get(
    '/metrics',
    asyncHandler(async (_req, res) => {
      res.json(await requestRepository.getMetrics());
    }),
  );

  router.get(
    '/requests',
    asyncHandler(async (_req, res) => {
      res.json(await requestRepository.listSummaries());
    }),
  );

  router.get(
    '/requests/:id',
    asyncHandler(async (req, res) => {
      res.json(await requestRepository.getById(req.params.id));
    }),
  );

  router.put(
    '/requests/:id/account',
    asyncHandler(async (req, res) => {
      const { corporateEmail, role, groups } = req.body ?? {};
      const errors = {};
      if (!String(corporateEmail ?? '').trim()) errors.corporateEmail = 'Corporate email is required.';
      else if (!EMAIL_PATTERN.test(corporateEmail)) errors.corporateEmail = 'Enter a valid email address.';
      if (!String(role ?? '').trim()) errors.role = 'Role is required.';
      if (!Array.isArray(groups) || groups.length === 0) errors.groups = 'At least one group must be assigned.';
      if (Object.keys(errors).length) throw unprocessable('Please correct the account configuration.', errors);

      const updated = await requestRepository.saveResolvedAccount(req.params.id, {
        actorId: req.user.id,
        corporateEmail,
        role,
        groups,
      });
      res.json(updated);
    }),
  );

  router.put(
    '/requests/:id/submission',
    asyncHandler(async (req, res) => {
      const errors = validateEmployeeInfoEdit(req.body ?? {});
      if (hasErrors(errors)) throw unprocessable('Please correct the highlighted fields.', errors);

      const updated = await requestRepository.updateSubmission(req.params.id, {
        actorId: req.user.id,
        patch: req.body ?? {},
      });
      res.json(updated);
    }),
  );

  router.post(
    '/requests/:id/offboard',
    asyncHandler(async (req, res) => {
      const created = await requestRepository.initiateOffboarding(req.params.id, {
        actorId: req.user.id,
        actorEmail: req.user.email,
      });
      res.status(201).json(created);
    }),
  );

  router.post(
    '/requests/:id/reject',
    asyncHandler(async (req, res) => {
      const { reason } = req.body ?? {};
      const updated = await requestRepository.applyUpdate(req.params.id, (entry) => ({
        ...entry,
        status: STATUS.REJECTED,
        auditTrail: [
          ...entry.auditTrail,
          { at: new Date().toISOString(), actorId: req.user.id, actorType: 'AUDITOR', action: 'REQUEST_REJECTED', detail: reason ? `Rejected: ${reason}` : 'Request rejected.' },
        ],
      }));
      res.json(updated);
    }),
  );

  router.post(
    '/requests/:id/provision',
    asyncHandler(async (req, res) => {
      const { request, failure, allStepsSucceeded } = await provisioningService.run(req.params.id);
      res.json({ request, failure, allStepsSucceeded });
    }),
  );

  router.post(
    '/requests/:id/retry',
    asyncHandler(async (req, res) => {
      const existing = await requestRepository.getById(req.params.id);
      if (existing.status !== STATUS.PARTIALLY_PROVISIONED && existing.status !== STATUS.PROVISIONING_FAILED) {
        throw badRequest('Only a partially provisioned or failed request can be retried.');
      }
      const { request, failure, allStepsSucceeded } = await provisioningService.run(req.params.id);
      res.json({ request, failure, allStepsSucceeded });
    }),
  );

  router.post(
    '/requests/:id/notify',
    asyncHandler(async (req, res) => {
      const updated = await notificationService.send(req.params.id, { actorId: req.user.id, isResend: false });
      res.json(updated);
    }),
  );

  router.post(
    '/requests/:id/resend-notification',
    asyncHandler(async (req, res) => {
      const updated = await notificationService.send(req.params.id, { actorId: req.user.id, isResend: true });
      res.json(updated);
    }),
  );

  return router;
}
