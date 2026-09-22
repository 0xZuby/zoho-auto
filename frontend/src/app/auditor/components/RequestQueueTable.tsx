'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { RequestSummary } from '@/lib/types';
import {
  REQUEST_TYPE_LABELS,
  formatCompactDateTime,
  getStatusPresentation,
} from '../statusPresentation';
import { ChevronRightIcon, FlagIcon, SearchIcon } from './icons';

interface RequestQueueTableProps {
  requests: RequestSummary[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  viewAllHref?: string;
}

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING_REVIEW', label: 'New' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PROVISIONING', label: 'Provisioning' },
  { value: 'PROVISIONING_FAILED', label: 'Failed' },
  { value: 'PARTIALLY_PROVISIONED', label: 'Partial' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function RequestQueueTable({
  requests,
  title = 'Request queue',
  subtitle,
  emptyMessage = 'New submissions will appear here.',
  viewAllHref,
}: RequestQueueTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const visibleRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [request.nameAndSurname, request.requestCode, request.department, request.jobPosition]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [query, requests, statusFilter]);

  const readout =
    subtitle ??
    (requests.length === 0
      ? 'No requests'
      : `${visibleRequests.length} of ${requests.length} · newest first`);

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
                placeholder="Name, code, department…"
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
              {STATUS_FILTERS.map((filter) => (
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

      {requests.length === 0 ? (
        <p className="queue-empty">{emptyMessage}</p>
      ) : visibleRequests.length === 0 ? (
        <p className="queue-empty">No requests match those filters. Try a broader search.</p>
      ) : (
        <div className="queue-scroll">
          <table className="queue-table">
            <thead>
              <tr>
                {/* Spine column: purely the status edge, so it carries no label. */}
                <th className="queue-spine" aria-hidden />
                <th scope="col">Employee</th>
                <th scope="col">Request</th>
                <th scope="col" className="hide-narrow">Department</th>
                <th scope="col" className="hide-narrow">Submitted</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((request) => {
                const presentation = getStatusPresentation(request.status);
                const openRequest = () => router.push(`/auditor/requests/${request.id}`);

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
                      <span className="queue-person">
                        <span className="queue-name">{request.nameAndSurname}</span>
                        <span className="queue-code">{request.requestCode}</span>
                      </span>
                    </td>
                    <td className="queue-muted">
                      {REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType}
                    </td>
                    <td className="queue-muted hide-narrow">{request.department || '—'}</td>
                    <td className="hide-narrow">
                      <span className="queue-time">{formatCompactDateTime(request.submittedAt)}</span>
                    </td>
                    <td>
                      <span className="queue-status">
                        <span className="queue-state">{presentation.label}</span>
                        {request.needsReview && (
                          <span className="queue-flag" title="The rules engine could not map this request automatically">
                            <FlagIcon />
                            Review
                          </span>
                        )}
                      </span>
                    </td>
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
