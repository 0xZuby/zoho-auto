'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSystemAuditLog } from '@/lib/auditor-api';
import { ApiError } from '@/lib/api-client';
import type { SystemAuditLogEntry } from '@/lib/types';
import { formatDateTime } from '../statusPresentation';
import { Placeholder } from '../components/Placeholder';
import { SearchIcon } from '../components/icons';

export default function AuditLogPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<SystemAuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [actorFilter, setActorFilter] = useState<'ALL' | 'AUDITOR'>('ALL');

  useEffect(() => {
    let isMounted = true;
    getSystemAuditLog()
      .then((data) => {
        if (isMounted) setEntries(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof ApiError ? err.message : 'Could not load audit log.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleEntries = useMemo(() => {
    if (!entries) return null;
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (actorFilter === 'AUDITOR' && entry.actorType !== 'AUDITOR') return false;
      if (needle) {
        const hay = [
          entry.actorName,
          entry.actorEmail,
          entry.employeeName,
          entry.requestCode,
          entry.detail,
          entry.action,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [entries, query, actorFilter]);

  return (
    <main className="ops-main">
      <div className="ops-intro">
        <div>
          <h1>Audit log</h1>
          <p>Simple history of what each admin or system action did and when.</p>
        </div>
        <a href="/api/auditor/audit-log?format=csv" className="btn btn-secondary btn-sm" download>
          Export CSV
        </a>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      {!visibleEntries ? (
        <Placeholder height={300} label="Loading audit log" />
      ) : (
        <section className="queue-panel">
          <header className="queue-heading">
            <div>
              <h2>Activity log</h2>
              <p>
                {visibleEntries.length === entries?.length
                  ? `${visibleEntries.length} events`
                  : `${visibleEntries.length} of ${entries?.length ?? 0} events`}
              </p>
            </div>

            <div className="queue-toolbar">
              <div className="queue-search">
                <SearchIcon />
                <label className="sr-only" htmlFor="audit-search-input">
                  Search audit log
                </label>
                <input
                  id="audit-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Admin, employee, action…"
                />
              </div>

              <label className="sr-only" htmlFor="audit-actor-filter">
                Filter by who
              </label>
              <select
                id="audit-actor-filter"
                className="queue-select"
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value as 'ALL' | 'AUDITOR')}
              >
                <option value="ALL">All activity</option>
                <option value="AUDITOR">Admin actions only</option>
              </select>
            </div>
          </header>

          {visibleEntries.length === 0 ? (
            <p className="queue-empty">No matching audit events.</p>
          ) : (
            <div className="queue-scroll">
              <table className="queue-table">
                <thead>
                  <tr>
                    <th scope="col">Admin / Actor</th>
                    <th scope="col">What was done</th>
                    <th scope="col">Employee</th>
                    <th scope="col" className="hide-narrow">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEntries.map((entry, index) => {
                    const openRequest = () => router.push(`/auditor/requests/${entry.requestId}`);
                    return (
                      <tr
                        key={`${entry.requestId}-${entry.at}-${index}`}
                        onClick={openRequest}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openRequest();
                          }
                        }}
                        tabIndex={0}
                      >
                        <td>
                          <div className="queue-person">
                            <span className="queue-name">{entry.actorName || entry.actorType}</span>
                            {entry.actorEmail && <span className="queue-code">{entry.actorEmail}</span>}
                          </div>
                        </td>
                        <td>
                          <div className="queue-person">
                            <span style={{ color: 'var(--ink)', fontSize: 13.5 }}>{entry.detail}</span>
                            <span className="queue-code">
                              {entry.system}
                              {entry.result === 'FAILED' ? ' · Failed' : ''}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="queue-person">
                            <span className="queue-name">{entry.employeeName || '—'}</span>
                            <span className="queue-code">{entry.requestCode}</span>
                          </div>
                        </td>
                        <td className="queue-time hide-narrow">{formatDateTime(entry.at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
