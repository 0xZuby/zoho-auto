/**
 * Deterministic provisioning rules engine (PRD "Rules Engine" + "Security
 * Boundary" sections).
 *
 * This module takes an employee's submitted Department / Team / Sub-team /
 * Job position and returns a *proposed* Zoho role and group list. It is a
 * plain lookup table, not a model, and contains no AI or probabilistic
 * decision-making: the same input always produces the same output, and the
 * mapping is fully readable/auditable by editing this file.
 *
 * Crucially, this proposal is advisory only. The security boundary is
 * enforced in the domain layer (see domain/requests.js): an employee's own
 * submission can never be provisioned directly. An auditor must review this
 * proposal and explicitly approve the resolved role/groups before a Zoho
 * account is created, and the auditor may override any of these values.
 */

const BASE_GROUPS = ['All Employees'];

const DEPARTMENT_GROUPS = {
  'service delivery': ['Service Delivery'],
  sales: ['Sales'],
  '3d': ['3D Production'],
  development: ['Engineering'],
  developement: ['Engineering'],
};

const TEAM_GROUPS = {
  operations: ['Operations'],
  invision: ['Invision'],
  'hoa data': ['HOA Data'],
  'hoa amenity photography': ['HOA Amenity Photography'],
  scheduling: ['Scheduling'],
  'customer support': ['Customer Support'],
  'invoicing team': ['Invoicing'],
  business: ['Business'],
  modeler: ['Modeler'],
  'data science': ['Data Science'],
  web: ['Web'],
  'product development': ['Product Development'],
  'personal assistant': ['Personal Assistant'],
  'account managers': ['Account Managers'],
  'associate sales': ['Associate Sales'],
  hr: ['HR'],
  'office support and security': ['Office Support and Security'],
  ios: ['iOS'],
  'computer vision': ['Computer Vision'],
  admin: ['Admin'],
};

const JOB_POSITION_ROLE = {
  operator: 'Standard User',
  'squad lead': 'Team Lead',
  'team leader': 'Team Lead',
  modeler: 'Standard User',
  'modeler team lead': 'Team Lead',
};

const DEFAULT_ROLE = 'Standard User (Pending Auditor Review)';

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/**
 * @param {{ department?: string, team?: string, subTeam?: string, jobPosition?: string }} attributes
 * @returns {{ role: string, groups: string[], needsReview: boolean, reasons: string[] }}
 */
export function proposeAccountConfiguration(attributes = {}) {
  const department = normalize(attributes.department);
  const team = normalize(attributes.team);
  const jobPosition = normalize(attributes.jobPosition);

  const reasons = [];
  let needsReview = false;

  const departmentGroups = DEPARTMENT_GROUPS[department];
  if (!departmentGroups) {
    needsReview = true;
    reasons.push(`No group mapping found for department "${attributes.department ?? ''}".`);
  }

  const teamGroups = TEAM_GROUPS[team];
  if (!teamGroups) {
    needsReview = true;
    reasons.push(`No group mapping found for team "${attributes.team ?? ''}".`);
  }

  const role = JOB_POSITION_ROLE[jobPosition];
  if (!role) {
    needsReview = true;
    reasons.push(`No role mapping found for job position "${attributes.jobPosition ?? ''}".`);
  }

  const groups = uniqueSorted([...BASE_GROUPS, ...(departmentGroups ?? []), ...(teamGroups ?? [])]);

  return {
    role: role ?? DEFAULT_ROLE,
    groups,
    needsReview,
    reasons,
  };
}
