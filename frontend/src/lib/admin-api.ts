import { apiRequest } from './api-client';
import type {
  AuthUser,
  DomainRuleConfig,
  FormCatalog,
  PositionMappingRule,
  ProvisioningRulesConfig,
  UserRole,
} from './types';

export function getAdminCatalog(): Promise<FormCatalog> {
  return apiRequest('/admin/catalog');
}

export function getProvisioningRules(): Promise<ProvisioningRulesConfig> {
  return apiRequest('/admin/rules');
}

export function updateProvisioningRules(input: {
  domainRule?: DomainRuleConfig;
  positionMappings?: PositionMappingRule[];
}): Promise<ProvisioningRulesConfig> {
  return apiRequest('/admin/rules', { method: 'PUT', body: input });
}

export interface ZohoIntegrationStatus {
  mode: 'simulated' | 'live';
  dataCenter: string;
  organizationConfigured: boolean;
  connected?: boolean;
  setupReady?: boolean;
  insideMapsMode?: 'simulated' | 'live';
  insideMapsConfigured?: boolean;
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
