'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  escalateRequest,
  provisionRequest,
  quickApproveRequest,
  retryProvisioning,
  runDueOffboardings,
} from '@/lib/auditor-api';
import type { RequestSummary } from '@/lib/types';
import { formatCompactDateTime, formatWaitingDuration, getStatusPresentation } from '../statusPresentation';

interface SecurityOffboardingWatchProps {
  requests: RequestSummary[];
  onActionSuccess?: () => void;
}

/**
 * Distinct high-priority Security & Offboarding Watch area:
 * Surfaces urgent access revocation failures or past-due leaver requests
 * separately from normal onboarding operational delays, and shows upcoming
 * scheduled offboardings.
 */
export function SecurityOffboardingWatch({
  requests,
  onActionSuccess,
}: SecurityOffboardingWatchProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [runningDue, setRunningDue] = useState(false);

  const offboardingRequests = requests.filter((r) => r.requestType === 'LEAVING_COMPANY');
  const criticalIncidents = offboardingRequests.filter(
    (r) =>
      r.activeAccessWarning ||
      r.status === 'PROVISIONING_FAILED' ||
      r.status === 'PARTIALLY_PROVISIONED',
  );
  const activeScheduled = offboardingRequests.filter(
    (r) =>
      !criticalIncidents.includes(r) &&
      r.status !== 'ACCESS_REVOKED' &&
      r.status !== 'COMPLETED' &&
      r.status !== 'CANCELLED',
  );

  async function handleRevokeOrRetry(request: RequestSummary) {
    setBusyId(request.id);
    try {
      if (request.status === 'PENDING_REVIEW' && !request.needsReview) {
        await quickApproveRequest(request.id);
        await provisionRequest(request.id);
      } else if (request.status === 'APPROVED' || request.status === 'SCHEDULED_OFFBOARDING') {
        await provisionRequest(request.id);
      } else if (request.status === 'PROVISIONING_FAILED' || request.status === 'PARTIALLY_PROVISIONED') {
        await retryProvisioning(request.id);
      }
      onActionSuccess?.();
    } finally {
      setBusyId(null);
    }
  }

  async function handleEscalate(request: RequestSummary) {
    setBusyId(request.id);
    try {
      await escalateRequest(request.id, 'Urgent access revocation incident escalated from Security Watch.');
      onActionSuccess?.();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRunDue() {
    setRunningDue(true);
    try {
      await runDueOffboardings();
      onActionSuccess?.();
    } finally {
      setRunningDue(false);
    }
  }

  return (
    <section
      className={`security-watch-panel${criticalIncidents.length > 0 ? ' has-incident' : ''}`}
      aria-label="Security and offboarding watch"
    >
      <div className="security-watch-header">
        <div className="security-watch-title-group">
          <span className={`security-watch-badge${criticalIncidents.length > 0 ? ' is-critical' : ' is-clear'}`}>
            {criticalIncidents.length > 0
              ? `CRITICAL ACCESS RISK (${criticalIncidents.length})`
              : 'SECURITY & OFFBOARDING WATCH'}
          </span>
          <h3>
            {criticalIncidents.length > 0
              ? 'Departed employee access still active — immediate revocation required'
              : activeScheduled.length > 0
                ? `${activeScheduled.length} scheduled or pending access revocation(s)`
                : 'Zero unrevoked leaver accounts — all offboarding SLAs compliant'}
          </h3>
        </div>

        <div className="security-watch-actions">
          {activeScheduled.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              disabled={runningDue}
              onClick={handleRunDue}
            >
              {runningDue ? 'Checking due…' : 'Run due offboardings'}
            </button>
          )}
          <Link href="/auditor/employees/offboarding" className="queue-link">
            Offboarding queue →
          </Link>
        </div>
      </div>

      {criticalIncidents.length > 0 && (
        <div className="security-incident-list">
          {criticalIncidents.map((incident) => {
            const isBusy = busyId === incident.id;
            const presentation = getStatusPresentation(incident.status);
            return (
              <div key={incident.id} className="security-incident-card">
                <div className="security-incident-main">
                  <div className="row gap-8">
                    <span className="risk-badge risk-CRITICAL">CRITICAL INCIDENT</span>
                    <strong>{incident.nameAndSurname}</strong>
                    <span className="mono text-xs text-muted">{incident.requestCode}</span>
                    {incident.proposedCorporateEmail && (
                      <span className="mono text-xs text-muted">· {incident.proposedCorporateEmail}</span>
                    )}
                  </div>
                  <p className="security-incident-reason">
                    <strong>Blocker ({incident.affectedSystem || 'ZOHO / INSIDEMAPS'}):</strong>{' '}
                    {incident.blocker || incident.failureReason || 'Access revocation failed or overdue'} · Effective leave:{' '}
                    <span className="mono">{incident.effectiveLeaveDate || 'Immediate'}</span> · Waiting{' '}
                    <span className="mono">{formatWaitingDuration(incident.submittedAt)}</span>
                  </p>
                </div>

                <div className="security-incident-controls">
                  <span className="queue-state">{presentation.label}</span>
                  <button
                    type="button"
                    className="btn btn-danger btn-xs"
                    disabled={isBusy}
                    onClick={() => handleRevokeOrRetry(incident)}
                  >
                    {isBusy ? 'Revoking…' : 'Retry revocation now'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    disabled={isBusy}
                    onClick={() => handleEscalate(incident)}
                  >
                    Escalate
                  </button>
                  <Link href={`/auditor/requests/${incident.id}`} className="btn btn-secondary btn-xs">
                    Investigate
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {criticalIncidents.length === 0 && activeScheduled.length > 0 && (
        <div className="security-scheduled-strip">
          {activeScheduled.slice(0, 3).map((item) => (
            <div key={item.id} className="security-scheduled-item">
              <div>
                <strong>{item.nameAndSurname}</strong>{' '}
                <span className="mono text-xs text-muted">({item.proposedCorporateEmail || item.requestCode})</span>
              </div>
              <div className="row gap-12">
                <span className="mono text-xs">
                  Effective: {item.effectiveLeaveDate || formatCompactDateTime(item.deadlineIso ?? null)} ({item.effectiveLeaveTimezone || 'UTC'})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  disabled={busyId === item.id}
                  onClick={() => handleRevokeOrRetry(item)}
                >
                  {busyId === item.id ? 'Running…' : 'Revoke now'}
                </button>
                <Link href={`/auditor/requests/${item.id}`} className="queue-link">
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
