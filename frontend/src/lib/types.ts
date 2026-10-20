/**
 * Types mirroring the Express API's response shapes (backend/src/domain,
 * backend/src/config/catalog.js). Kept as a single hand-maintained file
 * rather than generated OpenAPI types, matching the backend's small,
 * stable surface area.
 */

export type RequestType = 'NEW_HIRE' | 'LEAVING_COMPANY' | 'UPDATE_EMPLOYEE_INFO';

export interface CatalogOption {
  value: string;
  label: string;
}

export interface FormCatalog {
  requestTypes: CatalogOption[];
  countries: string[];
  departments: string[];
  teams: string[];
  subTeams: string[];
  jobPositions: string[];
  roles?: string[];
  otherValue: string;
}

/** Values collected across all three onboarding-form stages. */
export interface OnboardingFormValues {
  requesterEmail: string;
  requestType: RequestType | '';

  nameAndSurname: string;
  privateEmail: string;

  country: string;
  countryOther: string;
  department: string;
  departmentOther: string;
  team: string;
  teamOther: string;
  subTeam: string;
  subTeamOther: string;
  jobPosition: string;
  jobPositionOther: string;

  managerEmail: string;

  startDate: string;

  githubProfile: string;
  githubRepositories: string;
}

export type FormFieldErrors = Partial<Record<keyof OnboardingFormValues, string>>;

export type WorkflowStatus =
  | 'INVITED'
  | 'FORM_OPENED'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PROVISIONING'
  | 'ACCOUNT_CREATED'
  | 'NOTIFICATION_SENT'
  | 'COMPLETED'
  | 'ACCESS_REVOKED'
  | 'SCHEDULED_OFFBOARDING'
  | 'REJECTED'
  | 'RETURNED'
  | 'PROVISIONING_FAILED'
  | 'PARTIALLY_PROVISIONED'
  | 'CANCELLED';

export type AccountType = 'ZOHO' | 'INSIDEMAPS' | 'ZOHO_AND_INSIDEMAPS';

export type LifecycleStageState = 'done' | 'current' | 'blocked' | 'failed' | 'skipped' | 'pending';

