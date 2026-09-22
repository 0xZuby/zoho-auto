import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createTempStore } from './helpers/temp-store.js';
import { createRequestRepository } from '../src/domain/requests.js';
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
    jobPosition: 'Chief Astronaut', // deliberately unmapped -> needsReview
    managerEmail: 'manager@insidemaps.com',
    ...overrides,
  };
}

describe('request repository — security boundary (PRD section 18)', () => {
  test('a new request starts with no resolvedAccount, even though a proposedAccount exists', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
      const created = await requestRepository.create(baseSubmission());

      assert.equal(created.resolvedAccount, null);
      assert.ok(created.proposedAccount);
      assert.equal(created.status, STATUS.PENDING_REVIEW);
    } finally {
      await cleanup();
    }
  });

  test('an unmapped job position produces a needsReview proposal but never a privileged role', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
      const created = await requestRepository.create(baseSubmission());

      assert.equal(created.proposedAccount.needsReview, true);
      assert.equal(created.proposedAccount.role, 'Standard User (Pending Auditor Review)');
    } finally {
      await cleanup();
    }
  });

  test('saveResolvedAccount requires an explicit auditor action and records who approved it', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
      const created = await requestRepository.create(baseSubmission());

      const approved = await requestRepository.saveResolvedAccount(created.id, {
        actorId: 'auditor-42',
        corporateEmail: 'jane.doe@insidemaps.com',
        role: 'Standard User',
        groups: ['All Employees'],
      });

      assert.equal(approved.status, STATUS.APPROVED);
      assert.equal(approved.resolvedAccount.corporateEmail, 'jane.doe@insidemaps.com');
      assert.equal(approved.resolvedAccount.resolvedBy, 'auditor-42');
      assert.ok(approved.auditTrail.some((event) => event.action === 'ACCOUNT_CONFIGURATION_APPROVED'));
    } finally {
      await cleanup();
    }
  });

  test('listSummaries never exposes private email, manager email, or GitHub details', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
      await requestRepository.create(
        baseSubmission({
          privateEmail: 'super-secret@gmail.com',
          managerEmail: 'manager-secret@insidemaps.com',
          department: 'Development',
          githubProfile: 'https://github.com/janedoe',
          githubRepositories: 'org/secret-repo',
        }),
      );

      const summaries = await requestRepository.listSummaries();
      const serialized = JSON.stringify(summaries);

      assert.ok(!serialized.includes('super-secret@gmail.com'));
      assert.ok(!serialized.includes('manager-secret@insidemaps.com'));
      assert.ok(!serialized.includes('github.com/janedoe'));
      assert.ok(!serialized.includes('secret-repo'));
    } finally {
      await cleanup();
    }
  });

  test('getMetrics counts requests by status bucket', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const requestRepository = createRequestRepository(store, { corporateEmailDomain: 'insidemaps.com' });
      await requestRepository.create(baseSubmission());
      await requestRepository.create(baseSubmission({ nameAndSurname: 'Second Person' }));

      const metrics = await requestRepository.getMetrics();
      assert.equal(metrics.newRequests, 2);
      assert.equal(metrics.completed, 0);
    } finally {
      await cleanup();
    }
  });
});
