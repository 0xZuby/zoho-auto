'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  escalateRequest,
  provisionRequest,
  quickApproveRequest,
  retryProvisioning,
  sendAccountNotification,
} from '@/lib/auditor-api';
import type { LifecycleStage, RequestSummary } from '@/lib/types';
import {
  FAILED_STATUSES,
  REQUEST_TYPE_LABELS,
  compareByUrgency,
  formatCompactDateTime,
  formatWaitingDuration,
  getStatusPresentation,
  getWhoActsNext,
  isStartDateUrgent,
} from '../statusPresentation';
import { ChevronRightIcon, FlagIcon, SearchIcon } from './icons';

interface RequestQueueTableProps {
  requests: RequestSummary[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  viewAllHref?: string;
  variant?: 'default' | 'action-queue' | 'employees';
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  onActionSuccess?: () => void;
}

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING_REVIEW', label: 'New' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PROVISIONING', label: 'Provisioning' },
  { value: 'SCHEDULED_OFFBOARDING', label: 'Scheduled leave' },
  { value: 'PROVISIONING_FAILED', label: 'Failed' },
  { value: 'PARTIALLY_PROVISIONED', label: 'Partial' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ACCESS_REVOKED', label: 'Access disabled' },
];

const ACTION_QUEUE_STATUS_FILTERS = [
  { value: 'ALL', label: 'All active' },
  { value: 'OVERDUE', label: 'Overdue / SLA breach' },
  { value: 'PENDING_REVIEW', label: 'To review' },
  { value: 'FAILED', label: 'Failed / Blocked' },
  { value: 'APPROVED', label: 'Ready to create' },
  { value: 'SCHEDULED_OFFBOARDING', label: 'Scheduled leave' },
  { value: 'PROVISIONING', label: 'Creating…' },
  { value: 'ACCOUNT_CREATED', label: 'Send account info' },
  { value: 'RETURNED', label: 'Returned to HR' },
];

const EMPLOYEE_STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'NOT_WORKING', label: 'Not working' },
];

const DEFAULT_LIFECYCLE_STAGES: LifecycleStage[] = [
  { key: 'SUBMITTED', label: 'Submitted', state: 'done' },
  { key: 'VALIDATED', label: 'Validated', state: 'done' },
  { key: 'APPROVED', label: 'Approved', state: 'pending' },
  { key: 'ZOHO', label: 'Zoho', state: 'pending' },
  { key: 'INSIDEMAPS', label: 'InsideMaps', state: 'pending' },
  { key: 'VERIFIED', label: 'Verified', state: 'pending' },
];

export function LifecyclePipelineMini({ stages }: { stages?: LifecycleStage[] }) {
  const list = stages && stages.length > 0 ? stages : DEFAULT_LIFECYCLE_STAGES;
  const currentOrFailed: LifecycleStage =
    list.find((s) => s.state === 'failed' || s.state === 'blocked') ??
    list.find((s) => s.state === 'current') ??
    [...list].reverse().find((s) => s.state === 'done') ??
    { key: 'SUBMITTED', label: 'Submitted', state: 'done' };

  return (
    <div className="lifecycle-mini" aria-label="Request lifecycle stages">
      <div className="lifecycle-mini-track">
        {list.map((stage) => (
          <span
            key={stage.key}
            className={`lifecycle-mini-seg state-${stage.state}`}
            title={`${stage.label}: ${stage.state.toUpperCase()}`}
          />
        ))}
      </div>
      <span className={`lifecycle-mini-caption state-${currentOrFailed.state}`}>
        {currentOrFailed.label}
      </span>
    </div>
  );
}

