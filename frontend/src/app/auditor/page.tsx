'use client';

import { useEffect, useState } from 'react';
import { getMetrics, listRequests } from '@/lib/auditor-api';
import type { DashboardMetrics, RequestSummary } from '@/lib/types';
import { useAuditorUser } from './AuditorUserContext';
import { InstrumentPanel } from './components/InstrumentPanel';
import { Placeholder } from './components/Placeholder';
import { RequestQueueTable } from './components/RequestQueueTable';
import { RequestTypeBreakdown } from './components/RequestTypeBreakdown';

const RECENT_LIMIT = 6;

export default function AuditorHomePage() {
  const user = useAuditorUser();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getMetrics(), listRequests()])
      .then(([metricsResult, requestsResult]) => {
        if (!isMounted) return;
        setMetrics(metricsResult);
        setRequests(requestsResult);
      })
      .catch(() => {
        if (isMounted) setLoadError('Could not load the dashboard. Refresh the page to try again.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const recentRequests = requests?.slice(0, RECENT_LIMIT) ?? null;

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

      {metrics ? <InstrumentPanel metrics={metrics} /> : <Placeholder height={132} label="Reading volume" />}

      {metrics ? <RequestTypeBreakdown metrics={metrics} /> : <Placeholder height={160} label="Reading breakdown" />}

      {recentRequests && requests ? (
        <RequestQueueTable
          requests={recentRequests}
          title="Recent activity"
          subtitle={`Latest ${recentRequests.length} of ${requests.length} · newest first`}
          viewAllHref="/auditor/employees/all"
        />
      ) : (
        <Placeholder height={280} label="Loading queue" className="is-queue" />
      )}
    </main>
  );
}
