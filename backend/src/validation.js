const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const requiredFields = [
  'nameAndSurname', 'privateEmail', 'country', 'department', 'jobPosition'
];

export function validateSubmission(input = {}) {
  const errors = {};
  for (const field of requiredFields) {
    if (!String(input[field] ?? '').trim()) errors[field] = 'This field is required.';
  }
  for (const field of ['privateEmail']) {
    if (input[field] && !EMAIL.test(input[field])) errors[field] = 'Enter a valid email address.';
  }
  if (isDevelopment(input.department)) {
    if (!String(input.githubProfile ?? '').trim()) errors.githubProfile = 'GitHub profile is required for Development.';
    if (!String(input.githubRepos ?? '').trim()) errors.githubRepos = 'At least one GitHub repository is required for Development.';
  }
  return errors;
}

export function validateSubmissionPatch(input = {}) {
  const errors = {};
  if (input.privateEmail && !EMAIL.test(input.privateEmail)) errors.privateEmail = 'Enter a valid email address.';
  return errors;
}

export const auditorConfigurationFields = ['team', 'managerEmail', 'requestType', 'emailAddress', 'subTeam'];

export function validateAuditorConfiguration(input = {}) {
  const errors = {};
  for (const field of auditorConfigurationFields) {
    if (!String(input[field] ?? '').trim()) errors[field] = 'This field is required.';
  }
  for (const field of ['managerEmail', 'emailAddress']) {
    if (input[field] && !EMAIL.test(input[field])) errors[field] = 'Enter a valid email address.';
  }
  return errors;
}

export function validateAuditorConfigurationPatch(input = {}) {
  const errors = {};
  for (const field of ['managerEmail', 'emailAddress']) {
    if (input[field] && !EMAIL.test(input[field])) errors[field] = 'Enter a valid email address.';
  }
  return errors;
}

export function isDevelopment(department) {
  return ['dev', 'development'].includes(String(department ?? '').trim().toLowerCase());
}
