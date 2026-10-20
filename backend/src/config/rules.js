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

import { ACCOUNT_TYPE } from '../domain/account-types.js';

const BASE_GROUPS = ['All Employees'];

const DEFAULT_DEPARTMENT_GROUPS = {
  'service delivery': ['Service Delivery'],
  sales: ['Sales'],
  '3d': ['3D Production'],
  development: ['Engineering'],
  developement: ['Engineering'],
};

const DEFAULT_TEAM_GROUPS = {
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

const DEFAULT_POSITION_MAPPINGS = [
  { position: 'Operator', accountType: ACCOUNT_TYPE.ZOHO, role: 'Standard User', insideMapsRoles: ['Operator'], active: true },
  { position: 'Squad lead', accountType: ACCOUNT_TYPE.ZOHO, role: 'Team Lead', insideMapsRoles: ['Squad Lead'], active: true },
  { position: 'Team leader', accountType: ACCOUNT_TYPE.ZOHO, role: 'Team Lead', insideMapsRoles: ['Team Leader'], active: true },
  { position: 'Modeler', accountType: ACCOUNT_TYPE.INSIDEMAPS, role: 'Standard User', insideMapsRoles: ['Modeler'], active: true },
  { position: 'Modeler Team Lead', accountType: ACCOUNT_TYPE.ZOHO, role: 'Team Lead', insideMapsRoles: ['Modeler Team Lead'], active: true },
];

const DEFAULT_DOMAIN_RULE = {
  defaultDomain: 'insidemaps.com',
  operationsDomain: 'services.insidemaps.com',
  operationsTeams: ['Operations'],
};

const DEFAULT_ROLE = 'Standard User (Pending Auditor Review)';

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function getDefaultProvisioningRules(corporateEmailDomain = 'insidemaps.com') {
  return {
    version: 1,
    updatedAt: null,
    updatedBy: null,
    baseGroups: [...BASE_GROUPS],
    defaultRole: DEFAULT_ROLE,
    domainRule: {
      defaultDomain: corporateEmailDomain || DEFAULT_DOMAIN_RULE.defaultDomain,
      operationsDomain: DEFAULT_DOMAIN_RULE.operationsDomain,
      operationsTeams: [...DEFAULT_DOMAIN_RULE.operationsTeams],
    },
    positionMappings: DEFAULT_POSITION_MAPPINGS.map((mapping) => ({ ...mapping, insideMapsRoles: [...mapping.insideMapsRoles] })),
    departmentGroups: { ...DEFAULT_DEPARTMENT_GROUPS },
    teamGroups: { ...DEFAULT_TEAM_GROUPS },
  };
}

export function resolveCorporateDomain(attributes = {}, rulesConfig = null, fallbackDefaultDomain = 'insidemaps.com') {
  const domainRule = rulesConfig?.domainRule ?? {
    ...DEFAULT_DOMAIN_RULE,
    defaultDomain: fallbackDefaultDomain || DEFAULT_DOMAIN_RULE.defaultDomain,
  };
  const team = normalize(attributes.team);
  const opsTeams = (domainRule.operationsTeams ?? DEFAULT_DOMAIN_RULE.operationsTeams).map(normalize);
  if (team && opsTeams.includes(team)) {
    return domainRule.operationsDomain || DEFAULT_DOMAIN_RULE.operationsDomain;
  }
  return domainRule.defaultDomain || fallbackDefaultDomain || DEFAULT_DOMAIN_RULE.defaultDomain;
}

/**
 * @param {{ department?: string, team?: string, subTeam?: string, jobPosition?: string }} attributes
 * @param {object} [rulesConfig]
 * @returns {{ role: string, groups: string[], accountType: string, insideMapsRoles: string[], domain: string, needsReview: boolean, reasons: string[] }}
 */
export function proposeAccountConfiguration(attributes = {}, rulesConfig = null) {
  const department = normalize(attributes.department);
  const team = normalize(attributes.team);
  const jobPosition = normalize(attributes.jobPosition);

  const departmentGroupsMap = rulesConfig?.departmentGroups ?? DEFAULT_DEPARTMENT_GROUPS;
  const teamGroupsMap = rulesConfig?.teamGroups ?? DEFAULT_TEAM_GROUPS;
  const positionMappings = rulesConfig?.positionMappings ?? DEFAULT_POSITION_MAPPINGS;

  const reasons = [];
  let needsReview = false;

  const departmentGroups = departmentGroupsMap[department];
  if (!departmentGroups) {
    needsReview = true;
    reasons.push(`No group mapping found for department "${attributes.department ?? ''}".`);
  }

  const teamGroups = teamGroupsMap[team];
  if (!teamGroups) {
    needsReview = true;
    reasons.push(`No group mapping found for team "${attributes.team ?? ''}".`);
  }

  const matchedPosition = positionMappings.find(
    (entry) => entry.active !== false && normalize(entry.position) === jobPosition,
  );
  if (!matchedPosition) {
    needsReview = true;
    reasons.push(`No active account-type or role mapping found for job position "${attributes.jobPosition ?? ''}".`);
  }

  const groups = uniqueSorted([...BASE_GROUPS, ...(departmentGroups ?? []), ...(teamGroups ?? [])]);
  const domain = resolveCorporateDomain(attributes, rulesConfig);

  return {
    role: matchedPosition?.role ?? DEFAULT_ROLE,
    groups,
    accountType: matchedPosition?.accountType ?? ACCOUNT_TYPE.ZOHO,
    insideMapsRoles: matchedPosition?.insideMapsRoles ?? (matchedPosition?.role ? [matchedPosition.role] : []),
    domain,
    needsReview,
    reasons,
  };
}
