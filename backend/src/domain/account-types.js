/**
 * What an auditor can resolve a request to.
 *
 * `ZOHO` creates only the Zoho Mail mailbox, directly (no invitation, no
 * groups, no Directory role).
 *
 * `INSIDEMAPS` creates only an InsideMaps account with the chosen roles.
 *
 * `ZOHO_AND_INSIDEMAPS` does both: the mailbox first, then the InsideMaps
 * account + roles.
 */
export const ACCOUNT_TYPE = {
  ZOHO: 'ZOHO',
  INSIDEMAPS: 'INSIDEMAPS',
  ZOHO_AND_INSIDEMAPS: 'ZOHO_AND_INSIDEMAPS',
};

export const ACCOUNT_TYPES = Object.values(ACCOUNT_TYPE);

export function isAccountType(value) {
  return ACCOUNT_TYPES.includes(value);
}

export function includesZoho(accountType) {
  return accountType !== ACCOUNT_TYPE.INSIDEMAPS;
}

export function includesInsideMaps(accountType) {
  return accountType === ACCOUNT_TYPE.INSIDEMAPS || accountType === ACCOUNT_TYPE.ZOHO_AND_INSIDEMAPS;
}

export function accountTypeFromFlags({ zoho, insideMaps }) {
  if (zoho && insideMaps) return ACCOUNT_TYPE.ZOHO_AND_INSIDEMAPS;
  return insideMaps ? ACCOUNT_TYPE.INSIDEMAPS : ACCOUNT_TYPE.ZOHO;
}
