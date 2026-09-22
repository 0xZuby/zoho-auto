'use client';

import { useState } from 'react';
import type { OnboardingRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import { resendAccountNotification, sendAccountNotification } from '@/lib/auditor-api';
import { formatDateTime } from '../../../statusPresentation';

interface NotificationCardProps {
  request: OnboardingRequest;
  onUpdated: (request: OnboardingRequest) => void;
}

export function NotificationCard({ request, onUpdated }: NotificationCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = request.status === 'ACCOUNT_CREATED';
  const canResend = request.status === 'COMPLETED' && request.notification.sent;

  if (!canSend && !canResend) return null;

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
      <h2 style={{ fontSize: 15 }}>Account notification</h2>
      <p className="card-section-intro">Send the account details to the employee’s personal email.</p>

      {error && <div className="notice notice-error">{error}</div>}

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
          {isSubmitting ? 'Sending…' : 'Send account information'}
        </button>
      )}

      {canResend && (
        <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => handleSend(true)} disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Resend account information'}
        </button>
      )}
    </section>
  );
}
