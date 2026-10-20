/**
 * Zoho Mail provisioning adapter.
 *
 * Accounts are created directly as Zoho Mail mailboxes (Zoho Mail
 * Organization Accounts API) — no invitation email, no Directory groups and
 * no role assignment. A random one-time password is set at creation with
 * `oneTimePassword: true`, so Zoho forces a password change on first login.
 *
 * In `simulated` mode (the default — see ZOHO_MODE in .env.example) no
 * network calls are made. Each step resolves after a short delay and always
 * succeeds, EXCEPT for a request whose corporate email (or role) contains
 * the literal substring "fail-demo" (case-insensitive), which is reserved
 * for exercising the partial-provisioning-and-retry flow described in PRD
 * section 15 without depending on real Zoho state.
 *
 * `live` mode targets https://mail.zoho.<ZOHO_DC>/api/organization/<zoid>/accounts.
 * It sits behind the same interface so the provisioning engine (see
 * services/provisioning.js) never needs to know which mode is active.
 */

import { randomInt } from 'node:crypto';

const STEP_DELAY_MS = 350;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateFailure(resolvedAccount, stepName) {
  const haystack = `${resolvedAccount.corporateEmail ?? ''} ${resolvedAccount.role ?? ''}`.toLowerCase();
  return haystack.includes(`fail-demo:${stepName}`) || haystack.includes('fail-demo');
}

/** Random password meeting Zoho's complexity rules (upper, lower, digit, symbol). */
export function generateTemporaryPassword(length = 16) {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%^&*-_=+'];
  const all = sets.join('');
  const chars = sets.map((set) => set[randomInt(set.length)]);
  while (chars.length < length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function createSimulatedZohoClient() {
  return {
    mode: 'simulated',

    async createUser({ resolvedAccount, employeeName }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'create_user')) {
        throw new Error('Simulated failure: Zoho Mail rejected mailbox creation.');
      }
      return {
        zohoUserId: `sim-user-${Buffer.from(resolvedAccount.corporateEmail).toString('hex').slice(0, 12)}`,
        employeeName,
        temporaryPassword: generateTemporaryPassword(),
      };
    },

    async deleteUser({ resolvedAccount, zohoUserId }) {
      await delay(STEP_DELAY_MS);
      if (shouldSimulateFailure(resolvedAccount, 'delete_user') || shouldSimulateFailure(resolvedAccount, 'deactivate')) {
        throw new Error('Simulated failure: could not delete/disable Zoho user.');
      }
      return { zohoUserId, deleted: true, deactivated: true, sessionsRevoked: true };
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
      return { deactivated: true, sessionsRevoked: true };
    },
  };
}

/**
 * Live Zoho Mail client using an OAuth refresh-token exchange.
 * Requires ZOHO_DC, ZOHO_ORG_ID (the Zoho Mail organization id, "zoid"),
 * ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 * (see backend/.env.example). The refresh token needs the scope
 * ZohoMail.organization.accounts.ALL.
 */
export function createLiveZohoClient(config) {
  const { ZOHO_DC, ZOHO_ORG_ID, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = config;
  const accountsBase = `https://accounts.zoho.${ZOHO_DC}`;
  const mailBase = `https://mail.zoho.${ZOHO_DC}/api/organization/${ZOHO_ORG_ID}`;

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
    if (!data.access_token) {
      throw new Error(`Zoho OAuth token refresh failed: ${data.error ?? 'no access_token in response'}`);
    }
    cachedToken = data.access_token;
    cachedTokenExpiresAt = Date.now() + Number(data.expires_in ?? 3600) * 1000;
    return cachedToken;
  }

  async function request(path, options = {}) {
    const accessToken = await getAccessToken();
    const response = await fetch(`${mailBase}${path}`, {
      ...options,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
    });
    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }
    // Zoho Mail can answer HTTP 200 with a non-200 status in the JSON body.
    const bodyStatus = payload?.status?.code;
    if (!response.ok || (bodyStatus && bodyStatus !== 200)) {
      throw new Error(`Zoho Mail API ${options.method ?? 'GET'} ${path || '/accounts'} failed: ${response.status} ${text}`);
    }
    return payload;
  }

  function splitName(employeeName) {
    const [firstName, ...rest] = String(employeeName ?? '').trim().split(/\s+/);
    return { firstName, lastName: rest.join(' ') || firstName };
  }

  async function findAccountByEmail(email) {
    const target = String(email).toLowerCase();
    for (let start = 0; start < 5000; start += 200) {
      const page = await request(`/accounts?start=${start}&limit=200`);
      const accounts = page?.data?.accounts ?? page?.data ?? [];
      const found = accounts.find((account) =>
        [account.primaryEmailAddress, account.mailboxAddress, account.emailAddress]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase() === target),
      );
      if (found) return found;
      if (accounts.length < 200) return null;
    }
    return null;
  }

  return {
    mode: 'live',

    async createUser({ resolvedAccount, employeeName }) {
      const { firstName, lastName } = splitName(employeeName);
      const temporaryPassword = generateTemporaryPassword();
      const created = await request('/accounts', {
        method: 'POST',
        body: JSON.stringify({
          primaryEmailAddress: resolvedAccount.corporateEmail,
          password: temporaryPassword,
          firstName,
          lastName,
          displayName: employeeName,
          role: 'member',
          oneTimePassword: true,
        }),
      });
      const zuid = created?.data?.zuid ?? created?.data?.accountId;
      if (!zuid) throw new Error('Zoho Mail created the mailbox but returned no account id.');
      return { zohoUserId: String(zuid), employeeName, temporaryPassword };
    },

    async verifyConfiguration({ resolvedAccount, zohoUserId }) {
      const found = zohoUserId
        ? await request(`/accounts/${encodeURIComponent(zohoUserId)}`)
        : await findAccountByEmail(resolvedAccount.corporateEmail);
      return { verified: Boolean(found) };
    },

    async deleteUser({ resolvedAccount, zohoUserId }) {
      await request('/accounts', {
        method: 'DELETE',
        body: JSON.stringify(zohoUserId ? { accountList: [Number(zohoUserId)] } : { emailList: [resolvedAccount.corporateEmail] }),
      });
      return { zohoUserId, deleted: true, deactivated: true, sessionsRevoked: true };
    },

    async deactivateUser({ resolvedAccount, zohoUserId }) {
      const zuid = zohoUserId ?? (await findAccountByEmail(resolvedAccount.corporateEmail))?.zuid;
      if (!zuid) throw new Error(`No Zoho mailbox found for ${resolvedAccount.corporateEmail}.`);
      await request(`/accounts/${encodeURIComponent(zuid)}`, {
        method: 'PUT',
        body: JSON.stringify({ zuid: Number(zuid), mode: 'disableUser' }),
      });
      return { deactivated: true, sessionsRevoked: true };
    },
  };
}

export function createZohoClient(config) {
  return config.ZOHO_MODE === 'live' ? createLiveZohoClient(config) : createSimulatedZohoClient();
}
