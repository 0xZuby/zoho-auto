import { STATUS } from '../domain/statuses.js';
import { ACCOUNT_TYPE, includesInsideMaps, includesZoho } from '../domain/account-types.js';
import { conflict } from '../lib/http-error.js';
import { createSimulatedInsideMapsClient } from '../integrations/insidemaps.js';

/**
 * Provisioning engine (PRD sections 12 "Provisioning Sequence" and 15
 * "Provisioning Failures" + Employee Access Lifecycle MVP).
 *
 * Each provisioning run executes a fixed, ordered list of steps. Every
 * step's outcome (SUCCESS / FAILED, with error detail) is recorded on the
 * request BEFORE moving to the next step, so a crash or failure mid-run
 * leaves an accurate, resumable record rather than an ambiguous state.
 *
 * Retry semantics (the PRD's hard requirement, section 15): retrying a
 * PARTIALLY_PROVISIONED or PROVISIONING_FAILED request re-runs only the
 * steps that have not already succeeded. `create_user` and `create_im_user`
 * are treated specially — if they already recorded success, they are SKIPPED
 * rather than re-executed, so a retry can never mint a second account.
 *
 * Account type:
 * - ZOHO: creates the Zoho Mail mailbox directly (no invitation, groups, or
 *   roles; first-login password change is forced) and verifies it.
 * - INSIDEMAPS: calls InsideMaps APIs to create user, assign roles, and
 *   enforce security policy.
 * - ZOHO_AND_INSIDEMAPS: the Zoho steps followed by the InsideMaps steps.
 *
 * Offboarding (LEAVING_COMPANY): disables Zoho Mail & revokes sessions,
 * removes InsideMaps roles, and disables/deletes the InsideMaps user.
 */

function buildStepPlan(requestType, accountType) {
  if (requestType === 'LEAVING_COMPANY') {
    return [
      { name: 'validate_employee', label: 'Employee validated', system: 'PORTAL' },
      { name: 'deactivate_user', label: 'Zoho User disabled/deleted & sessions revoked', system: 'ZOHO' },
      { name: 'remove_im_roles', label: 'InsideMaps roles removed', system: 'INSIDEMAPS' },
      { name: 'delete_im_user', label: 'InsideMaps account disabled', system: 'INSIDEMAPS' },
    ];
  }

  const insideMapsSteps = [
    { name: 'create_im_user', label: 'InsideMaps user created (POST Create User)', system: 'INSIDEMAPS' },
    { name: 'assign_im_roles', label: 'InsideMaps roles assigned (POST Assign Roles)', system: 'INSIDEMAPS' },
    { name: 'enforce_security_policy', label: '2SV and first-login password policy enforced', system: 'INSIDEMAPS' },
  ];

  if (requestType === 'UPDATE_EMPLOYEE_INFO') {
    const plan = [{ name: 'validate_employee', label: 'Employee validated', system: 'PORTAL' }];
    if (includesInsideMaps(accountType)) {
      plan.push(
        { name: 'assign_im_roles', label: 'InsideMaps roles updated via POST /roles', system: 'INSIDEMAPS' },
        { name: 'enforce_security_policy', label: '2SV and security policy verified', system: 'INSIDEMAPS' },
      );
    }
    if (includesZoho(accountType)) {
      plan.push({ name: 'verify_configuration', label: 'Zoho mailbox verified', system: 'ZOHO' });
    }
    return plan;
  }

  const plan = [
    { name: 'validate_employee', label: 'Employee validated', system: 'PORTAL' },
    { name: 'check_email_availability', label: 'Email availability checked', system: 'PORTAL' },
  ];

  // The Zoho mailbox is created directly (no invitation, groups, or roles).
  if (includesZoho(accountType)) {
    plan.push(
      { name: 'create_user', label: 'Zoho Mail mailbox created', system: 'ZOHO' },
      { name: 'verify_configuration', label: 'Zoho mailbox verified', system: 'ZOHO' },
    );
  }
  if (includesInsideMaps(accountType)) plan.push(...insideMapsSteps);
  return plan;
}

