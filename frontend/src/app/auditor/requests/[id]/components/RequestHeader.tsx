'use client';

import { useState } from 'react';
import type { OnboardingRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import { rejectRequest } from '@/lib/auditor-api';
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

export function RequestHeader({ request, onUpdated }: RequestHeaderProps) {
  const presentation = getStatusPresentation(request.status);
  const canReject = request.status === 'PENDING_REVIEW' || request.status === 'APPROVED';
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReject() {
    const reason = window.prompt('Reason for rejecting this request (optional):') ?? undefined;
    setIsRejecting(true);
    setError(null);
    try {
      const updated = await rejectRequest(request.id, reason);
      onUpdated(updated);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Could not reject the request.');
    } finally {
      setIsRejecting(false);
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
          {canReject && (
            <button type="button" className="btn btn-danger" onClick={handleReject} disabled={isRejecting}>
              {isRejecting ? 'Rejecting…' : 'Reject request'}
            </button>
          )}
        </div>
      </div>
      {error && <div className="notice notice-error">{error}</div>}
    </div>
  );
}
