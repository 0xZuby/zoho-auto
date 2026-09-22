import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { getFormCatalog } from '../config/catalog.js';
import { validateOnboardingSubmission, validateEmployeeInfoEdit, hasErrors } from '../domain/validation.js';
import { unprocessable } from '../lib/http-error.js';
import { requireRole } from '../middleware/auth.js';
import { ROLE } from '../domain/users.js';

/**
 * HR-authenticated routes backing the request form (New hire, Leaving
 * company, Update employee info). HR must sign in first; every route here
 * requires an HR or Administrator session.
 */
export function createFormRouter({ requestRepository }) {
  const router = Router();
  router.use(requireRole(ROLE.HR, ROLE.ADMINISTRATOR));

  router.get(
    '/catalog',
    asyncHandler(async (_req, res) => {
      res.json(getFormCatalog());
    }),
  );

  router.post(
    '/submit',
    asyncHandler(async (req, res) => {
      const errors = validateOnboardingSubmission(req.body ?? {});
      if (hasErrors(errors)) throw unprocessable('Please correct the highlighted fields.', errors);

      const request = await requestRepository.create(req.body ?? {}, {
        actorId: req.user.id,
        actorType: 'HR',
        action: 'FORM_SUBMITTED',
        initialAuditDetail: `Onboarding form submitted by ${req.user.name}.`,
      });
      res.status(201).json({ requestCode: request.requestCode, submittedAt: request.submittedAt });
    }),
  );

  // Employee directory: lets HR find an existing employee by private or
  // work email before starting an offboarding or an information update.
  router.get(
    '/employees',
    asyncHandler(async (req, res) => {
      const results = await requestRepository.searchEmployeeDirectory(req.query.query);
      res.json(results);
    }),
  );

  router.get(
    '/employees/:id',
    asyncHandler(async (req, res) => {
      res.json(await requestRepository.getEmployeeSubmission(req.params.id));
    }),
  );

  // HR applies the edit immediately ("Get all information > updates
  // information and done") — no auditor approval gate, unlike New hire and
  // Leaving company. Every change still lands in the audit trail.
  router.put(
    '/employees/:id',
    asyncHandler(async (req, res) => {
      const errors = validateEmployeeInfoEdit(req.body ?? {});
      if (hasErrors(errors)) throw unprocessable('Please correct the highlighted fields.', errors);

      const updated = await requestRepository.updateSubmission(req.params.id, {
        actorId: req.user.id,
        actorType: 'HR',
        actorLabel: req.user.name,
        patch: req.body ?? {},
      });
      res.json(await requestRepository.getEmployeeSubmission(updated.id));
    }),
  );

  // HR selects an existing employee to offboard; this sends the request to
  // the auditor queue for review, same as an auditor-initiated offboarding.
  router.post(
    '/employees/:id/offboard',
    asyncHandler(async (req, res) => {
      const created = await requestRepository.initiateOffboarding(req.params.id, {
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorType: 'HR',
        actorLabel: req.user.name,
      });
      res.status(201).json({ requestCode: created.requestCode, submittedAt: created.submittedAt });
    }),
  );

  return router;
}
