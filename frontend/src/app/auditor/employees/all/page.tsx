'use client';

import { useEffect, useMemo, useState } from 'react';
import { listRequests } from '@/lib/auditor-api';
import type { RequestSummary } from '@/lib/types';
import { RequestQueueTable } from '../../components/RequestQueueTable';
import { Placeholder } from '../../components/Placeholder';

export default function AllEmployeesPage() {
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    listRequests()
      .then((result) => {
        if (isMounted) setRequests(result);
      })
      .catch(() => {
        if (isMounted) setLoadError('Could not load requests. Refresh the page to try again.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Each employee can have several linked requests over time (onboarding,
  // an info update, an offboarding). Only the latest one in that chain
  // represents the employee's current record, so older ones are hidden here.
  const employees = useMemo(() => {
    if (!requests) return null;
    const supersededIds = new Set(requests.map((request) => request.previousRequestId).filter(Boolean));
    return requests.filter((request) => !supersededIds.has(request.id));
  }, [requests]);

  return (
    <main className="ops-main">
      <div className="ops-intro">
        <div>
          <h1>All employees</h1>
          <p>One entry per employee, showing their current status. Editing or offboarding updates this record.</p>
        </div>
      </div>

      {loadError && <div className="notice notice-error">{loadError}</div>}

      {employees ? (
        <RequestQueueTable requests={employees} title="All employees" />
      ) : (
        <Placeholder height={300} label="Loading directory" />
      )}
    </main>
  );
}
