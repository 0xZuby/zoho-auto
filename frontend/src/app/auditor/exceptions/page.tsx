'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { cancelRequest, listRequests, retryProvisioning } from '@/lib/auditor-api';
import { ApiError } from '@/lib/api-client';
import type { RequestSummary } from '@/lib/types';
import { formatCompactDateTime, getStatusPresentation, REQUEST_TYPE_LABELS } from '../statusPresentation';
import { ChevronRightIcon } from '../components/icons';

type ExceptionTab = 'ALL' | 'FAILED' | 'UNMAPPED';

export default function ExceptionsPage() {
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ExceptionTab>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load exceptions queue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const exceptionRequests = useMemo(() => {
    return requests.filter((r) => {
      const isFailed = r.status === 'PROVISIONING_FAILED' || r.status === 'PARTIALLY_PROVISIONED';
      const isUnmappedOrAmbiguous =
        r.needsReview && !['COMPLETED', 'ACCESS_REVOKED', 'REJECTED', 'CANCELLED'].includes(r.status);
      if (tab === 'FAILED') return isFailed;
      if (tab === 'UNMAPPED') return isUnmappedOrAmbiguous && !isFailed;
      return isFailed || isUnmappedOrAmbiguous;
    });
  }, [requests, tab]);

  const counts = useMemo(() => {
    const failed = requests.filter((r) => r.status === 'PROVISIONING_FAILED' || r.status === 'PARTIALLY_PROVISIONED').length;
    const unmapped = requests.filter(
      (r) =>
        r.needsReview &&
        !['PROVISIONING_FAILED', 'PARTIALLY_PROVISIONED', 'COMPLETED', 'ACCESS_REVOKED', 'REJECTED', 'CANCELLED'].includes(
          r.status,
        ),
    ).length;
    return { all: failed + unmapped, failed, unmapped };
  }, [requests]);

  async function handleRetry(id: string) {
    setBusyId(id);
    setActionMessage(null);
    setError(null);
    try {
      const result = await retryProvisioning(id);
      if (result.allStepsSucceeded) {
        setActionMessage(`Retried ${result.request.requestCode}: all steps succeeded.`);
      } else {
        setError(`Retry for ${result.request.requestCode} stopped at ${result.failure?.step}: ${result.failure?.message}`);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Retry failed.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(id: string) {
    setBusyId(id);
    setActionMessage(null);
    setError(null);
    try {
      const updated = await cancelRequest(id, 'Cancelled from exception queue');
      setActionMessage(`Cancelled request ${updated.requestCode}.`);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cancel failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="ops-page stack gap-24">
      <header className="ops-page-header">
        <div>
          <p className="ops-eyebrow">Exceptions &amp; recovery</p>
          <h1>Exception queue</h1>
        </div>
        <p className="ops-page-meta">
          Requests that stopped due to an integration failure, partial completion, or an unmapped/custom position rule.
          Retrying resumes only the failed step and never duplicates completed accounts.
        </p>
      </header>

      <div className="ops-toolbar">
        <div className="ops-filter-tabs" role="tablist" aria-label="Exception category">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'ALL'}
            className={`ops-filter-tab${tab === 'ALL' ? ' active' : ''}`}
            onClick={() => setTab('ALL')}
          >
            All exceptions <span className="ops-filter-count">{counts.all}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'FAILED'}
            className={`ops-filter-tab${tab === 'FAILED' ? ' active' : ''}`}
            onClick={() => setTab('FAILED')}
          >
            Failed / partial <span className="ops-filter-count">{counts.failed}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'UNMAPPED'}
            className={`ops-filter-tab${tab === 'UNMAPPED' ? ' active' : ''}`}
            onClick={() => setTab('UNMAPPED')}
          >
            Unmapped / ambiguous <span className="ops-filter-count">{counts.unmapped}</span>
          </button>
        </div>
      </div>

      {actionMessage && <div className="notice notice-success">{actionMessage}</div>}
      {error && <div className="notice notice-error">{error}</div>}

      {loading ? (
        <div className="card card-padded text-muted">Loading exception queue…</div>
      ) : exceptionRequests.length === 0 ? (
        <div className="ops-empty">
          <strong>No exceptions in this view</strong>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>
            All routine lifecycle runs are flowing normally without failed steps or unmapped positions.
          </p>
        </div>
      ) : (
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>System &amp; failing step</th>
                <th>Exception reason / state</th>
                <th>Status</th>
                <th>Submitted</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {exceptionRequests.map((request) => {
                const statusInfo = getStatusPresentation(request.status);
                const isFailed =
                  request.status === 'PROVISIONING_FAILED' || request.status === 'PARTIALLY_PROVISIONED';
                const isBusy = busyId === request.id;

                return (
                  <tr key={request.id} className={`ops-row tone-${statusInfo.tone}`}>
                    <td className="ops-cell-primary">
                      <span className="ops-employee-name">{request.nameAndSurname}</span>
                      <span className="ops-employee-sub">
                        <span className="ops-code">{request.requestCode}</span> · {request.department} ·{' '}
                        {request.jobPosition}
                      </span>
                    </td>
                    <td>{REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType}</td>
                    <td>
                      {isFailed ? (
                        <div className="stack gap-4">
                          <span className="chip chip-danger" style={{ width: 'fit-content' }}>
                            {request.failureSystem || 'INTEGRATION'} · {request.failureStep || 'step_failed'}
                          </span>
                          <span className="text-xs text-muted">
                            {request.completedStepsCount ?? 0} step(s) already completed
                          </span>
                        </div>
                      ) : (
                        <span className="chip chip-warning">RULES ENGINE · Pre-execution</span>
                      )}
                    </td>
                    <td style={{ maxWidth: 340 }}>
                      {request.failureReason ? (
                        <span className="text-sm">{request.failureReason}</span>
                      ) : request.reasons && request.reasons.length > 0 ? (
                        <span className="text-sm">{request.reasons.join(' ')}</span>
                      ) : (
                        <span className="text-sm text-muted">Requires manual admin review before provisioning</span>
                      )}
                    </td>
                    <td>
                      <span className={`ops-status tone-${statusInfo.tone}`}>
                        <span className="ops-status-dot" aria-hidden />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="ops-cell-num">{formatCompactDateTime(request.submittedAt)}</td>
                    <td className="ops-cell-Chevron">
                      <div className="row-between" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        {isFailed && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={isBusy}
                            onClick={() => handleRetry(request.id)}
                          >
                            {isBusy ? 'Retrying…' : 'Retry step'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={isBusy}
                          onClick={() => handleCancel(request.id)}
                        >
                          Cancel
                        </button>
                        <Link href={`/auditor/requests/${request.id}`} className="ops-row-action">
                          <span>Inspect</span>
                          <ChevronRightIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