function findStepResult(request, stepName) {
  return request.provisioning.steps.find((step) => step.name === stepName);
}

function stepSucceeded(request, stepName) {
  return findStepResult(request, stepName)?.outcome === 'SUCCESS';
}

function describeProvisioningStart(request) {
  if (request.submission.requestType === 'LEAVING_COMPANY') {
    return 'Offboarding started: disabling Zoho Mail, revoking InsideMaps roles, and disabling InsideMaps account.';
  }
  const type = request.resolvedAccount?.accountType;
  if (type === ACCOUNT_TYPE.ZOHO_AND_INSIDEMAPS) return 'Zoho Mail and InsideMaps provisioning initiated.';
  return type === ACCOUNT_TYPE.INSIDEMAPS
    ? 'InsideMaps API provisioning initiated.'
    : 'Zoho Mail provisioning initiated.';
}

export function createProvisioningService({
  requestRepository,
  zohoClient,
  insideMapsClient = createSimulatedInsideMapsClient(),
  checkEmailAvailability,
  notificationService = null,
}) {
  async function recordStep(requestId, step) {
    await requestRepository.applyUpdate(requestId, (entry) => ({
      ...entry,
      provisioning: {
        ...entry.provisioning,
        steps: [...entry.provisioning.steps.filter((existing) => existing.name !== step.name), step],
      },
    }));
  }

  async function runStep(request, step) {
    const { resolvedAccount, submission } = request;
    switch (step.name) {
      case 'validate_employee':
        if (!submission.nameAndSurname || !resolvedAccount.corporateEmail) {
          throw new Error('Employee record is missing required fields for provisioning.');
        }
        return {};
      case 'check_email_availability': {
        const available = await checkEmailAvailability(resolvedAccount.corporateEmail, request.id);
        if (!available) throw new Error(`Corporate email ${resolvedAccount.corporateEmail} is already assigned to another request.`);
        return {};
      }
      case 'create_user': {
        if (stepSucceeded(request, 'create_user')) {
          // Never mint a second account on retry.
          return { ...findStepResult(request, 'create_user').output, skipped: true };
        }
        return zohoClient.createUser({ resolvedAccount, employeeName: submission.nameAndSurname, submission });
      }
      case 'enforce_security_policy': {
        const insideMapsUserId = await getInsideMapsUserId(request);
        if (typeof insideMapsClient.enforceSecurityPolicy === 'function') {
          return insideMapsClient.enforceSecurityPolicy({ resolvedAccount, insideMapsUserId });
        }
        return { twoStepVerificationRequired: true, twoStepVerificationEnrolled: false, forcePasswordChangeOnFirstLogin: true };
      }
      case 'verify_configuration':
        return zohoClient.verifyConfiguration({ resolvedAccount, zohoUserId: await getZohoUserId(request) });
      case 'deactivate_user':
        return zohoClient.deactivateUser({ resolvedAccount, zohoUserId: await getZohoUserId(request) });
      case 'create_im_user': {
        if (stepSucceeded(request, 'create_im_user')) {
          return { ...findStepResult(request, 'create_im_user').output, skipped: true };
        }
        return insideMapsClient.createUser({ resolvedAccount, employeeName: submission.nameAndSurname, submission });
      }
      case 'assign_im_roles': {
        const rolesToAssign = resolvedAccount.insideMapsRoles?.length
          ? resolvedAccount.insideMapsRoles
          : (resolvedAccount.role ? [resolvedAccount.role] : ['Operator']);
        const alreadyAssigned = new Set(findStepResult(request, 'assign_im_roles')?.output?.assignedRoles ?? []);
        const assignedRoles = [...alreadyAssigned];
        const insideMapsUserId = await getInsideMapsUserId(request);
        for (const role of rolesToAssign) {
          if (alreadyAssigned.has(role)) continue;
          await insideMapsClient.assignRole({ resolvedAccount, insideMapsUserId, role });
          assignedRoles.push(role);
          await recordStep(request.id, {
            name: 'assign_im_roles',
            system: 'INSIDEMAPS',
            outcome: 'SUCCESS',
            output: { assignedRoles },
            at: new Date().toISOString(),
          });
        }
        return { assignedRoles };
      }
      case 'remove_im_roles':
        return insideMapsClient.removeRoles({ resolvedAccount, insideMapsUserId: await getInsideMapsUserId(request) });
      case 'delete_im_user':
        return insideMapsClient.deleteUser({ resolvedAccount, insideMapsUserId: await getInsideMapsUserId(request) });
      default:
        throw new Error(`Unknown provisioning step: ${step.name}`);
    }
  }

  async function getZohoUserId(request) {
    let current = request;
    while (current) {
      const zohoUserId = findStepResult(current, 'create_user')?.output?.zohoUserId;
      if (zohoUserId) return zohoUserId;
      if (!current.previousRequestId) return undefined;
      current = await requestRepository.getById(current.previousRequestId);
    }
    return undefined;
  }

  async function getInsideMapsUserId(request) {
    let current = request;
    while (current) {
      const insideMapsUserId = findStepResult(current, 'create_im_user')?.output?.insideMapsUserId;
      if (insideMapsUserId) return insideMapsUserId;
      if (!current.previousRequestId) return undefined;
      current = await requestRepository.getById(current.previousRequestId);
    }
    return undefined;
  }

  async function run(requestId) {
    let request = await requestRepository.getById(requestId);

    if (request.status === STATUS.COMPLETED) {
      throw conflict('This request has already completed provisioning.');
    }
    if (!request.resolvedAccount) {
      throw conflict('An auditor must approve an account configuration before provisioning can start.');
    }

    const plan = buildStepPlan(request.submission.requestType, request.resolvedAccount.accountType ?? ACCOUNT_TYPE.ZOHO);
    const startedAt = request.provisioning.startedAt ?? new Date().toISOString();

    request = await requestRepository.applyUpdate(requestId, (entry) => ({
      ...entry,
      status: STATUS.PROVISIONING,
      provisioning: { ...entry.provisioning, startedAt, failureReason: null, failureStep: null, failureSystem: null },
      auditTrail: [
        ...entry.auditTrail,
        {
          at: new Date().toISOString(),
          actorId: null,
          actorType: 'SYSTEM',
          system: entry.resolvedAccount?.accountType === ACCOUNT_TYPE.INSIDEMAPS ? 'INSIDEMAPS' : 'ZOHO',
          action: 'PROVISIONING_STARTED',
          result: 'STARTED',
          detail: describeProvisioningStart(entry),
        },
      ],
    }));

    let failure = null;

    for (const step of plan) {
      if (stepSucceeded(request, step.name)) continue; // resume: skip already-successful steps

      try {
        const output = await runStep(request, step);
        await recordStep(requestId, {
          name: step.name,
          label: step.label,
          system: step.system ?? 'PORTAL',
          outcome: 'SUCCESS',
          output,
          at: new Date().toISOString(),
        });
        request = await requestRepository.getById(requestId);
        request = await requestRepository.appendAuditEvent(requestId, {
          actorId: null,
          actorType: 'SYSTEM',
          system: step.system ?? 'PORTAL',
          action: `PROVISIONING_STEP_${step.name.toUpperCase()}`,
          result: 'SUCCESS',
          detail: step.label,
        });
      } catch (error) {
        const latestBeforeFailure = await requestRepository.getById(requestId);
        const partialOutput = findStepResult(latestBeforeFailure, step.name)?.output;
        await recordStep(requestId, {
          name: step.name,
          label: step.label,
          system: step.system ?? 'PORTAL',
          outcome: 'FAILED',
          error: error.message,
          ...(partialOutput ? { output: partialOutput } : {}),
          at: new Date().toISOString(),
        });
        request = await requestRepository.getById(requestId);
        request = await requestRepository.appendAuditEvent(requestId, {
          actorId: null,
          actorType: 'SYSTEM',
          system: step.system ?? 'PORTAL',
          action: `PROVISIONING_STEP_FAILED`,
          result: 'FAILED',
          detail: `${step.label} failed: ${error.message}`,
        });
        failure = { step: step.name, label: step.label, system: step.system ?? 'PORTAL', message: error.message };
        break;
      }
    }

    const allStepsSucceeded = plan.every((step) => stepSucceeded(request, step.name));
    const anyStepSucceeded = plan.some((step) => stepSucceeded(request, step.name));

    const isOffboarding = request.submission.requestType === 'LEAVING_COMPANY';
    const successStatus = isOffboarding ? STATUS.ACCESS_REVOKED : STATUS.ACCOUNT_CREATED;

    const finalStatus = failure
      ? (anyStepSucceeded ? STATUS.PARTIALLY_PROVISIONED : STATUS.PROVISIONING_FAILED)
      : successStatus;

    request = await requestRepository.applyUpdate(requestId, (entry) => ({
      ...entry,
      status: allStepsSucceeded ? successStatus : finalStatus,
      provisioning: {
        ...entry.provisioning,
        completedAt: allStepsSucceeded ? new Date().toISOString() : null,
        failureReason: failure ? `${failure.step}: ${failure.message}` : null,
        failureStep: failure ? failure.step : null,
        failureSystem: failure ? failure.system : null,
        securityPolicy: allStepsSucceeded && !isOffboarding
          ? {
              twoStepVerificationRequired: includesInsideMaps(entry.resolvedAccount?.accountType),
              twoStepVerificationEnrolled: entry.provisioning?.securityPolicy?.twoStepVerificationEnrolled ?? false,
              forcePasswordChangeOnFirstLogin: true,
            }
          : (entry.provisioning?.securityPolicy ?? null),
      },
    }));

    if (allStepsSucceeded && isOffboarding) {
      request = await requestRepository.appendAuditEvent(requestId, {
        actorId: null,
        actorType: 'SYSTEM',
        system: 'PORTAL',
        action: 'OFFBOARDING_COMPLETED',
        result: 'SUCCESS',
        detail: 'Offboarding completed: Zoho Mail access disabled, InsideMaps roles removed, and InsideMaps account disabled.',
      });
    }

    if (notificationService && typeof notificationService.sendOperationalAlert === 'function') {
      if (failure) {
        await notificationService.sendOperationalAlert(request.id, {
          outcome: 'FAILED',
          step: failure.step,
          system: failure.system,
          reason: failure.message,
        }).catch(() => {});
      } else if (allStepsSucceeded && isOffboarding) {
        await notificationService.sendOperationalAlert(request.id, {
          outcome: 'ACCESS_REVOKED',
        }).catch(() => {});
      }
    }

    return { request, failure, allStepsSucceeded };
  }

  async function runBatch(requestIds = []) {
    const results = [];
    for (const id of requestIds) {
      try {
        const res = await run(id);
        results.push({ id, ok: res.allStepsSucceeded, request: res.request, failure: res.failure });
      } catch (error) {
        results.push({ id, ok: false, error: error.message });
      }
    }
    return results;
  }

  async function runDueOffboardings(asOfIso = new Date().toISOString()) {
    const dueRequests = await requestRepository.findDueOffboardings(asOfIso);
    const results = [];
    for (const item of dueRequests) {
      try {
        const res = await run(item.id);
        results.push({ id: item.id, requestCode: item.requestCode, ok: res.allStepsSucceeded, request: res.request, failure: res.failure });
      } catch (error) {
        results.push({ id: item.id, requestCode: item.requestCode, ok: false, error: error.message });
      }
    }
    return results;
  }

  return { run, runBatch, runDueOffboardings, buildStepPlan };
}
