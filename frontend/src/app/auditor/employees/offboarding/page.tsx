'use client';

import { useEffect, useState } from 'react';
import { listRequests, runDueOffboardings } from '@/lib/auditor-api';
import { ApiError } from '@/lib/api-client';
import type { RequestSummary } from '@/lib/types';
import { RequestQueueTable } from '../../components/RequestQueueTable';
import { Placeholder } from '../../components/Placeholder';
import { StartOffboardingCard } from './components/StartOffboardingCard';

export default function OffboardingRequestsPage() {
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [runningDue, setRunningDue] = useState(false);
  const [runNotice, setRunNotice] = useState<string | null>(null);

  async function refresh() {
    try {
      const result = await listRequests();
      setRequests(result.filter((request) => request.requestType === 'LEAVING_COMPANY'));
    } catch {
      setLoadError('Could not load offboarding requests. Refresh the page to try again.');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleRunDue() {
    setRunningDue(true);
    setRunNotice(null);
    setLoadError(null);
    try {
      const futureIso = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const result = await runDueOffboardings(futureIso);
      setRunNotice(
        result.processed > 0
          ? `Executed ${result.processed} scheduled offboarding run(s): Zoho deactivated, sessions revoked, and InsideMaps roles removed.`
          : 'No scheduled offboardings were waiting to run.',
      );
      await refresh();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to execute scheduled offboardings.');
    } finally {
      setRunningDue(false);
    }
  }

  const scheduledCount = (requests ?? []).filter((r) => r.status === 'SCHEDULED_OFFBOARDING').length;

  return (
    <main className="ops-main">
      <div className="ops-intro">
        <div>
          <h1>Offboarding</h1>
          <p>
            Schedule access blocking for an employee&rsquo;s effective leave date or immediately disable Zoho Mail,
            revoke sessions, and remove InsideMaps roles.
          </p>
        </div>
        {scheduledCount > 0 && (
          <button type="button" className="btn btn-primary" onClick={handleRunDue} disabled={runningDue}>
            {runningDue ? 'Running due offboardings…' : `Run scheduled offboardings (${scheduledCount})`}
          </button>
        )}
      </div>

      {runNotice && <div className="notice notice-success">{runNotice}</div>}

      <StartOffboardingCard />

      {loadError && <div className="notice notice-error">{loadError}</div>}

      {requests ? (
        <RequestQueueTable
          requests={requests}
          title="Offboarding lifecycle runs"
          emptyMessage="No one has been offboarded yet."
        />
      ) : (
        <Placeholder height={300} label="Loading queue" />
      )}
    </main>
  );
}