export function RequestQueueTable({
  requests,
  title = 'Request queue',
  subtitle,
  emptyMessage = 'New submissions will appear here.',
  viewAllHref,
  variant = 'default',
  statusFilter: controlledStatusFilter,
  onStatusFilterChange,
  onActionSuccess,
}: RequestQueueTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [internalStatusFilter, setInternalStatusFilter] = useState('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [escalatedId, setEscalatedId] = useState<string | null>(null);

  const statusFilter = controlledStatusFilter ?? internalStatusFilter;
  const setStatusFilter = onStatusFilterChange ?? setInternalStatusFilter;
  const isActionQueue = variant === 'action-queue';
  const isEmployeeDirectory = variant === 'employees';
  const statusFilterOptions = isActionQueue
    ? ACTION_QUEUE_STATUS_FILTERS
    : isEmployeeDirectory
      ? EMPLOYEE_STATUS_FILTERS
      : STATUS_FILTERS;

  const visibleRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = requests.filter((request) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'OVERDUE'
          ? Boolean(request.isOverdue || request.isSlaBreached)
          : statusFilter === 'FAILED'
            ? FAILED_STATUSES.includes(request.status)
            : statusFilter === 'NOT_WORKING'
              ? request.requestType === 'LEAVING_COMPANY'
              : statusFilter === 'ACTIVE'
                ? request.requestType !== 'LEAVING_COMPANY'
                : request.status === statusFilter);
      const matchesQuery =
        !normalizedQuery ||
        [
          request.nameAndSurname,
          request.requestCode,
          request.department,
          request.jobPosition,
          request.proposedCorporateEmail,
          request.blocker,
          request.affectedSystem,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
    return isActionQueue ? [...filtered].sort(compareByUrgency) : filtered;
  }, [isActionQueue, query, requests, statusFilter]);

  const readout =
    subtitle ??
    (requests.length === 0
      ? 'No requests'
      : `${visibleRequests.length} of ${requests.length} · ${isActionQueue ? 'sorted by business risk & SLA breach' : 'newest first'}`);

  async function handleQuickAction(
    event: React.MouseEvent,
    request: RequestSummary,
    mode: 'APPROVE' | 'PROVISION' | 'RETRY' | 'NOTIFY' | 'ESCALATE',
  ) {
    event.stopPropagation();
    setActionError(null);
    setBusyId(request.id);
    try {
      if (mode === 'APPROVE') {
        await quickApproveRequest(request.id);
        await provisionRequest(request.id);
      } else if (mode === 'PROVISION') {
        await provisionRequest(request.id);
      } else if (mode === 'RETRY') {
        await retryProvisioning(request.id);
      } else if (mode === 'NOTIFY') {
        await sendAccountNotification(request.id);
      } else if (mode === 'ESCALATE') {
        await escalateRequest(request.id, 'Escalated from Needs You queue due to risk / SLA breach.');
        setEscalatedId(request.id);
      }
      onActionSuccess?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not complete quick action.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="queue-panel">
      <header className="queue-heading">
        <div>
          <h2>{title}</h2>
          <p>{readout}</p>
        </div>

        {requests.length > 0 && (
          <div className="queue-toolbar">
            <div className="queue-search">
              <SearchIcon />
              <label className="sr-only" htmlFor="queue-search-input">
                Search requests
              </label>
              <input
                id="queue-search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, code, blocker, system…"
              />
            </div>

            <label className="sr-only" htmlFor="queue-status-filter">
              Filter by status
            </label>
            <select
              id="queue-status-filter"
              className="queue-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusFilterOptions.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {viewAllHref && (
              <Link href={viewAllHref} className="queue-link">
                View all
                <ChevronRightIcon />
              </Link>
            )}
          </div>
        )}
      </header>

      {actionError && (
        <div className="notice notice-error" style={{ margin: '0 20px 12px' }}>
          {actionError}
        </div>
      )}

      {requests.length === 0 ? (
        <p className="queue-empty">{emptyMessage}</p>
      ) : visibleRequests.length === 0 ? (
        <p className="queue-empty">No requests match those filters. Try a broader search.</p>
      ) : (
        <div className="queue-scroll">
          <table className="queue-table">
            <thead>
              <tr>
                <th className="queue-spine" aria-hidden />
                <th scope="col">Employee</th>
                {isActionQueue ? (
                  <>
                    <th scope="col">Lifecycle</th>
                    <th scope="col">Blocker &amp; System</th>
                    <th scope="col" className="hide-narrow">SLA / Deadline</th>
                    <th scope="col">Next Action</th>
                  </>
                ) : (
                  <>
                    <th scope="col">Role &amp; Dept</th>
                    <th scope="col" className="hide-narrow">Account</th>
                    <th scope="col" className="hide-narrow">Submitted</th>
                    <th scope="col">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((request) => {
                const presentation = getStatusPresentation(request.status);
                const openRequest = () => router.push(`/auditor/requests/${request.id}`);
                const isBusy = busyId === request.id;
                const riskLevel = request.riskLevel ?? 'LOW';

                return (
                  <tr
                    key={request.id}
                    className={`tone-${presentation.tone}`}
                    onClick={openRequest}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openRequest();
                      }
                    }}
                    tabIndex={0}
                    aria-label={`Open request ${request.requestCode} for ${request.nameAndSurname}`}
                  >
                    <td className="queue-spine" />
                    <td>
                      <div className="queue-person">
                        <span className="queue-name">{request.nameAndSurname}</span>
                        <span className="queue-code">
                          {request.requestCode}
                          {` · ${REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType}`}
                          {isActionQueue && riskLevel !== 'LOW' ? ` · ${riskLevel}` : ''}
                        </span>
                      </div>
                    </td>

                    {isActionQueue ? (
                      <>
                        <td>
                          <LifecyclePipelineMini stages={request.lifecycleStages} />
                        </td>

                        <td>
                          <div className="queue-blocker-cell">
                            <span className="queue-blocker-text" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                              {request.blocker || request.failureReason || 'Ready for next step'}
                            </span>
                            <span className="queue-code">
                              {request.affectedSystem || request.accountType || 'PORTAL'}
                              {` · ${presentation.label} (${getWhoActsNext(request.status)})`}
                            </span>
                          </div>
                        </td>

                        <td className="hide-narrow">
                          <div className="queue-deadline-cell">
                            <span className="queue-time">
                              Wait: {formatWaitingDuration(request.submittedAt)}
                              {request.isSlaBreached && (
                                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                                  {' · SLA breach'}
                                </span>
                              )}
                            </span>
                            <span className="queue-code">
                              {request.effectiveLeaveDate
                                ? `Leave: ${request.effectiveLeaveDate}`
                                : request.startDate
                                  ? `Start: ${formatCompactDateTime(`${request.startDate}T00:00:00`)}`
                                  : request.deadlineIso
                                    ? `Due: ${formatCompactDateTime(request.deadlineIso)}`
                                    : 'SLA: 15m'}
                              {isStartDateUrgent(request.startDate) && (
                                <span style={{ color: 'var(--danger)' }}>
                                  {' · Urgent'}
                                </span>
                              )}
                            </span>
                          </div>
                        </td>

                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="queue-inline-actions">
                            {request.status === 'PENDING_REVIEW' && !request.needsReview && (
                              <button
                                type="button"
                                className="btn btn-primary btn-xs"
                                disabled={isBusy}
                                onClick={(e) => handleQuickAction(e, request, 'APPROVE')}
                                title="Approve proposal & run provisioning"
                              >
                                {isBusy ? 'Running…' : 'Approve & Run'}
                              </button>
                            )}

                            {(request.status === 'APPROVED' || request.status === 'SCHEDULED_OFFBOARDING') && (
                              <button
                                type="button"
                                className="btn btn-primary btn-xs"
                                disabled={isBusy}
                                onClick={(e) => handleQuickAction(e, request, 'PROVISION')}
                              >
                                {isBusy
                                  ? 'Running…'
                                  : request.requestType === 'LEAVING_COMPANY'
                                    ? 'Revoke Access'
                                    : 'Provision'}
                              </button>
                            )}

                            {(request.status === 'PROVISIONING_FAILED' || request.status === 'PARTIALLY_PROVISIONED') && (
                              <button
                                type="button"
                                className="btn btn-danger btn-xs"
                                disabled={isBusy}
                                onClick={(e) => handleQuickAction(e, request, 'RETRY')}
                              >
                                {isBusy ? 'Retrying…' : 'Retry Step'}
                              </button>
                            )}

                            {request.status === 'ACCOUNT_CREATED' && (
                              <button
                                type="button"
                                className="btn btn-primary btn-xs"
                                disabled={isBusy}
                                onClick={(e) => handleQuickAction(e, request, 'NOTIFY')}
                              >
                                {isBusy ? 'Sending…' : 'Send Invite'}
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={openRequest}
                            >
                              Investigate
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              disabled={isBusy || escalatedId === request.id}
                              onClick={(e) => handleQuickAction(e, request, 'ESCALATE')}
                              title="Record priority escalation in audit log"
                            >
                              {escalatedId === request.id ? 'Escalated' : 'Escalate'}
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="queue-muted">
                          <div className="queue-person">
                            <span style={{ color: 'var(--ink)', fontSize: 13.5, fontWeight: 500 }}>
                              {request.jobPosition || '—'}
                            </span>
                            <span className="queue-code">{request.department || '—'}</span>
                          </div>
                        </td>
                        <td className="hide-narrow">
                          <span className="queue-code">
                            {request.proposedCorporateEmail || '—'}
                            {request.accountType ? ` · ${request.accountType}` : ''}
                          </span>
                        </td>
                        <td className="hide-narrow">
                          <span className="queue-time">
                            {request.effectiveLeaveDate
                              ? `Leave: ${request.effectiveLeaveDate}`
                              : formatCompactDateTime(request.submittedAt)}
                          </span>
                        </td>
                        <td>
                          <span className="queue-status">
                            <span className="queue-state">{presentation.label}</span>
                            {request.collisionAdjusted && (
                              <span className="queue-flag" title="Email suffix adjusted for collision">
                                Suffix
                              </span>
                            )}
                            {request.needsReview && (
                              <span className="queue-flag" title="The rules engine could not map this request automatically">
                                <FlagIcon />
                                Review
                              </span>
                            )}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

