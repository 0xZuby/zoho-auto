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

/**
 * Generates a proposed corporate email address and records collision details.
 * Per Epic 2 (Provisioning rules): collisions are checked against existing
 * accounts; the next available suffix beginning with 2 is used; adjusted
 * addresses are recorded and surfaced.
 */
export function proposeCorporateEmailWithCollision(fullName, domain, existingEmails = []) {
  const parts = slugifyName(fullName);
  const local = parts.length >= 2
    ? `${parts[0]}.${parts[parts.length - 1]}`
    : (parts[0] || 'new.employee');

  const sanitizedLocal = local.replace(/[^a-z0-9.]/g, '') || 'new.employee';
  const takenEmails = new Set(existingEmails.map((email) => String(email).toLowerCase()));

  const baseEmail = `${sanitizedLocal}@${domain}`;
  let candidate = baseEmail;
  let suffix = 2;
  let collisionAdjusted = false;
  while (takenEmails.has(candidate.toLowerCase())) {
    collisionAdjusted = true;
    candidate = `${sanitizedLocal}${suffix}@${domain}`;
    suffix += 1;
  }

  return {
    corporateEmail: candidate,
    baseEmail,
    collisionAdjusted,
    collisionSuffix: collisionAdjusted ? suffix - 1 : null,
  };
}

export function proposeCorporateEmail(fullName, domain, existingEmails = []) {
  return proposeCorporateEmailWithCollision(fullName, domain, existingEmails).corporateEmail;
}
