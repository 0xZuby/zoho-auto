import { STATUS } from '../domain/statuses.js';
import { ACCOUNT_TYPE } from '../domain/account-types.js';
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
 *
 * Account type (PRD follow-up): a resolved account is either a Zoho
 * account (the flow above) or an InsideMaps account, where the employee
 * signs up on the InsideMaps website themselves. There is no InsideMaps
 * API yet, so that plan is a single step that just records the request —
 * see `runStep`'s 'request_insidemaps_access' / 'revoke_insidemaps_access'
 * cases, which are the only things that need to change once that API
 * exists.
 *
 * Offboarding (LEAVING_COMPANY) is the one exception to the account-type
 * branching above: an auditor offboarding an employee doesn't choose an
 * account type, because pressing "Offboard" always disables BOTH possible
 * access paths in one action — the employee's Zoho Mail account is
 * deactivated AND their InsideMaps access is revoked, regardless of which
 * one (or both) they actually had.
 */

function buildStepPlan(requestType, accountType) {
  if (requestType === 'LEAVING_COMPANY') {
    return [
      { name: 'validate_employee', label: 'Employee validated' },
      { name: 'deactivate_user', label: 'Zoho Mail access disabled' },
      { name: 'revoke_insidemaps_access', label: 'InsideMaps access revoked' },
    ];
  }

  const base = [
    { name: 'validate_employee', label: 'Employee validated' },
    { name: 'check_email_availability', label: 'Email availability checked' },
  ];

  if (accountType === ACCOUNT_TYPE.INSIDEMAPS) {
    return [...base, { name: 'request_insidemaps_access', label: 'InsideMaps account requested (employee signup pending)' }];
  }

  // NEW_HIRE and UPDATE_EMPLOYEE_INFO both provision/refresh a full account.
  return [
    ...base,
    { name: 'create_user', label: 'Zoho user created' },
    { name: 'enable_mail', label: 'Zoho Mail enabled' },
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

function describeProvisioningStart(request) {
  if (request.submission.requestType === 'LEAVING_COMPANY') {
    return 'Offboarding started: disabling Zoho Mail and revoking InsideMaps access.';
  }
  return request.resolvedAccount?.accountType === ACCOUNT_TYPE.INSIDEMAPS
    ? 'InsideMaps account request initiated.'
    : 'Zoho provisioning initiated.';
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
        return zohoClient.enableMail({ resolvedAccount, zohoUserId: await getZohoUserId(request) });
      case 'assign_groups': {
        const alreadyAssigned = new Set(findStepResult(request, 'assign_groups')?.output?.assignedGroups ?? []);
        const assignedGroups = [...alreadyAssigned];
        const zohoUserId = await getZohoUserId(request);
        for (const group of resolvedAccount.groups) {
          if (alreadyAssigned.has(group)) continue;
          await zohoClient.assignGroup({ resolvedAccount, zohoUserId, group });
          assignedGroups.push(group);
          // Persist progress after each individual group so a failure on
          // group 3 of 4 does not force groups 1-2 to be reassigned.
          await recordStep(request.id, { name: 'assign_groups', outcome: 'SUCCESS', output: { assignedGroups }, at: new Date().toISOString() });
        }
        return { assignedGroups };
      }
      case 'verify_configuration':
        return zohoClient.verifyConfiguration({ resolvedAccount, zohoUserId: await getZohoUserId(request) });
      case 'deactivate_user':
        return zohoClient.deactivateUser({ resolvedAccount, zohoUserId: await getZohoUserId(request) });
      // Placeholder steps for InsideMaps accounts: there is no InsideMaps
      // signup/deprovisioning API to call yet, so these just record that
      // access was requested/revoked. Replace the body of these two cases
      // with real API calls once that integration exists.
      case 'request_insidemaps_access':
        return { accountType: ACCOUNT_TYPE.INSIDEMAPS };
      case 'revoke_insidemaps_access':
        return { accountType: ACCOUNT_TYPE.INSIDEMAPS };
      default:
        throw new Error(`Unknown provisioning step: ${step.name}`);
    }
  }

  /**
   * The Zoho user id lives on whichever request in this employee's chain
   * actually ran `create_user` — usually their original onboarding
   * request, not the offboarding request created later to deactivate them
   * (which starts with an empty `provisioning.steps`). Walk backwards
   * through `previousRequestId` until it's found.
   */
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
      provisioning: { ...entry.provisioning, startedAt, failureReason: null },
      auditTrail: [
        ...entry.auditTrail,
        {
          at: new Date().toISOString(),
          actorId: null,
          actorType: 'SYSTEM',
          action: 'PROVISIONING_STARTED',
          detail: describeProvisioningStart(entry),
        },
      ],
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
