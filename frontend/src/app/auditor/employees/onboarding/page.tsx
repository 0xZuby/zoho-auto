'use client';

import { useEffect, useState } from 'react';
import { listRequests } from '@/lib/auditor-api';
import type { RequestSummary } from '@/lib/types';
import { RequestQueueTable } from '../../components/RequestQueueTable';
import { Placeholder } from '../../components/Placeholder';

export default function OnboardingRequestsPage() {
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    listRequests()
      .then((result) => {
        if (isMounted) setRequests(result.filter((request) => request.requestType === 'NEW_HIRE'));
      })
      .catch(() => {
        if (isMounted) setLoadError('Could not load onboarding requests. Refresh the page to try again.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="ops-main">
      <div className="ops-intro">
        <div>
          <h1>Onboarding</h1>
          <p>New hires waiting on account setup, in the order HR submitted them.</p>
        </div>
      </div>

      {loadError && <div className="notice notice-error">{loadError}</div>}

      {requests ? (
        <RequestQueueTable
          requests={requests}
          title="New hire requests"
          emptyMessage="No new hire requests right now."
        />
      ) : (
        <Placeholder height={300} label="Loading queue" />
      )}
    </main>
  );
}
