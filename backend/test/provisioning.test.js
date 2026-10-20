import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createTempStore } from './helpers/temp-store.js';
import { createRequestRepository } from '../src/domain/requests.js';
import { createProvisioningService } from '../src/services/provisioning.js';
import { STATUS } from '../src/domain/statuses.js';

function baseSubmission(overrides = {}) {
  return {
    requesterEmail: 'requester@insidemaps.com',
    requestType: 'NEW_HIRE',
    nameAndSurname: 'Jane Doe',
    privateEmail: 'jane.doe@gmail.com',
    country: 'Ukraine',
    department: 'Sales',
    team: 'Operations',
    subTeam: 'Product',
    jobPosition: 'Operator',
    managerEmail: 'manager@insidemaps.com',
    startDate: '2026-10-01',
    ...overrides,
  };
}

/**
 * A Zoho client double that records how many times each method was called
 * and can be configured to fail a specific call on a specific attempt.
 * This is the core tool for proving PRD section 15's hard requirement:
 * retrying a partially provisioned request must never create a second
 * Zoho account.
 */
function createRecordingZohoClient({ failOn } = {}) {
  const calls = { createUser: 0, verifyConfiguration: 0, deactivateUser: 0 };
  /**
   * Checks whether THIS call (the one about to be counted as attempt
   * number `calls[step] + 1`) should fail, then always increments the
   * counter regardless of outcome so callers can assert on total call
   * counts across both a failing and a subsequent successful attempt.
   */
  function shouldFailThisAttempt(step) {
    const attemptNumber = calls[step] + 1;
    return Boolean(failOn && failOn.step === step && attemptNumber === failOn.onAttempt);
  }

  return {
    calls,
    async createUser() {
      const shouldFail = shouldFailThisAttempt('createUser');
      calls.createUser += 1;
      if (shouldFail) throw new Error('Simulated failure at step createUser');
      return { zohoUserId: 'user-123', temporaryPassword: 'Tmp-Pass-123' };
    },
    async verifyConfiguration() {
      const shouldFail = shouldFailThisAttempt('verifyConfiguration');
      calls.verifyConfiguration += 1;
      if (shouldFail) throw new Error('Simulated failure at step verifyConfiguration');
      return { verified: true };
    },
    async deactivateUser() {
      const shouldFail = shouldFailThisAttempt('deactivateUser');
      calls.deactivateUser += 1;
      if (shouldFail) throw new Error('Simulated failure at step deactivateUser');
      return { deactivated: true };
    },
  };
}

async function setupApprovedRequest(store, submissionOverrides = {}) {
  const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
  const created = await requestRepository.create(baseSubmission(submissionOverrides));
  const approved = await requestRepository.saveResolvedAccount(created.id, {
    actorId: 'auditor-1',
    corporateEmail: 'jane.doe@insidemaps.com',
  });
  return { requestRepository, request: approved };
}

