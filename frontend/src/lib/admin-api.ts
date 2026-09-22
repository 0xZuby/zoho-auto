import { apiRequest } from './api-client';
import type { AuthUser, FormCatalog, UserRole } from './types';

export function getAdminCatalog(): Promise<FormCatalog> {
  return apiRequest('/admin/catalog');
}

export interface ZohoIntegrationStatus {
  mode: 'simulated' | 'live';
  dataCenter: string;
  organizationConfigured: boolean;
}

export function getZohoIntegrationStatus(): Promise<ZohoIntegrationStatus> {
  return apiRequest('/admin/zoho-integration');
}

export function listAuditors(): Promise<AuthUser[]> {
  return apiRequest('/admin/auditors');
}

export interface CreateAuditorInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export function createAuditor(input: CreateAuditorInput): Promise<AuthUser> {
  return apiRequest('/admin/auditors', { method: 'POST', body: input });
}
