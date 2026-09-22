/**
 * Field catalog for the public onboarding form.
 *
 * This is the single source of truth for every dropdown option in the form,
 * taken verbatim from the organization's existing "New hire / leave request"
 * form. The frontend fetches this from GET /api/form/catalog instead of
 * hardcoding option lists, so updating this file is the only place needed to
 * change what employees can select.
 *
 * Every "choice" field also accepts a free-text "Other" value (matching the
 * source form's "Other:" option), captured in a companion `<field>Other`
 * value when `<field>` is set to the literal string "Other".
 */

export const OTHER_VALUE = 'Other';

export const REQUEST_TYPES = [
  { value: 'NEW_HIRE', label: 'New hire' },
  { value: 'LEAVING_COMPANY', label: 'Leaving company' },
  { value: 'UPDATE_EMPLOYEE_INFO', label: 'Update employee info' },
];

export const COUNTRIES = ['Ukraine', 'Bangladesh', 'Serbia', 'US'];

export const DEPARTMENTS = ['Service Delivery', 'Sales', '3D', 'Development'];

export const TEAMS = [
  'Operations',
  'Invision',
  'HOA Data',
  'HOA Amenity Photography',
  'Scheduling',
  'Customer Support',
  'Invoicing team',
  'Business',
  'Modeler',
  'Data science',
  'Web',
  'Product development',
  'Personal assistant',
  'Account Managers',
  'Associate sales',
  'HR',
  'Office support and security',
  'iOS',
  'Computer Vision',
  'Admin',
];

export const SUB_TEAMS = [
  'Geometry',
  'Capture',
  '3D Staging',
  'PS Team',
  '3D&Front',
  'Design',
  'Product',
  'Backend & Infrastructure',
  'Front & Ops tools',
  'HR',
];

export const JOB_POSITIONS = [
  'Operator',
  'Squad lead',
  'Team leader',
  'Modeler',
  'Modeler Team Lead',
];

/** Department values (case-insensitive) that unlock the GitHub-only fields. */
export const DEVELOPMENT_DEPARTMENT_VALUES = new Set(['3d', 'development', 'developement']);

export function isDevelopmentDepartment(departmentValue) {
  return DEVELOPMENT_DEPARTMENT_VALUES.has(String(departmentValue ?? '').trim().toLowerCase());
}

export function getFormCatalog() {
  return {
    requestTypes: REQUEST_TYPES,
    countries: withOther(COUNTRIES),
    departments: withOther(DEPARTMENTS),
    teams: withOther(TEAMS),
    subTeams: withOther(SUB_TEAMS),
    jobPositions: withOther(JOB_POSITIONS),
    otherValue: OTHER_VALUE,
  };
}

function withOther(options) {
  return [...options, OTHER_VALUE];
}