export interface LifecycleStage {
  key: 'SUBMITTED' | 'VALIDATED' | 'APPROVED' | 'ZOHO' | 'INSIDEMAPS' | 'VERIFIED';
  label: string;
  state: LifecycleStageState;
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type NextActionKey = 'APPROVE' | 'PROVISION' | 'RETRY' | 'NOTIFY' | 'INVESTIGATE' | 'ESCALATE';

export interface RequestSummary {
  id: string;
  requestCode: string;
  nameAndSurname: string;
  requestType: RequestType;
  jobPosition: string;
  department: string;
  team?: string;
  status: WorkflowStatus;
  submittedAt: string;
  /** Empty for requests submitted before the start-date field existed (PRD section 5). */
  startDate: string;
  effectiveLeaveDate?: string;
  effectiveLeaveTimezone?: string;
  proposedCorporateEmail?: string;
  accountType?: AccountType;
  collisionAdjusted?: boolean;
  needsReview: boolean;
  reasons?: string[];
  failureStep?: string | null;
  failureSystem?: string | null;
  failureReason?: string | null;
  completedStepsCount?: number;
  previousRequestId: string | null;
  lifecycleStages?: LifecycleStage[];
  riskLevel?: RiskLevel;
  riskScore?: number;
  isSlaBreached?: boolean;
  isOverdue?: boolean;
  deadlineIso?: string | null;
  blocker?: string | null;
  affectedSystem?: string;
  nextAction?: string;
  nextActionKey?: NextActionKey;
  activeAccessWarning?: boolean;
}

export interface ProposedAccount {
  corporateEmail: string;
  baseEmail?: string;
  collisionAdjusted?: boolean;
  collisionSuffix?: number | null;
  domain?: string;
  role: string;
  groups: string[];
  insideMapsRoles?: string[];
  accountType: AccountType;
  needsReview: boolean;
  reasons: string[];
  rulesVersion?: number;
}

export interface ResolvedAccount {
  corporateEmail: string;
  role: string;
  groups: string[];
  insideMapsRoles?: string[];
  accountType: AccountType;
  resolvedBy: string | null;
  resolvedAt: string;
}

export interface ProvisioningStep {
  name: string;
  label?: string;
  system?: string;
  outcome: 'SUCCESS' | 'FAILED';
  output?: Record<string, unknown>;
  error?: string;
  at: string;
}

export interface SecurityPolicyState {
  twoStepVerificationRequired: boolean;
  twoStepVerificationEnrolled: boolean;
  forcePasswordChangeOnFirstLogin: boolean;
}

export interface Provisioning {
  steps: ProvisioningStep[];
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  failureStep?: string | null;
  failureSystem?: string | null;
  securityPolicy?: SecurityPolicyState | null;
}

export interface OffboardingSchedule {
  effectiveDate: string;
  timezone: string;
  effectiveAtIso: string;
  reason?: string;
  isScheduledFuture: boolean;
}

export interface NotificationHistoryEntry {
  at: string;
  recipient: string;
  isResend: boolean;
}

export interface NotificationState {
  sent: boolean;
  sentAt: string | null;
  recipient: string | null;
  history: NotificationHistoryEntry[];
}

export interface AuditTrailEntry {
  at: string;
  actorId: string | null;
  actorType: 'EMPLOYEE' | 'AUDITOR' | 'HR' | 'SYSTEM';
  system?: string;
  action: string;
  result?: string;
  detail: string;
}

export interface SystemAuditLogEntry {
  requestId: string;
  requestCode: string;
  employeeName: string;
  requestType: string;
  at: string;
  actorId: string | null;
  actorName?: string;
  actorEmail?: string;
  actorType: 'EMPLOYEE' | 'AUDITOR' | 'HR' | 'SYSTEM';
  system: string;
  action: string;
  result: string;
  detail: string;
}

export interface SubmissionRecord {
  requesterEmail: string;
  requestType: RequestType;
  nameAndSurname: string;
  privateEmail: string;
  country: string;
  countryOther: string;
  department: string;
  departmentOther: string;
  team: string;
  teamOther: string;
  subTeam: string;
  subTeamOther: string;
  jobPosition: string;
  jobPositionOther: string;
  managerEmail: string;
  startDate: string;
  effectiveLeaveDate?: string;
  effectiveLeaveTimezone?: string;
  leavingReason?: string;
  githubProfile: string;
  githubRepositories: string;
  resolvedCountry: string;
  resolvedDepartment: string;
  resolvedTeam: string;
  resolvedSubTeam: string;
  resolvedJobPosition: string;
  isDevelopmentRequest: boolean;
}

export interface EmployeeMasterRow {
  id: string;
  requestCode: string;
  status: WorkflowStatus;
  requestType: RequestType;
  name: string;
  emailAddress: string;
  emailSplit: string;
  costCenter: string;
  department: string;
  team: string;
  subTeam: string;
  jobPosition: string;
  tlManager: string;
  departmentLead: string;
  companyEmail: string;
  github: string;
  active: boolean;
  accountType: AccountType;
  role: string;
  actualRoles: string;
}

export interface EmployeeDirectoryEntry {
  id: string;
  requestCode: string;
  nameAndSurname: string;
  privateEmail: string;
  corporateEmail: string | null;
  department: string;
  requestType: RequestType;
  status: WorkflowStatus;
}

export interface HrRequestSummary {
  id: string;
  requestCode: string;
  nameAndSurname: string;
  requestType: RequestType;
  department: string;
  jobPosition: string;
  status: WorkflowStatus;
  submittedAt: string;
  startDate: string;
  effectiveLeaveDate: string;
  note: string | null;
}

export interface EmployeeSubmissionRecord {
  id: string;
  requestCode: string;
  submission: SubmissionRecord;
  status: WorkflowStatus;
}

export interface OnboardingRequest {
  id: string;
  requestCode: string;
  submission: SubmissionRecord;
  previousSubmission?: SubmissionRecord | null;
  proposedAccount: ProposedAccount;
  resolvedAccount: ResolvedAccount | null;
  previousRequestId: string | null;
  supersededByRequestId: string | null;
  supersededByRequestCode: string | null;
  offboardingSchedule?: OffboardingSchedule | null;
  status: WorkflowStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  provisioning: Provisioning;
  notification: NotificationState;
  auditTrail: AuditTrailEntry[];
}

export interface RequestTypeMetrics {
  pending: number;
  provisioning: number;
  failed: number;
  completed: number;
  total: number;
}

export interface DashboardKpis {
  completionRate: number;
  automationRate: number;
  medianProvisioningMinutes: number | null;
  overdueRequests: number;
  offboardingSlaRate: number;
  urgentRevocationCount: number;
  totalRequests: number;
}

export interface DashboardMetrics {
  newRequests: number;
  provisioning: number;
  /** Approved and awaiting the auditor's "create in Zoho" action (PRD section 8). */
  readyToCreate: number;
  scheduledOffboardings?: number;
  failed: number;
  exceptions?: number;
  completed: number;
  kpis?: DashboardKpis;
  byType: {
    NEW_HIRE: RequestTypeMetrics;
    LEAVING_COMPANY: RequestTypeMetrics;
    UPDATE_EMPLOYEE_INFO: RequestTypeMetrics;
  };
}

export interface PositionMappingRule {
  position: string;
  accountType: AccountType;
  role: string;
  insideMapsRoles: string[];
  active: boolean;
}

export interface DomainRuleConfig {
  defaultDomain: string;
  operationsDomain: string;
  operationsTeams: string[];
}

export interface ProvisioningRulesConfig {
  version: number;
  updatedAt: string | null;
  updatedBy: string | null;
  baseGroups: string[];
  defaultRole: string;
  domainRule: DomainRuleConfig;
  positionMappings: PositionMappingRule[];
  departmentGroups: Record<string, string[]>;
  teamGroups: Record<string, string[]>;
}

export type UserRole = 'AUDITOR' | 'ADMINISTRATOR' | 'HR';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ApiErrorPayload {
  error: string;
  errors?: Record<string, string>;
  code?: string;
}
