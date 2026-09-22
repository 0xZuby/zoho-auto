import type { FormCatalog, FormFieldErrors, OnboardingFormValues } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Client-side mirror of backend/src/domain/validation.js, scoped per stage
 * so the wizard can validate "this stage only" before advancing while the
 * server still re-validates the complete payload at submission time.
 */

export function isDevelopmentDepartment(resolvedDepartment: string): boolean {
  return ['3d', 'development', 'developement'].includes(resolvedDepartment.trim().toLowerCase());
}

export function resolveChoiceValue(value: string, otherValue: string, otherSentinel: string): string {
  return value === otherSentinel ? otherValue.trim() : value.trim();
}

function requireChoice(
  errors: FormFieldErrors,
  field: keyof OnboardingFormValues,
  value: string,
  otherField: keyof OnboardingFormValues,
  otherValue: string,
  options: string[],
  otherSentinel: string,
  label: string,
) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    errors[field] = `Select a ${label.toLowerCase()}.`;
    return;
  }
  if (!options.includes(trimmedValue) && trimmedValue !== otherSentinel) {
    errors[field] = `Select a valid ${label.toLowerCase()}.`;
    return;
  }
  if (trimmedValue === otherSentinel && !otherValue.trim()) {
    errors[otherField] = `Enter a value for "${label} — Other".`;
  }
}

function requireEmail(errors: FormFieldErrors, field: keyof OnboardingFormValues, value: string, message: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    errors[field] = message;
    return;
  }
  if (!EMAIL_PATTERN.test(trimmedValue)) {
    errors[field] = 'Enter a valid email address.';
  }
}

export function validateStageOne(values: OnboardingFormValues, errors: FormFieldErrors = {}): FormFieldErrors {
  requireEmail(errors, 'requesterEmail', values.requesterEmail, 'Enter the requester email.');
  if (!values.requestType) errors.requestType = 'Select a request type.';
  return errors;
}

export function validateStageTwo(values: OnboardingFormValues, catalog: FormCatalog, errors: FormFieldErrors = {}): FormFieldErrors {
  if (!values.nameAndSurname.trim()) errors.nameAndSurname = 'Enter the employee name and surname.';
  requireEmail(errors, 'privateEmail', values.privateEmail, "Enter the employee's private email address.");

  requireChoice(errors, 'country', values.country, 'countryOther', values.countryOther, catalog.countries, catalog.otherValue, 'Country');
  requireChoice(errors, 'department', values.department, 'departmentOther', values.departmentOther, catalog.departments, catalog.otherValue, 'Department');
  requireChoice(errors, 'team', values.team, 'teamOther', values.teamOther, catalog.teams, catalog.otherValue, 'Team');
  requireChoice(errors, 'subTeam', values.subTeam, 'subTeamOther', values.subTeamOther, catalog.subTeams, catalog.otherValue, 'Sub team');
  requireChoice(errors, 'jobPosition', values.jobPosition, 'jobPositionOther', values.jobPositionOther, catalog.jobPositions, catalog.otherValue, 'Job position');

  requireEmail(errors, 'managerEmail', values.managerEmail, 'Enter the Team Lead / Manager email.');
  return errors;
}

export function validateStageThree(values: OnboardingFormValues, catalog: FormCatalog, errors: FormFieldErrors = {}): FormFieldErrors {
  const resolvedDepartment = resolveChoiceValue(values.department, values.departmentOther, catalog.otherValue);
  if (isDevelopmentDepartment(resolvedDepartment)) {
    if (!values.githubProfile.trim()) errors.githubProfile = 'GitHub profile link/name is required for the Development department.';
    if (!values.githubRepositories.trim()) errors.githubRepositories = 'At least one GitHub repository is required for the Development department.';
  }
  return errors;
}

export function validateFullSubmission(values: OnboardingFormValues, catalog: FormCatalog): FormFieldErrors {
  let errors: FormFieldErrors = {};
  errors = validateStageOne(values, errors);
  errors = validateStageTwo(values, catalog, errors);
  errors = validateStageThree(values, catalog, errors);
  return errors;
}
