import type { ApiErrorPayload } from './types';

/** Thrown for any non-2xx API response. Carries the parsed error payload so
 * callers can surface field-level validation errors. */
export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.error || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

/**
 * Thin fetch wrapper. Always calls same-origin `/api/*` (rewritten to the
 * Express API by next.config.ts) and always sends credentials so the
 * signed session cookie is included for authenticated auditor/admin routes.
 */
export async function apiRequest<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const response = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const payload = await response.json().catch(() => ({ error: 'The server returned an unexpected response.' }));

  if (!response.ok) {
    throw new ApiError(response.status, payload as ApiErrorPayload);
  }

  return payload as TResponse;
}
