/**
 * The two kinds of access an auditor can resolve a request to.
 *
 * `ZOHO` is the original, fully-automated path: the provisioning service
 * calls the Zoho Directory client to create/deactivate a real account.
 *
 * `INSIDEMAPS` is a placeholder for a not-yet-built integration: the
 * employee is expected to sign up on the InsideMaps website themselves.
 * There is no InsideMaps API to call yet, so the provisioning service just
 * records that access was requested/revoked instead of contacting Zoho.
 * When that API exists, only `services/provisioning.js`'s INSIDEMAPS step
 * handlers should need to change.
 */
export const ACCOUNT_TYPE = {
  ZOHO: 'ZOHO',
  INSIDEMAPS: 'INSIDEMAPS',
};

export const ACCOUNT_TYPES = Object.values(ACCOUNT_TYPE);

export function isAccountType(value) {
  return ACCOUNT_TYPES.includes(value);
}
