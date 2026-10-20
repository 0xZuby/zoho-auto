/**
 * InsideMaps user & role provisioning adapter.
 *
 * When an employee's account type is resolved to `INSIDEMAPS`, this adapter
 * handles calling the InsideMaps APIs to:
 *  - create the InsideMaps user (`createUser`)
 *  - assign default/resolved InsideMaps roles (`assignRole`)
 *  - enforce security policy (2SV + first-login password setup) (`enforceSecurityPolicy`)
 *  - remove InsideMaps roles on offboarding (`removeRoles`)
 *  - delete/disable the InsideMaps user on offboarding (`deleteUser`)
 *
 * Like the Zoho adapter, it supports `simulated` mode (default, with
 * `fail-demo` support for exercising partial-provisioning and retry flows)
 * and `live` mode against `INSIDEMAPS_API_URL` with `INSIDEMAPS_API_TOKEN`.
 */

const STEP_DELAY_MS = 250;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateFailure(resolvedAccount, stepName) {
  const roles = resolvedAccount.insideMapsRoles ?? resolvedAccount.groups ?? [];
  const haystack = `${resolvedAccount.role ?? ''} ${roles.join(' ')} ${resolvedAccount.corporateEmail ?? ''}`.toLowerCase();
  return haystack.includes(`fail-demo:${stepName}`) || haystack.includes('fail-demo');
}

export function createSimulatedInsideMapsClient() {
  return {
    mode: 'simulated',

    async createUser({ resolvedAccount, employeeName, submission }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'create_im_user') || shouldSimulateFailure(resolvedAccount, 'create_user')) {
        throw new Error('Simulated failure: InsideMaps API rejected user creation.');
      }
      const email = resolvedAccount.corporateEmail || submission?.privateEmail || 'user@insidemaps.com';
      return {
        insideMapsUserId: `im-user-${Buffer.from(email).toString('hex').slice(0, 12)}`,
        employeeName,
        email,
      };
    },

    async assignRole({ resolvedAccount, insideMapsUserId, role }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'assign_im_role') || shouldSimulateFailure(resolvedAccount, 'assign_group')) {
        throw new Error(`Simulated failure: InsideMaps API could not assign role "${role}".`);
      }
      return { insideMapsUserId, role, assigned: true };
    },

    async enforceSecurityPolicy({ resolvedAccount, insideMapsUserId }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'enforce_security_policy')) {
        throw new Error('Simulated failure: InsideMaps API could not enforce 2SV and first-login password policy.');
      }
      return { insideMapsUserId, twoStepVerificationRequired: true, twoStepVerificationEnrolled: false, forcePasswordChangeOnFirstLogin: true };
    },

    async removeRoles({ resolvedAccount, insideMapsUserId }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'remove_im_roles')) {
        throw new Error('Simulated failure: InsideMaps API could not remove user roles.');
      }
      return { insideMapsUserId, rolesRemoved: true };
    },

    async deleteUser({ resolvedAccount, insideMapsUserId }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'delete_im_user') || shouldSimulateFailure(resolvedAccount, 'deactivate')) {
        throw new Error('Simulated failure: InsideMaps API could not disable/delete user.');
      }
      return { insideMapsUserId, deleted: true, sessionsRevoked: true };
    },
  };
}

export function createLiveInsideMapsClient(config) {
  const baseUrl = String(config.INSIDEMAPS_API_URL ?? '').replace(/\/+$/, '');
  const apiToken = config.INSIDEMAPS_API_TOKEN;

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`InsideMaps API ${options.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
    }
    return response.status === 204 ? null : response.json();
  }

  return {
    mode: 'live',

    async createUser({ resolvedAccount, employeeName, submission }) {
      const created = await request('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: employeeName,
          email: resolvedAccount.corporateEmail,
          privateEmail: submission?.privateEmail,
          department: submission?.resolvedDepartment,
          team: submission?.resolvedTeam,
        }),
      });
      return {
        insideMapsUserId: created?.id ?? created?.userId,
        employeeName,
        email: resolvedAccount.corporateEmail,
      };
    },

    async assignRole({ insideMapsUserId, role }) {
      await request(`/users/${encodeURIComponent(insideMapsUserId)}/roles`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      return { insideMapsUserId, role, assigned: true };
    },

    async enforceSecurityPolicy({ insideMapsUserId }) {
      await request(`/users/${encodeURIComponent(insideMapsUserId)}/security-policy`, {
        method: 'POST',
        body: JSON.stringify({
          requireTwoStepVerification: true,
          forcePasswordChangeOnFirstLogin: true,
        }),
      });
      return { insideMapsUserId, twoStepVerificationRequired: true, twoStepVerificationEnrolled: false, forcePasswordChangeOnFirstLogin: true };
    },

    async removeRoles({ insideMapsUserId }) {
      if (insideMapsUserId) {
        await request(`/users/${encodeURIComponent(insideMapsUserId)}/roles`, { method: 'DELETE' });
      }
      return { insideMapsUserId, rolesRemoved: true };
    },

    async deleteUser({ insideMapsUserId, resolvedAccount }) {
      const target = insideMapsUserId || resolvedAccount?.corporateEmail;
      if (target) {
        await request(`/users/${encodeURIComponent(target)}`, { method: 'DELETE' });
      }
      return { insideMapsUserId, deleted: true, sessionsRevoked: true };
    },
  };
}

export function createInsideMapsClient(config) {
  return config.INSIDEMAPS_MODE === 'live' ? createLiveInsideMapsClient(config) : createSimulatedInsideMapsClient();
}
