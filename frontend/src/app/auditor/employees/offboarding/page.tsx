'use client';

import { useEffect, useState } from 'react';
import { listRequests } from '@/lib/auditor-api';
import type { RequestSummary } from '@/lib/types';
import { RequestQueueTable } from '../../components/RequestQueueTable';
import { Placeholder } from '../../components/Placeholder';
import { StartOffboardingCard } from './components/StartOffboardingCard';

export default function OffboardingRequestsPage() {
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    listRequests()
      .then((result) => {
        if (isMounted) setRequests(result.filter((request) => request.requestType === 'LEAVING_COMPANY'));
      })
      .catch(() => {
        if (isMounted) setLoadError('Could not load offboarding requests. Refresh the page to try again.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="ops-main">
      <div className="ops-intro">
        <div>
          <h1>Offboarding</h1>
          <p>Search for someone leaving the company to disable their Zoho Mail and InsideMaps access instantly.</p>
        </div>
      </div>

      <StartOffboardingCard />

      {loadError && <div className="notice notice-error">{loadError}</div>}

      {requests ? (
        <RequestQueueTable
          requests={requests}
          title="Offboarding history"
          emptyMessage="No one has been offboarded yet."
        />
      ) : (
        <Placeholder height={300} label="Loading queue" />
      )}
    </main>
  );
}
