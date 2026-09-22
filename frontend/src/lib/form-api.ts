import { apiRequest } from './api-client';
import type { EmployeeDirectoryEntry, EmployeeSubmissionRecord, FormCatalog, OnboardingFormValues } from './types';

export function getFormCatalog(): Promise<FormCatalog> {
  return apiRequest<FormCatalog>('/form/catalog');
}

export function submitOnboardingForm(values: OnboardingFormValues): Promise<{ requestCode: string; submittedAt: string }> {
  return apiRequest('/form/submit', { method: 'POST', body: values });
}

/** Employee directory search (HR finds an existing employee by private or work email to start an offboarding or an information update). */
export function searchEmployees(query: string): Promise<EmployeeDirectoryEntry[]> {
  const search = query.trim() ? `?query=${encodeURIComponent(query.trim())}` : '';
  return apiRequest(`/form/employees${search}`);
}

export function getEmployeeSubmission(id: string): Promise<EmployeeSubmissionRecord> {
  return apiRequest(`/form/employees/${id}`);
}

export type UpdateEmployeeInput = Pick<
  OnboardingFormValues,
  | 'nameAndSurname'
  | 'privateEmail'
  | 'country'
  | 'countryOther'
  | 'department'
  | 'departmentOther'
  | 'team'
  | 'teamOther'
  | 'subTeam'
  | 'subTeamOther'
  | 'jobPosition'
  | 'jobPositionOther'
  | 'managerEmail'
  | 'githubProfile'
  | 'githubRepositories'
>;

export function updateEmployeeInfo(id: string, input: UpdateEmployeeInput): Promise<EmployeeSubmissionRecord> {
  return apiRequest(`/form/employees/${id}`, { method: 'PUT', body: input });
}

export function offboardEmployee(id: string): Promise<{ requestCode: string; submittedAt: string }> {
  return apiRequest(`/form/employees/${id}/offboard`, { method: 'POST' });
}
