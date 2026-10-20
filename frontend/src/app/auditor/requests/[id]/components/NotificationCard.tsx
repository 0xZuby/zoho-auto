'use client';

import { useState } from 'react';
import type { OnboardingRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import {
  previewAccountNotification,
  resendAccountNotification,
  sendAccountNotification,
  type NotificationPreview,
} from '@/lib/auditor-api';
import { formatDateTime } from '../../../statusPresentation';

interface NotificationCardProps {
  request: OnboardingRequest;
  onUpdated: (request: OnboardingRequest) => void;
}

export function NotificationCard({ request, onUpdated }: NotificationCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<NotificationPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const canSend = request.status === 'ACCOUNT_CREATED';
  const canResend = request.status === 'COMPLETED' && request.notification.sent;

  if (!canSend && !canResend) return null;

  async function handlePreview() {
    if (preview) {
      setPreview(null);
      return;
    }
    setIsLoadingPreview(true);
    setError(null);
    try {
      const data = await previewAccountNotification(request.id);
      setPreview(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load setup invitation preview.');
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function handleSend(isResend: boolean) {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = isResend ? await resendAccountNotification(request.id) : await sendAccountNotification(request.id);
      onUpdated(updated);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Could not send the account notification.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card card-padded detail-card stack gap-16">
      <div className="row-between">
        <h2 style={{ fontSize: 15 }}>Account setup invitation</h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handlePreview} disabled={isLoadingPreview}>
          {isLoadingPreview ? 'Loading…' : preview ? 'Hide preview' : 'Preview email'}
        </button>
      </div>
      <p className="card-section-intro">
        Sends setup instructions, first-login password change requirement, and 2-Step Verification (2SV) enrollment steps
        to the employee&rsquo;s private email.
      </p>

      {error && <div className="notice notice-error">{error}</div>}

      {preview && (
        <div className="card card-padded stack gap-8" style={{ background: '#fbfaf9' }}>
          <div className="row-between">
            <strong className="text-sm">{preview.subject}</strong>
            <span className="text-xs text-muted">To: {preview.recipient}</span>
          </div>
          {preview.managerEmail && (
            <span className="text-xs text-muted">Manager operational alert: {preview.managerEmail}</span>
          )}
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: 0 }}>{preview.text}</pre>
        </div>
      )}

      {request.notification.sent && (
        <dl className="definition-list">
          <div>
            <dt>Recipient</dt>
            <dd>{request.notification.recipient}</dd>
          </div>
          <div>
            <dt>Last sent</dt>
            <dd>{formatDateTime(request.notification.sentAt)}</dd>
          </div>
        </dl>
      )}

      {canSend && (
        <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => handleSend(false)} disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send setup invitation'}
        </button>
      )}

      {canResend && (
        <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => handleSend(true)} disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Resend setup invitation'}
        </button>
      )}
    </section>
  );
}
