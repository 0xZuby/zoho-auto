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
  | 'REJECTED'
  | 'RETURNED'
  | 'PROVISIONING_FAILED'
  | 'PARTIALLY_PROVISIONED'
  | 'CANCELLED';

export interface RequestSummary {
  id: string;
  requestCode: string;
  nameAndSurname: string;
  requestType: RequestType;
  jobPosition: string;
  department: string;
  status: WorkflowStatus;
  submittedAt: string;
  needsReview: boolean;
  previousRequestId: string | null;
}

export type AccountType = 'ZOHO' | 'INSIDEMAPS';

export interface ProposedAccount {
  corporateEmail: string;
  role: string;
  groups: string[];
  accountType: AccountType;
  needsReview: boolean;
  reasons: string[];
}

export interface ResolvedAccount {
  corporateEmail: string;
  role: string;
  groups: string[];
  accountType: AccountType;
  resolvedBy: string | null;
  resolvedAt: string;
}

export interface ProvisioningStep {
  name: string;
  label?: string;
  outcome: 'SUCCESS' | 'FAILED';
  output?: Record<string, unknown>;
  error?: string;
  at: string;
}

export interface Provisioning {
  steps: ProvisioningStep[];
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
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
  action: string;
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
  githubProfile: string;
  githubRepositories: string;
  resolvedCountry: string;
  resolvedDepartment: string;
  resolvedTeam: string;
  resolvedSubTeam: string;
  resolvedJobPosition: string;
  isDevelopmentRequest: boolean;
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
  proposedAccount: ProposedAccount;
  resolvedAccount: ResolvedAccount | null;
  previousRequestId: string | null;
  supersededByRequestId: string | null;
  supersededByRequestCode: string | null;
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

export interface DashboardMetrics {
  newRequests: number;
  provisioning: number;
  failed: number;
  completed: number;
  byType: {
    NEW_HIRE: RequestTypeMetrics;
    LEAVING_COMPANY: RequestTypeMetrics;
    UPDATE_EMPLOYEE_INFO: RequestTypeMetrics;
  };
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