describe('provisioning engine', () => {
  test('a full success run executes every step and reaches ACCOUNT_CREATED', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const { requestRepository, request } = await setupApprovedRequest(store);
      const zohoClient = createRecordingZohoClient();
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      const { request: finalRequest, failure, allStepsSucceeded } = await provisioningService.run(request.id);

      assert.equal(failure, null);
      assert.equal(allStepsSucceeded, true);
      assert.equal(finalRequest.status, STATUS.ACCOUNT_CREATED);
      assert.equal(zohoClient.calls.createUser, 1);
      assert.equal(zohoClient.calls.verifyConfiguration, 1);
      assert.ok(finalRequest.provisioning.completedAt);
      assert.deepEqual(
        finalRequest.provisioning.steps.map((step) => step.name).sort(),
        ['check_email_availability', 'create_user', 'validate_employee', 'verify_configuration'],
        'a Zoho-only account creates just the mailbox: no groups, role or invitation steps',
      );
    } finally {
      await cleanup();
    }
  });

  test('a failure on the very first step (before any success) sets PROVISIONING_FAILED, not PARTIALLY_PROVISIONED', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const { requestRepository, request } = await setupApprovedRequest(store, { nameAndSurname: '' });
      const zohoClient = createRecordingZohoClient();
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      const { request: finalRequest, failure } = await provisioningService.run(request.id);

      assert.ok(failure);
      assert.equal(finalRequest.status, STATUS.PROVISIONING_FAILED);
      assert.equal(zohoClient.calls.createUser, 0);
    } finally {
      await cleanup();
    }
  });

  test('a failure after create_user succeeded sets PARTIALLY_PROVISIONED', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const { requestRepository, request } = await setupApprovedRequest(store);
      const zohoClient = createRecordingZohoClient({ failOn: { step: 'verifyConfiguration', onAttempt: 1 } });
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      const { request: finalRequest, failure } = await provisioningService.run(request.id);

      assert.ok(failure);
      assert.equal(finalRequest.status, STATUS.PARTIALLY_PROVISIONED);
      assert.equal(zohoClient.calls.createUser, 1);
      assert.equal(zohoClient.calls.verifyConfiguration, 1);
    } finally {
      await cleanup();
    }
  });

  test('retrying a partially provisioned request does NOT call createUser again (no duplicate account)', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const { requestRepository, request } = await setupApprovedRequest(store);
      const zohoClient = createRecordingZohoClient({ failOn: { step: 'verifyConfiguration', onAttempt: 1 } });
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      const first = await provisioningService.run(request.id);
      assert.equal(first.request.status, STATUS.PARTIALLY_PROVISIONED);
      assert.equal(zohoClient.calls.createUser, 1);

      // Retry: verifyConfiguration now succeeds (only fails on the very first
      // attempt), so the retry should complete successfully...
      const second = await provisioningService.run(request.id);

      assert.equal(second.allStepsSucceeded, true);
      // ...but createUser must still have been called exactly once in total.
      assert.equal(zohoClient.calls.createUser, 1, 'createUser must not be re-invoked on retry');
      assert.equal(second.request.status, STATUS.ACCOUNT_CREATED);
    } finally {
      await cleanup();
    }
  });

  test('ZOHO_AND_INSIDEMAPS creates the mailbox, then the InsideMaps account with its roles', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
      const created = await requestRepository.create(baseSubmission());
      const approved = await requestRepository.saveResolvedAccount(created.id, {
        actorId: 'auditor-1',
        corporateEmail: 'jane.doe@insidemaps.com',
        insideMapsRoles: ['IM_QC_REVIEWER'],
        accountType: 'ZOHO_AND_INSIDEMAPS',
      });
      const zohoClient = createRecordingZohoClient();
      const imRoles = [];
      const insideMapsClient = {
        async createUser() { return { insideMapsUserId: 'im-1' }; },
        async assignRole({ role }) { imRoles.push(role); return { assigned: true }; },
        async enforceSecurityPolicy() { return { twoStepVerificationRequired: true }; },
      };
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        insideMapsClient,
        checkEmailAvailability: async () => true,
      });

      const { request: finalRequest, allStepsSucceeded } = await provisioningService.run(approved.id);

      assert.equal(allStepsSucceeded, true);
      assert.equal(zohoClient.calls.createUser, 1);
      assert.deepEqual(imRoles, ['IM_QC_REVIEWER']);
      assert.equal(finalRequest.status, STATUS.ACCOUNT_CREATED);
      assert.equal(finalRequest.resolvedAccount.groups.length, 0);
    } finally {
      await cleanup();
    }
  });

  test('provisioning refuses to run without an approved resolved account', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
      const created = await requestRepository.create(baseSubmission());
      const zohoClient = createRecordingZohoClient();
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      await assert.rejects(() => provisioningService.run(created.id), /auditor must approve/i);
      assert.equal(zohoClient.calls.createUser, 0);
    } finally {
      await cleanup();
    }
  });

  test('a LEAVING_COMPANY request runs the deactivation plan, not the create-user plan', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const { requestRepository, request } = await setupApprovedRequest(store, { requestType: 'LEAVING_COMPANY' });
      const zohoClient = createRecordingZohoClient();
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      const { request: finalRequest, allStepsSucceeded } = await provisioningService.run(request.id);

      assert.equal(allStepsSucceeded, true);
      assert.equal(zohoClient.calls.createUser, 0);
      assert.equal(zohoClient.calls.deactivateUser, 1);
      assert.equal(finalRequest.status, STATUS.ACCESS_REVOKED);
    } finally {
      await cleanup();
    }
  });

  test('refuses to run again once a request has already fully completed provisioning', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const { requestRepository, request } = await setupApprovedRequest(store);
      const zohoClient = createRecordingZohoClient();
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      // Manually mark as COMPLETED (as the notification service would).
      await requestRepository.applyUpdate(request.id, (entry) => ({ ...entry, status: STATUS.COMPLETED }));

      await assert.rejects(() => provisioningService.run(request.id), /already completed/i);
      assert.equal(zohoClient.calls.createUser, 0);
    } finally {
      await cleanup();
    }
  });

  test('an INSIDEMAPS account type calls InsideMaps APIs (createUser, assignRole, enforceSecurityPolicy)', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
      const created = await requestRepository.create(baseSubmission({ jobPosition: 'QC' }));
      const approved = await requestRepository.saveResolvedAccount(created.id, {
        actorId: 'auditor-1',
        corporateEmail: 'jane.doe@services.insidemaps.com',
        role: 'Member',
        groups: ['All Employees', 'Operations'],
        insideMapsRoles: ['IM_QC_REVIEWER', 'IM_DEFAULT_USER'],
        accountType: 'INSIDEMAPS',
      });

      const zohoClient = createRecordingZohoClient();
      const imCalls = { createUser: 0, assignRole: [], enforceSecurityPolicy: 0, removeRoles: 0, deleteUser: 0 };
      const insideMapsClient = {
        async createUser({ email }) {
          imCalls.createUser += 1;
          return { imUserId: 'im-1', email };
        },
        async assignRole({ role }) {
          imCalls.assignRole.push(role);
          return { assigned: true, role };
        },
        async enforceSecurityPolicy() {
          imCalls.enforceSecurityPolicy += 1;
          return { twoStepVerificationRequired: true, forcePasswordChangeOnFirstLogin: true };
        },
        async removeRoles() {
          imCalls.removeRoles += 1;
          return { rolesRemoved: true };
        },
        async deleteUser() {
          imCalls.deleteUser += 1;
          return { deleted: true };
        },
      };

      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        insideMapsClient,
        checkEmailAvailability: async () => true,
      });

      const { request: finalRequest, allStepsSucceeded } = await provisioningService.run(approved.id);
      assert.equal(allStepsSucceeded, true);
      assert.equal(finalRequest.status, STATUS.ACCOUNT_CREATED);
      assert.equal(zohoClient.calls.createUser, 0, 'Zoho createUser should not be called for INSIDEMAPS account type');
      assert.equal(imCalls.createUser, 1);
      assert.deepEqual(imCalls.assignRole, ['IM_QC_REVIEWER', 'IM_DEFAULT_USER']);
      assert.equal(imCalls.enforceSecurityPolicy, 1);
      assert.equal(finalRequest.provisioning.securityPolicy?.twoStepVerificationRequired, true);
    } finally {
      await cleanup();
    }
  });
});
