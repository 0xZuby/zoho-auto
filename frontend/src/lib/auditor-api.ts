import { apiRequest } from './api-client';
import type { AccountType, DashboardMetrics, OnboardingRequest, RequestSummary } from './types';

export function getMetrics(): Promise<DashboardMetrics> {
  return apiRequest('/auditor/metrics');
}

export function listRequests(): Promise<RequestSummary[]> {
  return apiRequest('/auditor/requests');
}

export function getRequest(id: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}`);
}

export interface SaveAccountInput {
  corporateEmail: string;
  role: string;
  groups: string[];
  accountType: AccountType;
}

export function saveResolvedAccount(id: string, input: SaveAccountInput): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/account`, { method: 'PUT', body: input });
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
  githubProfile: string;
  githubRepositories: string;
}

export function updateEmployeeSubmission(id: string, input: UpdateSubmissionInput): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/submission`, { method: 'PUT', body: input });
}

export function offboardEmployee(id: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/offboard`, { method: 'POST' });
}

export function rejectRequest(id: string, reason?: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/reject`, { method: 'POST', body: { reason } });
}

export interface ProvisionResult {
  request: OnboardingRequest;
  failure: { step: string; message: string } | null;
  allStepsSucceeded: boolean;
}

export function provisionRequest(id: string): Promise<ProvisionResult> {
  return apiRequest(`/auditor/requests/${id}/provision`, { method: 'POST' });
}

export function retryProvisioning(id: string): Promise<ProvisionResult> {
  return apiRequest(`/auditor/requests/${id}/retry`, { method: 'POST' });
}

export function sendAccountNotification(id: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/notify`, { method: 'POST' });
}

export function resendAccountNotification(id: string): Promise<OnboardingRequest> {
  return apiRequest(`/auditor/requests/${id}/resend-notification`, { method: 'POST' });
}
