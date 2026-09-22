import { STATUS } from '../domain/statuses.js';
import { conflict } from '../lib/http-error.js';

/**
 * Provisioning engine (PRD sections 12 "Provisioning Sequence" and 15
 * "Provisioning Failures").
 *
 * Each provisioning run executes a fixed, ordered list of steps. Every
 * step's outcome (SUCCESS / FAILED, with error detail) is recorded on the
 * request BEFORE moving to the next step, so a crash or failure mid-run
 * leaves an accurate, resumable record rather than an ambiguous state.
 *
 * Retry semantics (the PRD's hard requirement, section 15): retrying a
 * PARTIALLY_PROVISIONED or PROVISIONING_FAILED request re-runs only the
 * steps that have not already succeeded. `create_user` is treated
 * specially — if it already recorded success (a zohoUserId exists on the
 * request), it is SKIPPED rather than re-executed, so a retry can never
 * mint a second Zoho account for the same request.
 */

function buildStepPlan(requestType) {
  const base = [
    { name: 'validate_employee', label: 'Employee validated' },
    { name: 'check_email_availability', label: 'Email availability checked' },
  ];

  if (requestType === 'LEAVING_COMPANY') {
    return [
      ...base,
      { name: 'deactivate_user', label: 'Zoho account deactivated' },
      { name: 'verify_configuration', label: 'Deactivation verified' },
    ];
  }

  // NEW_HIRE and UPDATE_EMPLOYEE_INFO both provision/refresh a full account.
  return [
    ...base,
    { name: 'create_user', label: 'Zoho user created' },
    { name: 'enable_mail', label: 'Zoho Mail enabled' },
    ...(requestType === 'UPDATE_EMPLOYEE_INFO' ? [] : []),
    { name: 'assign_groups', label: 'Groups assigned' },
    { name: 'verify_configuration', label: 'Account configuration verified' },
  ];
}

function findStepResult(request, stepName) {
  return request.provisioning.steps.find((step) => step.name === stepName);
}

function stepSucceeded(request, stepName) {
  return findStepResult(request, stepName)?.outcome === 'SUCCESS';
}

export function createProvisioningService({ requestRepository, zohoClient, checkEmailAvailability }) {
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
      case 'enable_mail':
        return zohoClient.enableMail({ resolvedAccount, zohoUserId: getZohoUserId(request) });
      case 'assign_groups': {
        const alreadyAssigned = new Set(findStepResult(request, 'assign_groups')?.output?.assignedGroups ?? []);
        const assignedGroups = [...alreadyAssigned];
        for (const group of resolvedAccount.groups) {
          if (alreadyAssigned.has(group)) continue;
          await zohoClient.assignGroup({ resolvedAccount, zohoUserId: getZohoUserId(request), group });
          assignedGroups.push(group);
          // Persist progress after each individual group so a failure on
          // group 3 of 4 does not force groups 1-2 to be reassigned.
          await recordStep(request.id, { name: 'assign_groups', outcome: 'SUCCESS', output: { assignedGroups }, at: new Date().toISOString() });
        }
        return { assignedGroups };
      }
      case 'verify_configuration':
        return zohoClient.verifyConfiguration({ resolvedAccount, zohoUserId: getZohoUserId(request) });
      case 'deactivate_user':
        return zohoClient.deactivateUser({ resolvedAccount, zohoUserId: getZohoUserId(request) });
      default:
        throw new Error(`Unknown provisioning step: ${step.name}`);
    }
  }

  function getZohoUserId(request) {
    return findStepResult(request, 'create_user')?.output?.zohoUserId;
  }

  async function run(requestId) {
    let request = await requestRepository.getById(requestId);

    if (request.status === STATUS.COMPLETED) {
      throw conflict('This request has already completed provisioning.');
    }
    if (!request.resolvedAccount) {
      throw conflict('An auditor must approve an account configuration before provisioning can start.');
    }

    const plan = buildStepPlan(request.submission.requestType);
    const startedAt = request.provisioning.startedAt ?? new Date().toISOString();

    request = await requestRepository.applyUpdate(requestId, (entry) => ({
      ...entry,
      status: STATUS.PROVISIONING,
      provisioning: { ...entry.provisioning, startedAt, failureReason: null },
      auditTrail: [...entry.auditTrail, { at: new Date().toISOString(), actorId: null, actorType: 'SYSTEM', action: 'PROVISIONING_STARTED', detail: 'Zoho provisioning initiated.' }],
    }));

    let failure = null;

    for (const step of plan) {
      if (stepSucceeded(request, step.name)) continue; // resume: skip already-successful steps

      try {
        const output = await runStep(request, step);
        await recordStep(requestId, { name: step.name, label: step.label, outcome: 'SUCCESS', output, at: new Date().toISOString() });
        request = await requestRepository.getById(requestId);
        request = await requestRepository.appendAuditEvent(requestId, {
          actorId: null,
          actorType: 'SYSTEM',
          action: `PROVISIONING_STEP_${step.name.toUpperCase()}`,
          detail: step.label,
        });
      } catch (error) {
        // Preserve any partial progress already persisted for this step
        // (e.g. assign_groups records which groups succeeded before the
        // failing one) instead of discarding it. A step like assign_groups
        // persists its own incremental progress to the store as it goes
        // (see runStep's 'assign_groups' case), so re-fetch the freshest
        // copy from the repository rather than relying on the `request`
        // variable, which was only last refreshed before this step began.
        const latestBeforeFailure = await requestRepository.getById(requestId);
        const partialOutput = findStepResult(latestBeforeFailure, step.name)?.output;
        await recordStep(requestId, {
          name: step.name,
          label: step.label,
          outcome: 'FAILED',
          error: error.message,
          ...(partialOutput ? { output: partialOutput } : {}),
          at: new Date().toISOString(),
        });
        request = await requestRepository.getById(requestId);
        request = await requestRepository.appendAuditEvent(requestId, {
          actorId: null,
          actorType: 'SYSTEM',
          action: `PROVISIONING_STEP_FAILED`,
          detail: `${step.label} failed: ${error.message}`,
        });
        failure = { step: step.name, message: error.message };
        break;
      }
    }

    const allStepsSucceeded = plan.every((step) => stepSucceeded(request, step.name));
    const anyStepSucceeded = plan.some((step) => stepSucceeded(request, step.name));

    const finalStatus = failure
      ? (anyStepSucceeded ? STATUS.PARTIALLY_PROVISIONED : STATUS.PROVISIONING_FAILED)
      : STATUS.ACCOUNT_CREATED;

    request = await requestRepository.applyUpdate(requestId, (entry) => ({
      ...entry,
      status: allStepsSucceeded ? STATUS.ACCOUNT_CREATED : finalStatus,
      provisioning: {
        ...entry.provisioning,
        completedAt: allStepsSucceeded ? new Date().toISOString() : null,
        failureReason: failure ? `${failure.step}: ${failure.message}` : null,
      },
    }));

    return { request, failure, allStepsSucceeded };
  }

  return { run, buildStepPlan };
}
