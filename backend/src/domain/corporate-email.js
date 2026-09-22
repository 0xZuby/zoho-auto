/**
 * Generates a proposed corporate email address from an employee's full name.
 *
 * This is only ever a *proposal* shown to the auditor (PRD sections 9-11):
 * the auditor can edit it before creating the Zoho account, and collisions
 * are resolved by appending a numeric suffix based on existing corporate
 * emails already recorded for other requests.
 */
export function slugifyName(fullName) {
  return String(fullName ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function proposeCorporateEmail(fullName, domain, existingEmails = []) {
  const parts = slugifyName(fullName);
  const local = parts.length >= 2
    ? `${parts[0]}.${parts[parts.length - 1]}`
    : (parts[0] || 'new.employee');

  const sanitizedLocal = local.replace(/[^a-z0-9.]/g, '');
  const takenEmails = new Set(existingEmails.map((email) => String(email).toLowerCase()));

  let candidate = `${sanitizedLocal}@${domain}`;
  let suffix = 1;
  while (takenEmails.has(candidate.toLowerCase())) {
    candidate = `${sanitizedLocal}${suffix}@${domain}`;
    suffix += 1;
  }
  return candidate;
}
