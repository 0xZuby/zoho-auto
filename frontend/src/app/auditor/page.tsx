'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMetrics, listRequests } from '@/lib/auditor-api';
import type { DashboardMetrics, RequestSummary } from '@/lib/types';
import { useAuditorUser } from './AuditorUserContext';
import { InstrumentPanel } from './components/InstrumentPanel';
import { Placeholder } from './components/Placeholder';
import { RequestQueueTable } from './components/RequestQueueTable';
import { RequestTypeBreakdown } from './components/RequestTypeBreakdown';
import { SecurityOffboardingWatch } from './components/SecurityOffboardingWatch';
import { NEEDS_ACTION_STATUSES } from './statusPresentation';

export default function AuditorHomePage() {
  const user = useAuditorUser();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [queueStatusFilter, setQueueStatusFilter] = useState('ALL');

  const refreshDashboard = useCallback(async () => {
    try {
      const [metricsResult, requestsResult] = await Promise.all([getMetrics(), listRequests()]);
      setMetrics(metricsResult);
      setRequests(requestsResult);
      setLoadError(null);
    } catch {
      setLoadError('Could not load the dashboard. Refresh the page to try again.');
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Home is action-first (PRD section 8): only current (non-superseded)
  // requests still needing someone's attention show up here.
  const actionQueueRequests = useMemo(() => {
    if (!requests) return null;
    const supersededIds = new Set(requests.map((request) => request.previousRequestId).filter(Boolean));
    return requests.filter(
      (request) => !supersededIds.has(request.id) && NEEDS_ACTION_STATUSES.includes(request.status),
    );
  }, [requests]);

  return (
    <main className="ops-main">
      <div className="ops-intro">
        <div>
          <h1>Home</h1>
          <p>
            Hi {user.name.split(' ')[0]}, here&rsquo;s what&rsquo;s waiting across onboarding and offboarding today.
          </p>
        </div>
        <span className="ops-date">
          {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date())}
        </span>
      </div>

      {loadError && <div className="notice notice-error">{loadError}</div>}

      {metrics ? (
        <InstrumentPanel metrics={metrics} activeFilter={queueStatusFilter} onSelectFilter={setQueueStatusFilter} />
      ) : (
        <Placeholder height={132} label="Reading volume" />
      )}

      {requests && (
        <SecurityOffboardingWatch requests={requests} onActionSuccess={refreshDashboard} />
      )}

      {metrics ? <RequestTypeBreakdown metrics={metrics} /> : <Placeholder height={160} label="Reading breakdown" />}

      {actionQueueRequests ? (
        <RequestQueueTable
          requests={actionQueueRequests}
          title="Needs you"
          variant="action-queue"
          statusFilter={queueStatusFilter}
          onStatusFilterChange={setQueueStatusFilter}
          onActionSuccess={refreshDashboard}
          emptyMessage="Nothing needs your attention right now."
          viewAllHref="/auditor/employees/all"
        />
      ) : (
        <Placeholder height={280} label="Loading queue" className="is-queue" />
      )}
    </main>
  );
}

