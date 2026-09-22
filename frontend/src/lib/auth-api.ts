import { apiRequest } from './api-client';
import type { AuthUser } from './types';

export function login(email: string, password: string): Promise<{ user: AuthUser }> {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}

export function logout(): Promise<void> {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export function getCurrentUser(): Promise<{ user: AuthUser | null }> {
  return apiRequest('/auth/me');
}
