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
  const calls = { createUser: 0, enableMail: 0, assignGroup: 0, verifyConfiguration: 0, deactivateUser: 0 };
  const assignedGroups = [];

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
    assignedGroups,
    async createUser() {
      const shouldFail = shouldFailThisAttempt('createUser');
      calls.createUser += 1;
      if (shouldFail) throw new Error('Simulated failure at step createUser');
      return { zohoUserId: 'user-123' };
    },
    async enableMail() {
      const shouldFail = shouldFailThisAttempt('enableMail');
      calls.enableMail += 1;
      if (shouldFail) throw new Error('Simulated failure at step enableMail');
      return { mailEnabled: true };
    },
    async assignGroup({ group }) {
      const shouldFail = shouldFailThisAttempt('assignGroup');
      calls.assignGroup += 1;
      if (shouldFail) throw new Error('Simulated failure at step assignGroup');
      assignedGroups.push(group);
      return { group, assigned: true };
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
    role: 'Standard User',
    groups: ['All Employees', 'Operations'],
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
      assert.equal(zohoClient.calls.enableMail, 1);
      assert.equal(zohoClient.calls.assignGroup, 2); // All Employees + Operations
      assert.equal(zohoClient.calls.verifyConfiguration, 1);
      assert.ok(finalRequest.provisioning.completedAt);
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
      const zohoClient = createRecordingZohoClient({ failOn: { step: 'enableMail', onAttempt: 1 } });
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      const { request: finalRequest, failure } = await provisioningService.run(request.id);

      assert.ok(failure);
      assert.equal(finalRequest.status, STATUS.PARTIALLY_PROVISIONED);
      assert.equal(zohoClient.calls.createUser, 1);
      assert.equal(zohoClient.calls.enableMail, 1);
    } finally {
      await cleanup();
    }
  });

  test('retrying a partially provisioned request does NOT call createUser again (no duplicate account)', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const { requestRepository, request } = await setupApprovedRequest(store);
      const zohoClient = createRecordingZohoClient({ failOn: { step: 'enableMail', onAttempt: 1 } });
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      const first = await provisioningService.run(request.id);
      assert.equal(first.request.status, STATUS.PARTIALLY_PROVISIONED);
      assert.equal(zohoClient.calls.createUser, 1);

      // Retry: enableMail now succeeds (only fails on the very first
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

  test('retrying resumes group assignment from where it left off rather than re-assigning already-assigned groups', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const { requestRepository, request } = await setupApprovedRequest(store);
      // Fail on the 2nd call to assignGroup (i.e. after "All Employees" has
      // already been assigned, but before "Operations" is).
      const zohoClient = createRecordingZohoClient({ failOn: { step: 'assignGroup', onAttempt: 2 } });
      const provisioningService = createProvisioningService({
        requestRepository,
        zohoClient,
        checkEmailAvailability: async () => true,
      });

      const first = await provisioningService.run(request.id);
      assert.equal(first.request.status, STATUS.PARTIALLY_PROVISIONED);
      assert.equal(zohoClient.assignedGroups.length, 1, 'only the first group should have been assigned before the failure');

      const second = await provisioningService.run(request.id);
      assert.equal(second.allStepsSucceeded, true);
      // 3 total assignGroup calls across both runs: call 1 succeeds
      // ("All Employees"), call 2 throws before assigning anything, then
      // the retry makes exactly 1 more call for the remaining group
      // ("Operations") — it must NOT re-call assignGroup for "All
      // Employees", which already succeeded.
      assert.equal(zohoClient.calls.assignGroup, 3);
      assert.deepEqual(zohoClient.assignedGroups, ['All Employees', 'Operations']);
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
      assert.equal(finalRequest.status, STATUS.ACCOUNT_CREATED);
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
});
