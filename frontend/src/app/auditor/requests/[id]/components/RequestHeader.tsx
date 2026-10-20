'use client';

import { useState } from 'react';
import type { OnboardingRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import { cancelRequest, rejectRequest, returnRequest } from '@/lib/auditor-api';
import { getStatusPresentation } from '../../../statusPresentation';

const REQUEST_TYPE_EYEBROW: Record<string, string> = {
  NEW_HIRE: 'Onboarding request',
  LEAVING_COMPANY: 'Offboarding request',
  UPDATE_EMPLOYEE_INFO: 'Update request',
};

interface RequestHeaderProps {
  request: OnboardingRequest;
  onUpdated: (request: OnboardingRequest) => void;
}

type PendingAction = 'reject' | 'return' | 'cancel' | null;

export function RequestHeader({ request, onUpdated }: RequestHeaderProps) {
  const presentation = getStatusPresentation(request.status);
  const canActOnRequest = request.status === 'PENDING_REVIEW' || request.status === 'APPROVED';
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReject() {
    const reason = window.prompt('Reason for rejecting this request (optional):') ?? undefined;
    setPendingAction('reject');
    setError(null);
    try {
      const updated = await rejectRequest(request.id, reason);
      onUpdated(updated);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Could not reject the request.');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleReturn() {
    const reason = window.prompt('Reason for returning this request to HR (required):');
    if (reason === null) return;
    if (!reason.trim()) {
      setError('A reason is required to return a request to HR.');
      return;
    }
    setPendingAction('return');
    setError(null);
    try {
      const updated = await returnRequest(request.id, reason.trim());
      onUpdated(updated);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Could not return the request to HR.');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this request? This withdraws it before any account is created.')) return;
    const reason = window.prompt('Reason for cancelling this request (optional):') ?? undefined;
    setPendingAction('cancel');
    setError(null);
    try {
      const updated = await cancelRequest(request.id, reason);
      onUpdated(updated);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Could not cancel the request.');
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="stack gap-8" style={{ marginBottom: 20 }}>
      <div className="request-hero">
        <div className="stack gap-4">
          <span className="text-faint" style={{ fontSize: 12, fontWeight: 700 }}>
            {REQUEST_TYPE_EYEBROW[request.submission.requestType] ?? 'Request review'}
          </span>
          <h1 style={{ fontSize: 26, letterSpacing: '-0.05em' }}>{request.submission.nameAndSurname}</h1>
          <span className="text-faint text-sm" style={{ fontFamily: 'monospace' }}>
            {request.requestCode}
          </span>
        </div>
        <div className="request-hero-actions">
          <span className={`chip ${presentation.chipClassName}`}>{presentation.label}</span>
          {canActOnRequest && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleReturn}
                disabled={pendingAction !== null}
              >
                {pendingAction === 'return' ? 'Returning…' : 'Return to HR'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancel}
                disabled={pendingAction !== null}
              >
                {pendingAction === 'cancel' ? 'Cancelling…' : 'Cancel request'}
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleReject}
                disabled={pendingAction !== null}
              >
                {pendingAction === 'reject' ? 'Rejecting…' : 'Reject request'}
              </button>
            </>
          )}
        </div>
      </div>
      {error && <div className="notice notice-error">{error}</div>}
    </div>
  );
}

