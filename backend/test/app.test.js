import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/test-server.js';

const SEEDED_ADMIN_EMAIL = 'admin@insidemaps.com';
const SEEDED_ADMIN_PASSWORD = 'ChangeMe123!';
const SEEDED_AUDITOR_EMAIL = 'auditor@insidemaps.com';
const SEEDED_AUDITOR_PASSWORD = 'Auditor123!';
const SEEDED_HR_EMAIL = 'hr@insidemaps.com';
const SEEDED_HR_PASSWORD = 'HrPortal123!';

async function signInHr(server) {
  return server.request('/api/auth/login', { method: 'POST', body: { email: SEEDED_HR_EMAIL, password: SEEDED_HR_PASSWORD } });
}

async function signInAdmin(server) {
  return server.request('/api/auth/login', { method: 'POST', body: { email: SEEDED_ADMIN_EMAIL, password: SEEDED_ADMIN_PASSWORD } });
}

describe('app: health, auth, and role gating', () => {
  test('GET /api/health responds ok without authentication', async () => {
    const server = await startTestServer();
    try {
      const { status, body } = await server.request('/api/health');
      assert.equal(status, 200);
      assert.deepEqual(body, { ok: true });
    } finally {
      await server.stop();
    }
  });

  test('auditor routes reject an unauthenticated request with 401', async () => {
    const server = await startTestServer();
    try {
      const { status } = await server.request('/api/auditor/requests');
      assert.equal(status, 401);
    } finally {
      await server.stop();
    }
  });

  test('logging in with the seeded administrator grants access, and /auth/me reflects it', async () => {
    const server = await startTestServer();
    try {
      const loginResult = await server.request('/api/auth/login', {
        method: 'POST',
        body: { email: SEEDED_ADMIN_EMAIL, password: SEEDED_ADMIN_PASSWORD },
      });
      assert.equal(loginResult.status, 200);
      assert.equal(loginResult.body.user.role, 'ADMINISTRATOR');

      const me = await server.request('/api/auth/me');
      assert.equal(me.body.user.email, SEEDED_ADMIN_EMAIL);
    } finally {
      await server.stop();
    }
  });

  test('the seeded Auditor can use the Auditor portal but not administrator routes', async () => {
    const server = await startTestServer();
    try {
      const loginResult = await server.request('/api/auth/login', {
        method: 'POST',
        body: { email: SEEDED_AUDITOR_EMAIL, password: SEEDED_AUDITOR_PASSWORD },
      });
      assert.equal(loginResult.status, 200);
      assert.equal(loginResult.body.user.role, 'AUDITOR');

      const auditorRoutes = await server.request('/api/auditor/requests');
      assert.equal(auditorRoutes.status, 200);

      const adminRoutes = await server.request('/api/admin/auditors');
      assert.equal(adminRoutes.status, 403);
    } finally {
      await server.stop();
    }
  });

  test('an invalid password is rejected with 401 and no session is granted', async () => {
    const server = await startTestServer();
    try {
      const loginResult = await server.request('/api/auth/login', {
        method: 'POST',
        body: { email: SEEDED_ADMIN_EMAIL, password: 'wrong-password' },
      });
      assert.equal(loginResult.status, 401);

      const me = await server.request('/api/auth/me');
      assert.equal(me.body.user, null);
    } finally {
      await server.stop();
    }
  });

  test('an authenticated administrator can reach both auditor and admin routes', async () => {
    const server = await startTestServer();
    try {
      await server.request('/api/auth/login', { method: 'POST', body: { email: SEEDED_ADMIN_EMAIL, password: SEEDED_ADMIN_PASSWORD } });

      const auditorRoutes = await server.request('/api/auditor/requests');
      assert.equal(auditorRoutes.status, 200);

      const adminRoutes = await server.request('/api/admin/auditors');
      assert.equal(adminRoutes.status, 200);
    } finally {
      await server.stop();
    }
  });

  test('an AUDITOR role can reach auditor routes but is forbidden from admin routes', async () => {
    const server = await startTestServer();
    try {
      // Sign in as the seeded admin to create a plain AUDITOR account.
      await server.request('/api/auth/login', { method: 'POST', body: { email: SEEDED_ADMIN_EMAIL, password: SEEDED_ADMIN_PASSWORD } });
      const createAuditorResult = await server.request('/api/admin/auditors', {
        method: 'POST',
        body: { name: 'Regular Auditor', email: 'regular-auditor@insidemaps.com', password: 'AuditorPass123', role: 'AUDITOR' },
      });
      assert.equal(createAuditorResult.status, 201);

      // Now sign in as that new auditor.
      server.clearSession();
      const loginResult = await server.request('/api/auth/login', {
        method: 'POST',
        body: { email: 'regular-auditor@insidemaps.com', password: 'AuditorPass123' },
      });
      assert.equal(loginResult.status, 200);
      assert.equal(loginResult.body.user.role, 'AUDITOR');

      const auditorRoutes = await server.request('/api/auditor/requests');
      assert.equal(auditorRoutes.status, 200);

      const adminRoutes = await server.request('/api/admin/auditors');
      assert.equal(adminRoutes.status, 403);
    } finally {
      await server.stop();
    }
  });

  test('logout clears the session so subsequent auditor requests are unauthenticated', async () => {
    const server = await startTestServer();
    try {
      await server.request('/api/auth/login', { method: 'POST', body: { email: SEEDED_ADMIN_EMAIL, password: SEEDED_ADMIN_PASSWORD } });
      const beforeLogout = await server.request('/api/auditor/requests');
      assert.equal(beforeLogout.status, 200);

      await server.request('/api/auth/logout', { method: 'POST' });
      const afterLogout = await server.request('/api/auditor/requests');
      assert.equal(afterLogout.status, 401);
    } finally {
      await server.stop();
    }
  });

  test('a valid onboarding form submission is accepted and appears in the privacy-safe auditor queue', async () => {
    const server = await startTestServer();
    try {
      await signInHr(server);
      const submitResult = await server.request('/api/form/submit', {
        method: 'POST',
        body: {
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
        },
      });
      assert.equal(submitResult.status, 201);
      assert.match(submitResult.body.requestCode, /^ONB-\d{4}-/);

      await server.request('/api/auth/login', { method: 'POST', body: { email: SEEDED_ADMIN_EMAIL, password: SEEDED_ADMIN_PASSWORD } });
      const queue = await server.request('/api/auditor/requests');
      assert.equal(queue.status, 200);
      assert.equal(queue.body.length, 1);
      assert.equal(queue.body[0].nameAndSurname, 'Jane Doe');
    } finally {
      await server.stop();
    }
  });

  test('an invalid onboarding form submission is rejected with 422 and field errors', async () => {
    const server = await startTestServer();
    try {
      await signInHr(server);
      const { status, body } = await server.request('/api/form/submit', { method: 'POST', body: {} });
      assert.equal(status, 422);
      assert.ok(body.errors.requesterEmail);
      assert.ok(body.errors.nameAndSurname);
    } finally {
      await server.stop();
    }
  });

  test('an auditor can edit employee information and every change is recorded in the audit trail', async () => {
    const server = await startTestServer();
    try {
      await signInHr(server);
      const submitResult = await server.request('/api/form/submit', {
        method: 'POST',
        body: {
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
        },
      });
      assert.equal(submitResult.status, 201);

      await server.request('/api/auth/login', { method: 'POST', body: { email: SEEDED_ADMIN_EMAIL, password: SEEDED_ADMIN_PASSWORD } });
      const queue = await server.request('/api/auditor/requests');
      const requestId = queue.body[0].id;

      const editResult = await server.request(`/api/auditor/requests/${requestId}/submission`, {
        method: 'PUT',
        body: {
          nameAndSurname: 'Jane R. Doe',
          privateEmail: 'jane.doe@gmail.com',
          country: 'Ukraine',
          department: 'Sales',
          team: 'Operations',
          subTeam: 'Product',
          jobPosition: 'Operator',
          managerEmail: 'new-manager@insidemaps.com',
        },
      });
      assert.equal(editResult.status, 200);
      assert.equal(editResult.body.submission.nameAndSurname, 'Jane R. Doe');
      assert.equal(editResult.body.submission.managerEmail, 'new-manager@insidemaps.com');

      const auditEntry = editResult.body.auditTrail.at(-1);
      assert.equal(auditEntry.action, 'EMPLOYEE_INFO_UPDATED');
      assert.equal(auditEntry.actorType, 'AUDITOR');
      assert.match(auditEntry.detail, /Jane Doe.*Jane R\. Doe/);
      assert.match(auditEntry.detail, /manager@insidemaps\.com.*new-manager@insidemaps\.com/);
    } finally {
      await server.stop();
    }
  });

  test('an auditor can offboard an employee from their request, creating a linked Leaving company request', async () => {
    const server = await startTestServer();
    try {
      await signInHr(server);
      await server.request('/api/form/submit', {
        method: 'POST',
        body: {
          requesterEmail: 'requester@insidemaps.com',
          requestType: 'NEW_HIRE',
          nameAndSurname: 'John Smith',
          privateEmail: 'john.smith@gmail.com',
          country: 'Ukraine',
          department: 'Sales',
          team: 'Operations',
          subTeam: 'Product',
          jobPosition: 'Operator',
          managerEmail: 'manager@insidemaps.com',
          startDate: '2026-10-01',
        },
      });

      await server.request('/api/auth/login', { method: 'POST', body: { email: SEEDED_ADMIN_EMAIL, password: SEEDED_ADMIN_PASSWORD } });
      const queueBefore = await server.request('/api/auditor/requests');
      const onboardingId = queueBefore.body[0].id;
      const onboardingDetail = await server.request(`/api/auditor/requests/${onboardingId}`);
      const proposedEmail = onboardingDetail.body.proposedAccount.corporateEmail;

      const offboardResult = await server.request(`/api/auditor/requests/${onboardingId}/offboard`, { method: 'POST' });
      assert.equal(offboardResult.status, 201);
      assert.equal(offboardResult.body.submission.requestType, 'LEAVING_COMPANY');
      assert.equal(offboardResult.body.submission.nameAndSurname, 'John Smith');
      // The offboarding request must target the same existing account, not a newly generated email.
      assert.equal(offboardResult.body.proposedAccount.corporateEmail, proposedEmail);

      const queueAfter = await server.request('/api/auditor/requests');
      assert.equal(queueAfter.body.length, 2);
      assert.ok(queueAfter.body.some((request) => request.requestType === 'LEAVING_COMPANY'));

      const sourceAfter = await server.request(`/api/auditor/requests/${onboardingId}`);
      const sourceAuditEntry = sourceAfter.body.auditTrail.at(-1);
      assert.equal(sourceAuditEntry.action, 'OFFBOARDING_INITIATED');

      // Trying to offboard the same employee again is rejected.
      const duplicateResult = await server.request(`/api/auditor/requests/${onboardingId}/offboard`, { method: 'POST' });
      assert.equal(duplicateResult.status, 409);
    } finally {
      await server.stop();
    }
  });

  test('the request form rejects an unauthenticated submission with 401', async () => {
    const server = await startTestServer();
    try {
      const { status } = await server.request('/api/form/submit', { method: 'POST', body: {} });
      assert.equal(status, 401);
    } finally {
      await server.stop();
    }
  });

  test('HR can find an existing employee, update their information directly, and it is audited', async () => {
    const server = await startTestServer();
    try {
      await signInHr(server);
      await server.request('/api/form/submit', {
        method: 'POST',
        body: {
          requesterEmail: 'requester@insidemaps.com',
          requestType: 'NEW_HIRE',
          nameAndSurname: 'Priya Shah',
          privateEmail: 'priya.shah@gmail.com',
          country: 'Ukraine',
          department: 'Sales',
          team: 'Operations',
          subTeam: 'Product',
          jobPosition: 'Operator',
          managerEmail: 'manager@insidemaps.com',
          startDate: '2026-10-01',
        },
      });

      const searchResult = await server.request('/api/form/employees?query=priya.shah');
      assert.equal(searchResult.status, 200);
      assert.equal(searchResult.body.length, 1);
      const employeeId = searchResult.body[0].id;

      const detail = await server.request(`/api/form/employees/${employeeId}`);
      assert.equal(detail.status, 200);
      assert.equal(detail.body.submission.nameAndSurname, 'Priya Shah');

      const updateResult = await server.request(`/api/form/employees/${employeeId}`, {
        method: 'PUT',
        body: {
          nameAndSurname: 'Priya Shah',
          privateEmail: 'priya.shah@gmail.com',
          country: 'Ukraine',
          department: 'Sales',
          team: 'Operations',
          subTeam: 'Product',
          jobPosition: 'Squad lead',
          managerEmail: 'manager@insidemaps.com',
          startDate: '2026-10-01',
        },
      });
      assert.equal(updateResult.status, 200);
      assert.equal(updateResult.body.submission.resolvedJobPosition, 'Squad lead');

      await signInAdmin(server);
      const requestDetail = await server.request(`/api/auditor/requests/${employeeId}`);
      const auditEntry = requestDetail.body.auditTrail.at(-1);
      assert.equal(auditEntry.action, 'EMPLOYEE_INFO_UPDATED');
      assert.equal(auditEntry.actorType, 'HR');
      assert.match(auditEntry.detail, /Default HR/);
    } finally {
      await server.stop();
    }
  });

  test('HR can select an employee from the directory and start offboarding, which routes to the auditor queue', async () => {
    const server = await startTestServer();
    try {
      await signInHr(server);
      await server.request('/api/form/submit', {
        method: 'POST',
        body: {
          requesterEmail: 'requester@insidemaps.com',
          requestType: 'NEW_HIRE',
          nameAndSurname: 'Omar Ali',
          privateEmail: 'omar.ali@gmail.com',
          country: 'Ukraine',
          department: 'Sales',
          team: 'Operations',
          subTeam: 'Product',
          jobPosition: 'Operator',
          managerEmail: 'manager@insidemaps.com',
          startDate: '2026-10-01',
        },
      });

      const searchResult = await server.request('/api/form/employees?query=omar.ali');
      const employeeId = searchResult.body[0].id;

      const offboardResult = await server.request(`/api/form/employees/${employeeId}/offboard`, { method: 'POST' });
      assert.equal(offboardResult.status, 201);
      assert.match(offboardResult.body.requestCode, /^ONB-\d{4}-/);

      await signInAdmin(server);
      const queue = await server.request('/api/auditor/requests');
      assert.ok(queue.body.some((request) => request.requestType === 'LEAVING_COMPANY' && request.nameAndSurname === 'Omar Ali'));
    } finally {
      await server.stop();
    }
  });

  test('MVP lifecycle features: dynamic rules, domain mapping, collision suffix starting at 2, scheduled offboarding, batch provisioning, and audit log', async () => {
    const server = await startTestServer();
    try {
      await signInAdmin(server);

      // 1. Admin configures position -> accountType mapping and domain rule
      const initialRulesRes = await server.request('/api/admin/rules');
      assert.equal(initialRulesRes.status, 200);
      const initialRules = initialRulesRes.body;
      assert.equal(initialRules.domainRule.defaultDomain, 'insidemaps.com');
      assert.equal(initialRules.domainRule.operationsDomain, 'services.insidemaps.com');

      const updateRulesRes = await server.request('/api/admin/rules', {
        method: 'PUT',
        body: {
          domainRule: initialRules.domainRule,
          positionMappings: [
            ...initialRules.positionMappings.filter((m) => m.position !== 'Operator'),
            {
              position: 'Operator',
              accountType: 'INSIDEMAPS',
              role: 'Member',
              insideMapsRoles: ['IM_OPERATOR_SPECIALIST'],
              active: true,
            },
          ],
        },
      });
      assert.equal(updateRulesRes.status, 200);

      // 2. HR submits two requests with the same name in Operations team -> services.insidemaps.com + suffix 2 on collision
      await signInHr(server);

      const firstSub = await server.request('/api/form/submit', {
        method: 'POST',
        body: {
          requesterEmail: 'requester@insidemaps.com',
          requestType: 'NEW_HIRE',
          nameAndSurname: 'Alex Mercer',
          privateEmail: 'alex1@gmail.com',
          country: 'Ukraine',
          department: 'Sales',
          team: 'Operations',
          subTeam: 'Product',
          jobPosition: 'Operator',
          managerEmail: 'manager@insidemaps.com',
          startDate: '2026-10-01',
        },
      });
      assert.equal(firstSub.status, 201);

      const secondSub = await server.request('/api/form/submit', {
        method: 'POST',
        body: {
          requesterEmail: 'requester@insidemaps.com',
          requestType: 'NEW_HIRE',
          nameAndSurname: 'Alex Mercer',
          privateEmail: 'alex2@gmail.com',
          country: 'Ukraine',
          department: 'Sales',
          team: 'Operations',
          subTeam: 'Product',
          jobPosition: 'Operator',
          managerEmail: 'manager@insidemaps.com',
          startDate: '2026-10-01',
        },
      });
      assert.equal(secondSub.status, 201);

      await signInAdmin(server);
      const queueRes = await server.request('/api/auditor/requests');
      const [secondReqSummary, firstReqSummary] = queueRes.body;
      assert.equal(firstReqSummary.proposedCorporateEmail, 'alex.mercer@services.insidemaps.com');
      assert.equal(firstReqSummary.accountType, 'INSIDEMAPS');
      assert.equal(secondReqSummary.proposedCorporateEmail, 'alex.mercer2@services.insidemaps.com');
      assert.equal(secondReqSummary.collisionAdjusted, true);

      // 3. Approve both and run batch provisioning (InsideMaps API flow)
      const firstDetail = (await server.request(`/api/auditor/requests/${firstReqSummary.id}`)).body;
      const secondDetail = (await server.request(`/api/auditor/requests/${secondReqSummary.id}`)).body;

      await server.request(`/api/auditor/requests/${firstDetail.id}/account`, {
        method: 'PUT',
        body: {
          corporateEmail: firstDetail.proposedAccount.corporateEmail,
          role: firstDetail.proposedAccount.role,
          groups: firstDetail.proposedAccount.groups,
          insideMapsRoles: firstDetail.proposedAccount.insideMapsRoles,
          accountType: 'INSIDEMAPS',
        },
      });
      await server.request(`/api/auditor/requests/${secondDetail.id}/account`, {
        method: 'PUT',
        body: {
          corporateEmail: secondDetail.proposedAccount.corporateEmail,
          role: secondDetail.proposedAccount.role,
          groups: secondDetail.proposedAccount.groups,
          insideMapsRoles: secondDetail.proposedAccount.insideMapsRoles,
          accountType: 'INSIDEMAPS',
        },
      });

      const batchRes = await server.request('/api/auditor/requests/batch-provision', {
        method: 'POST',
        body: { requestIds: [firstDetail.id, secondDetail.id] },
      });
      assert.equal(batchRes.status, 200);
      assert.equal(batchRes.body.processed, 2);
      assert.equal(batchRes.body.results.every((r) => r.ok && r.request.status === 'ACCOUNT_CREATED'), true);

      // 4. Preview notification and send setup invite
      const previewRes = await server.request(`/api/auditor/requests/${firstDetail.id}/notification-preview`);
      assert.equal(previewRes.status, 200);
      assert.match(previewRes.body.text, /Two-Step Verification/i);

      const notifyRes = await server.request(`/api/auditor/requests/${firstDetail.id}/notify`, { method: 'POST' });
      assert.equal(notifyRes.status, 200);

      // 5. Schedule future offboarding and then trigger due offboardings
      await signInHr(server);
      const futureOffboardRes = await server.request(`/api/form/employees/${firstDetail.id}/offboard`, {
        method: 'POST',
        body: {
          effectiveLeaveDate: '2099-12-31',
          effectiveLeaveTimezone: 'UTC',
          leavingReason: 'End of contract',
        },
      });
      assert.equal(futureOffboardRes.status, 201);
      assert.equal(futureOffboardRes.body.status, 'SCHEDULED_OFFBOARDING');

      await signInAdmin(server);
      const runDueRes = await server.request('/api/auditor/offboarding/run-due', {
        method: 'POST',
        body: { asOfIso: '2100-01-01T00:00:00.000Z' },
      });
      assert.equal(runDueRes.status, 200);
      assert.equal(runDueRes.body.processed, 1);
      assert.equal(runDueRes.body.results[0].ok, true);

      // 6. Verify system audit log
      const auditJsonRes = await server.request('/api/auditor/audit-log?system=INSIDEMAPS');
      assert.equal(auditJsonRes.status, 200);
      assert.ok(auditJsonRes.body.length >= 2);
    } finally {
      await server.stop();
    }
  });

  test('Google Form webhook (/api/webhooks/google-form) automatically determines requestType for new hire, update, and offboarding', async () => {
    const server = await startTestServer();
    try {
      // 1. Raw Google Form payload -> detected as NEW_HIRE
      const hireRes = await server.request('/api/webhooks/google-form', {
        method: 'POST',
        body: {
          namedValues: {
            'Email Address': ['hr@insidemaps.com'],
            'Name and Surname': ['Elena Rostova'],
            'Personal Email': ['elena.rostova@gmail.com'],
            Country: ['Serbia'],
            Department: ['Service Delivery'],
            Team: ['Operations'],
            'Sub Team': ['Capture'],
            'Job Position': ['Operator'],
            'Manager Email': ['lead@insidemaps.com'],
            'Start Date': ['2026-11-01'],
          },
        },
      });
      assert.equal(hireRes.status, 201);
      assert.equal(hireRes.body.detectedRequestType, 'NEW_HIRE');
      assert.equal(hireRes.body.proposedCorporateEmail, 'elena.rostova@services.insidemaps.com');

      // 2. Submitting an update for the same employee -> detected as UPDATE_EMPLOYEE_INFO
      const updateRes = await server.request('/api/webhooks/google-form', {
        method: 'POST',
        body: {
          namedValues: {
            'Email Address': ['hr@insidemaps.com'],
            'Request Type': ['Update employee info'],
            'Name and Surname': ['Elena Rostova'],
            'Personal Email': ['elena.rostova@gmail.com'],
            Country: ['Serbia'],
            Department: ['Service Delivery'],
            Team: ['Operations'],
            'Sub Team': ['Capture'],
            'Job Position': ['Team leader'],
            'Manager Email': ['lead@insidemaps.com'],
          },
        },
      });
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.detectedRequestType, 'UPDATE_EMPLOYEE_INFO');

      // 3. Submitting with an Effective Leave Date -> detected as LEAVING_COMPANY and scheduled
      const leaveRes = await server.request('/api/webhooks/google-form', {
        method: 'POST',
        body: {
          namedValues: {
            'Email Address': ['hr@insidemaps.com'],
            'Personal Email': ['elena.rostova@gmail.com'],
            'Effective Leave Date': ['2099-12-31'],
            'Leaving Reason': ['Relocation'],
          },
        },
      });
      assert.equal(leaveRes.status, 201);
      assert.equal(leaveRes.body.detectedRequestType, 'LEAVING_COMPANY');
      assert.equal(leaveRes.body.status, 'SCHEDULED_OFFBOARDING');
    } finally {
      await server.stop();
    }
  });
});
