/**
 * Zoho provisioning adapter.
 *
 * In `simulated` mode (the default — see ZOHO_MODE in .env.example) no
 * network calls are made. Each step resolves after a short delay and always
 * succeeds, EXCEPT for a request whose resolved account role/groups contain
 * the literal substring "fail-demo" (case-insensitive), which is reserved
 * for exercising the partial-provisioning-and-retry flow described in PRD
 * section 15 without depending on real Zoho state.
 *
 * `live` mode targets the Zoho Directory Admin API
 * (https://www.zoho.com/directory/help/api/) for user creation and group
 * assignment, and the Zoho Mail Admin API to enable mail for the new user.
 * It is deliberately isolated behind the same four-method interface so the
 * provisioning engine (see services/provisioning.js) never needs to know
 * which mode is active.
 */

const STEP_DELAY_MS = 350;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateFailure(resolvedAccount, stepName) {
  const haystack = `${resolvedAccount.role} ${resolvedAccount.groups.join(' ')}`.toLowerCase();
  return haystack.includes(`fail-demo:${stepName}`) || haystack.includes('fail-demo');
}

export function createSimulatedZohoClient() {
  return {
    mode: 'simulated',

    async createUser({ resolvedAccount, employeeName }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'create_user')) {
        throw new Error('Simulated failure: Zoho Directory rejected user creation.');
      }
      return { zohoUserId: `sim-user-${Buffer.from(resolvedAccount.corporateEmail).toString('hex').slice(0, 12)}`, employeeName };
    },

    async enableMail({ resolvedAccount }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'enable_mail')) {
        throw new Error('Simulated failure: Zoho Mail could not be enabled for this user.');
      }
      return { mailEnabled: true };
    },

    async assignGroup({ resolvedAccount, group }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'assign_group')) {
        throw new Error(`Simulated failure: could not assign group "${group}".`);
      }
      return { group, assigned: true };
    },

    async verifyConfiguration({ resolvedAccount }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'verify')) {
        throw new Error('Simulated failure: final configuration verification did not match expected state.');
      }
      return { verified: true };
    },

    async deactivateUser({ resolvedAccount }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'deactivate')) {
        throw new Error('Simulated failure: could not deactivate Zoho user.');
      }
      return { deactivated: true };
    },
  };
}

/**
 * Live Zoho Directory client using OAuth refresh-token exchange.
 * Requires ZOHO_DC, ZOHO_ORG_ID, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET,
 * ZOHO_REFRESH_TOKEN (see backend/.env.example).
 */
export function createLiveZohoClient(config) {
  const { ZOHO_DC, ZOHO_ORG_ID, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = config;
  const accountsBase = `https://accounts.zoho.${ZOHO_DC}`;
  const directoryBase = `https://directory.zoho.${ZOHO_DC}/api/v1`;

  let cachedToken = null;
  let cachedTokenExpiresAt = 0;

  async function getAccessToken() {
    if (cachedToken && Date.now() < cachedTokenExpiresAt - 30_000) return cachedToken;
    const params = new URLSearchParams({
      refresh_token: ZOHO_REFRESH_TOKEN,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      grant_type: 'refresh_token',
    });
    const response = await fetch(`${accountsBase}/oauth/v2/token`, { method: 'POST', body: params });
    if (!response.ok) {
      throw new Error(`Zoho OAuth token refresh failed: ${response.status} ${await response.text()}`);
    }
    const data = await response.json();
    cachedToken = data.access_token;
    cachedTokenExpiresAt = Date.now() + Number(data.expires_in ?? 3600) * 1000;
    return cachedToken;
  }

  async function request(path, options = {}) {
    const accessToken = await getAccessToken();
    const response = await fetch(`${directoryBase}${path}`, {
      ...options,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Zoho Directory API ${options.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
    }
    return response.status === 204 ? null : response.json();
  }

  return {
    mode: 'live',

    async createUser({ resolvedAccount, employeeName, submission }) {
      const [firstName, ...rest] = employeeName.split(' ');
      const body = {
        first_name: firstName,
        last_name: rest.join(' ') || firstName,
        email_id: resolvedAccount.corporateEmail,
        // Zoho Directory requires a personal/secondary email for account
        // recovery; use the employee's private email collected on the form.
        secondary_email: submission?.privateEmail,
      };
      const created = await request(`/organizations/${ZOHO_ORG_ID}/users`, { method: 'POST', body: JSON.stringify(body) });
      return { zohoUserId: created?.data?.user_id ?? created?.user_id, employeeName };
    },

    async enableMail({ resolvedAccount, zohoUserId }) {
      await request(`/organizations/${ZOHO_ORG_ID}/users/${zohoUserId}/mail`, { method: 'POST', body: JSON.stringify({ enabled: true }) });
      return { mailEnabled: true };
    },

    async assignGroup({ zohoUserId, group }) {
      await request(`/organizations/${ZOHO_ORG_ID}/groups/${encodeURIComponent(group)}/users`, {
        method: 'POST',
        body: JSON.stringify({ user_id: zohoUserId, role: 'Member' }),
      });
      return { group, assigned: true };
    },

    async verifyConfiguration({ zohoUserId }) {
      const current = await request(`/organizations/${ZOHO_ORG_ID}/users/${zohoUserId}`);
      return { verified: Boolean(current) };
    },

    async deactivateUser({ zohoUserId }) {
      await request(`/organizations/${ZOHO_ORG_ID}/users/${zohoUserId}`, { method: 'PATCH', body: JSON.stringify({ status: 'inactive' }) });
      return { deactivated: true };
    },
  };
}

export function createZohoClient(config) {
  return config.ZOHO_MODE === 'live' ? createLiveZohoClient(config) : createSimulatedZohoClient();
}
