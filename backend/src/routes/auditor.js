import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { requireRole } from '../middleware/auth.js';
import { ROLE } from '../domain/users.js';
import { STATUS } from '../domain/statuses.js';
import { badRequest, unprocessable } from '../lib/http-error.js';
import { validateEmployeeInfoEdit, hasErrors } from '../domain/validation.js';
import { ACCOUNT_TYPE, includesInsideMaps, isAccountType } from '../domain/account-types.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strips one-time mailbox passwords from anything sent to the browser. */
function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'temporaryPassword')
        .map(([key, inner]) => [key, redactSecrets(inner)]),
    );
  }
  return value;
}

/**
 * Authenticated Auditor/Administrator routes (PRD sections 8-15, 17).
 * Every route here requires an authenticated session with AUDITOR or
 * ADMINISTRATOR role.
 */
export function createAuditorRouter({ requestRepository, provisioningService, notificationService }) {
  const router = Router();
  router.use(requireRole(ROLE.AUDITOR, ROLE.ADMINISTRATOR));
  router.use((_req, res, next) => {
    const json = res.json.bind(res);
    res.json = (body) => json(redactSecrets(body));
    next();
  });

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
      const { corporateEmail, insideMapsRoles, accountType = ACCOUNT_TYPE.ZOHO } = req.body ?? {};
      const errors = {};
      if (!isAccountType(accountType)) errors.accountType = 'Choose a valid account type.';
      if (!String(corporateEmail ?? '').trim()) errors.corporateEmail = 'Corporate email is required.';
      else if (!EMAIL_PATTERN.test(corporateEmail)) errors.corporateEmail = 'Enter a valid email address.';
      if (includesInsideMaps(accountType)) {
        const roles = Array.isArray(insideMapsRoles) ? insideMapsRoles.filter((r) => String(r).trim()) : [];
        if (roles.length === 0) errors.insideMapsRoles = 'Add at least one InsideMaps role.';
      }
      if (Object.keys(errors).length) throw unprocessable('Please correct the account configuration.', errors);

      const updated = await requestRepository.saveResolvedAccount(req.params.id, {
        actorId: req.user.id,
        corporateEmail,
        insideMapsRoles,
        accountType,
      });
      res.json(updated);
    }),
  );

  router.post(
    '/requests/:id/quick-approve',
    asyncHandler(async (req, res) => {
      const existing = await requestRepository.getById(req.params.id);
      if (existing.proposedAccount?.needsReview) {
        throw unprocessable('This request requires manual rule review before approving.');
      }
      const proposal = existing.proposedAccount;
      const updated = await requestRepository.saveResolvedAccount(req.params.id, {
        actorId: req.user.id,
        corporateEmail: proposal.corporateEmail,
        insideMapsRoles: proposal.insideMapsRoles ?? [],
        accountType: proposal.accountType ?? ACCOUNT_TYPE.ZOHO,
      });
      res.json(updated);
    }),
  );

  router.post(
    '/requests/:id/escalate',
    asyncHandler(async (req, res) => {
      const { note } = req.body ?? {};
      const updated = await requestRepository.applyUpdate(req.params.id, (entry) => ({
        ...entry,
        auditTrail: [
          ...entry.auditTrail,
          {
            at: new Date().toISOString(),
            actorId: req.user.id,
            actorType: 'AUDITOR',
            system: 'PORTAL',
            action: 'REQUEST_ESCALATED',
            result: 'ESCALATED',
            detail: note ? `Escalated: ${note}` : 'Request escalated for priority administrator review.',
          },
        ],
      }));
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

  router.get(
    '/employees/directory',
    asyncHandler(async (_req, res) => {
      res.json(await requestRepository.listEmployeeMasterDirectory());
    }),
  );

  // Lets an auditor find an existing employee by work/personal email to
  // start offboarding without first opening their request page. Excludes
  // employees who are already leaving/left, and anyone with no recorded
  // corporate account (nothing to offboard).
  router.get(
    '/employees',
    asyncHandler(async (req, res) => {
      const results = await requestRepository.searchEmployeeDirectory(req.query.query);
      res.json(results.filter((entry) => entry.requestType !== 'LEAVING_COMPANY' && entry.corporateEmail));
    }),
  );

  router.post(
    '/requests/:id/offboard',
    asyncHandler(async (req, res) => {
      const { effectiveLeaveDate, effectiveLeaveTimezone, leavingReason } = req.body ?? {};
      const created = await requestRepository.initiateOffboarding(req.params.id, {
        actorId: req.user.id,
        actorEmail: req.user.email,
        effectiveLeaveDate,
        effectiveLeaveTimezone,
        leavingReason,
      });
      if (created.status === STATUS.SCHEDULED_OFFBOARDING) {
        res.status(201).json(created);
        return;
      }
      const { request } = await provisioningService.run(created.id);
      res.status(201).json(request);
    }),
  );

  router.post(
    '/offboarding/run-due',
    asyncHandler(async (req, res) => {
      const asOfIso = req.body?.asOfIso ?? new Date().toISOString();
      const results = await provisioningService.runDueOffboardings(asOfIso);
      res.json({ processed: results.length, results });
    }),
  );

  router.post(
    '/requests/batch-provision',
    asyncHandler(async (req, res) => {
      const { requestIds } = req.body ?? {};
      if (!Array.isArray(requestIds) || requestIds.length === 0) {
        throw badRequest('Select at least one request to process.');
      }
      const results = await provisioningService.runBatch(requestIds);
      res.json({ processed: results.length, results });
    }),
  );

  router.get(
    '/audit-log',
    asyncHandler(async (req, res) => {
      const entries = await requestRepository.listSystemAuditLog({
        query: req.query.query,
        actorType: req.query.actorType,
        action: req.query.action,
        system: req.query.system,
      });
      if (req.query.format === 'csv') {
        const header = 'Timestamp,Request ID,Employee,Actor Type,Actor ID,System,Action,Result,Detail\n';
        const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
        const rows = entries
          .map((e) => [e.at, e.requestCode, e.employeeName, e.actorType, e.actorId ?? '', e.system, e.action, e.result, e.detail].map(escapeCsv).join(','))
          .join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="insideops-audit-log.csv"');
        res.send(header + rows);
        return;
      }
      res.json(entries);
    }),
  );

  router.get(
    '/requests/:id/notification-preview',
    asyncHandler(async (req, res) => {
      res.json(await notificationService.preview(req.params.id));
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

  // PRD section 16: Auditor sends a request back to HR to fix, with a
  // required reason. HR resubmission is tracked separately (section 7,
  // still a gap) — this endpoint only records the return itself.
  router.post(
    '/requests/:id/return',
    asyncHandler(async (req, res) => {
      const { reason } = req.body ?? {};
      const trimmedReason = String(reason ?? '').trim();
      if (!trimmedReason) throw badRequest('A reason is required to return a request to HR.');

      const existing = await requestRepository.getById(req.params.id);
      if (existing.status !== STATUS.PENDING_REVIEW && existing.status !== STATUS.APPROVED) {
        throw badRequest('Only a request awaiting review or approval can be returned to HR.');
      }

      const updated = await requestRepository.applyUpdate(req.params.id, (entry) => ({
        ...entry,
        status: STATUS.RETURNED,
        auditTrail: [
          ...entry.auditTrail,
          { at: new Date().toISOString(), actorId: req.user.id, actorType: 'AUDITOR', action: 'REQUEST_RETURNED', detail: `Returned to HR: ${trimmedReason}` },
        ],
      }));
      res.json(updated);
    }),
  );

  // PRD section 16: withdraw a request before completion (including failed/partially provisioned or scheduled).
  router.post(
    '/requests/:id/cancel',
    asyncHandler(async (req, res) => {
      const { reason } = req.body ?? {};
      const existing = await requestRepository.getById(req.params.id);
      const cancellable = new Set([
        STATUS.PENDING_REVIEW,
        STATUS.APPROVED,
        STATUS.PROVISIONING_FAILED,
        STATUS.PARTIALLY_PROVISIONED,
        STATUS.SCHEDULED_OFFBOARDING,
        STATUS.RETURNED,
      ]);
      if (!cancellable.has(existing.status)) {
        throw badRequest('Only an active, scheduled, or failed request can be cancelled.');
      }

      const updated = await requestRepository.applyUpdate(req.params.id, (entry) => ({
        ...entry,
        status: STATUS.CANCELLED,
        auditTrail: [
          ...entry.auditTrail,
          {
            at: new Date().toISOString(),
            actorId: req.user.id,
            actorType: 'AUDITOR',
            system: 'PORTAL',
            action: 'REQUEST_CANCELLED',
            result: 'CANCELLED',
            detail: reason ? `Cancelled: ${reason}` : 'Request cancelled.',
          },
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
