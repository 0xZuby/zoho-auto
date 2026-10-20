import { apiRequest } from './api-client';
import type {
  AccountType,
  DashboardMetrics,
  EmployeeDirectoryEntry,
  EmployeeMasterRow,
  OnboardingRequest,
  RequestSummary,
  SystemAuditLogEntry,
} from './types';

export function getMetrics(): Promise<DashboardMetrics> {
  return apiRequest('/auditor/metrics');
}

export function getZohoLiveStatus(): Promise<{ live: boolean }> {
  return apiRequest('/auditor/zoho-status');
}

export function listRequests(): Promise<RequestSummary[]> {
  return apiRequest('/auditor/requests');
}

export function listEmployeeDirectory(): Promise<EmployeeMasterRow[]> {
  return apiRequest('/auditor/employees/directory');
}

export function getRequest(id: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}`);
}

export interface SaveAccountInput {
  corporateEmail: string;
  insideMapsRoles?: string[];
  accountType: AccountType;
}

export function saveResolvedAccount(id: string, input: SaveAccountInput): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/account`, { method: 'PUT', body: input });
}

export function quickApproveRequest(id: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/quick-approve`, { method: 'POST' });
}

export function escalateRequest(id: string, note?: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/escalate`, { method: 'POST', body: { note } });
}

export interface UpdateSubmissionInput {
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

export function updateEmployeeSubmission(id: string, input: UpdateSubmissionInput): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/submission`, { method: 'PUT', body: input });
}

export interface OffboardOptions {
  effectiveLeaveDate?: string;
  effectiveLeaveTimezone?: string;
  leavingReason?: string;
}

export function offboardEmployee(id: string, options: OffboardOptions = {}): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/offboard`, { method: 'POST', body: options });
}

export function runDueOffboardings(asOfIso?: string): Promise<{ processed: number; results: Array<{ id: string; requestCode: string; ok: boolean }> }> {
  return apiRequest('/auditor/offboarding/run-due', { method: 'POST', body: asOfIso ? { asOfIso } : {} });
}

/** Finds current employees (not already leaving/left) by work or personal email, for the "Offboard by email" quick action. */
export function searchEmployees(query: string): Promise<EmployeeDirectoryEntry[]> {
  return apiRequest(`/auditor/employees?query=${encodeURIComponent(query)}`);
}

export function rejectRequest(id: string, reason?: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/reject`, { method: 'POST', body: { reason } });
}

export function returnRequest(id: string, reason: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/return`, { method: 'POST', body: { reason } });
}

export function cancelRequest(id: string, reason?: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/cancel`, { method: 'POST', body: { reason } });
}

export interface ProvisionResult {
  request: OnboardingRequest;
  failure: { step: string; label?: string; system?: string; message: string } | null;
  allStepsSucceeded: boolean;
}

export function provisionRequest(id: string): Promise<ProvisionResult> {
  return apiRequest(`/auditor/requests/${id}/provision`, { method: 'POST' });
}

export function batchProvisionRequests(requestIds: string[]): Promise<{
  processed: number;
  results: Array<{ id: string; ok: boolean; request?: OnboardingRequest; failure?: { step: string; message: string } | null; error?: string }>;
}> {
  return apiRequest('/auditor/requests/batch-provision', { method: 'POST', body: { requestIds } });
}

export function retryProvisioning(id: string): Promise<ProvisionResult> {
  return apiRequest(`/auditor/requests/${id}/retry`, { method: 'POST' });
}

export interface NotificationPreview {
  recipient: string;
  managerEmail: string | null;
  requesterEmail: string | null;
  subject: string;
  text: string;
}

export function previewAccountNotification(id: string): Promise<NotificationPreview> {
  return apiRequest(`/auditor/requests/${id}/notification-preview`);
}

export function sendAccountNotification(id: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/notify`, { method: 'POST' });
}

export function resendAccountNotification(id: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/resend-notification`, { method: 'POST' });
}

export function getSystemAuditLog(params: {
  query?: string;
  actorType?: string;
  action?: string;
  system?: string;
} = {}): Promise<SystemAuditLogEntry[]> {
  const qs = new URLSearchParams();
  if (params.query) qs.set('query', params.query);
  if (params.actorType) qs.set('actorType', params.actorType);
  if (params.action) qs.set('action', params.action);
  if (params.system) qs.set('system', params.system);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiRequest(`/auditor/audit-log${suffix}`);
}
