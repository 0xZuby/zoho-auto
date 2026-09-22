import {
  COUNTRIES,
  DEPARTMENTS,
  JOB_POSITIONS,
  OTHER_VALUE,
  REQUEST_TYPES,
  SUB_TEAMS,
  TEAMS,
  isDevelopmentDepartment,
} from '../config/catalog.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUEST_TYPE_VALUES = new Set(REQUEST_TYPES.map((option) => option.value));

/**
 * Server-side validation for the three-stage onboarding form.
 *
 * The frontend duplicates this validation for immediate feedback as the
 * employee moves between stages, but every rule here is re-checked at
 * submission time because client-side validation is only a UX convenience,
 * never a security or data-integrity control.
 *
 * Stage 1 - Request
 *   requesterEmail, requestType
 * Stage 2 - Employee & placement
 *   nameAndSurname, privateEmail, country(+other), department(+other),
 *   team(+other), subTeam(+other), jobPosition(+other), managerEmail
 * Stage 3 - Developer access (conditional) + review
 *   githubProfile, githubRepositories (required only when department is a
 *   development department; always optional otherwise)
 */

function trimmed(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function requireField(errors, field, value, message) {
  if (!trimmed(value)) errors[field] = message;
}

function requireEmail(errors, field, value, message) {
  const value_ = trimmed(value);
  if (!value_) {
    errors[field] = message;
    return;
  }
  if (!EMAIL_PATTERN.test(value_)) {
    errors[field] = 'Enter a valid email address.';
  }
}

/**
 * Validates a "choice + other" field pair. When `value` is the sentinel
 * OTHER_VALUE, the paired free-text field becomes required.
 */
function requireChoice(errors, field, value, otherField, otherValue, allowedOptions, label) {
  const value_ = trimmed(value);
  if (!value_) {
    errors[field] = `Select a ${label.toLowerCase()}.`;
    return;
  }
  if (!allowedOptions.includes(value_) && value_ !== OTHER_VALUE) {
    errors[field] = `Select a valid ${label.toLowerCase()}.`;
    return;
  }
  if (value_ === OTHER_VALUE && !trimmed(otherValue)) {
    errors[otherField] = `Enter a value for "${label} — Other".`;
  }
}

export function resolveChoiceValue(value, otherValue) {
  const value_ = trimmed(value);
  if (value_ === OTHER_VALUE) return trimmed(otherValue);
  return value_;
}

/** Validates employee-info fields shared by the public form and auditor edits. */
export function validateEmployeeInfoEdit(input = {}) {
  const errors = {};

  requireField(errors, 'nameAndSurname', input.nameAndSurname, 'Enter the employee name and surname.');
  requireEmail(errors, 'privateEmail', input.privateEmail, "Enter the employee's private email address.");

  requireChoice(errors, 'country', input.country, 'countryOther', input.countryOther, COUNTRIES, 'Country');
  requireChoice(errors, 'department', input.department, 'departmentOther', input.departmentOther, DEPARTMENTS, 'Department');
  requireChoice(errors, 'team', input.team, 'teamOther', input.teamOther, TEAMS, 'Team');
  requireChoice(errors, 'subTeam', input.subTeam, 'subTeamOther', input.subTeamOther, SUB_TEAMS, 'Sub team');
  requireChoice(errors, 'jobPosition', input.jobPosition, 'jobPositionOther', input.jobPositionOther, JOB_POSITIONS, 'Job position');

  requireEmail(errors, 'managerEmail', input.managerEmail, 'Enter the Team Lead / Manager email.');

  const resolvedDepartment = resolveChoiceValue(input.department, input.departmentOther);
  if (isDevelopmentDepartment(resolvedDepartment)) {
    requireField(errors, 'githubProfile', input.githubProfile, 'GitHub profile link/name is required for the Development department.');
    requireField(errors, 'githubRepositories', input.githubRepositories, 'At least one GitHub repository is required for the Development department.');
  }

  return errors;
}

/** Validates the full onboarding submission (all three stages combined). */
export function validateOnboardingSubmission(input = {}) {
  const errors = {};

  requireEmail(errors, 'requesterEmail', input.requesterEmail, 'Enter the requester email.');
  if (!REQUEST_TYPE_VALUES.has(trimmed(input.requestType))) {
    errors.requestType = 'Select a request type.';
  }

  return { ...errors, ...validateEmployeeInfoEdit(input) };
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
