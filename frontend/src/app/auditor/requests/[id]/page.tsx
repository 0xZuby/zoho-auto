'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getRequest } from '@/lib/auditor-api';
import type { OnboardingRequest } from '@/lib/types';
import { useAuditorNav, useAuditorUser } from '../../AuditorUserContext';
import { RequestHeader } from './components/RequestHeader';
import { RequestStepTracker } from './components/RequestStepTracker';
import { EmployeeInfoCard } from './components/EmployeeInfoCard';
import { AccountSetupCard } from './components/AccountSetupCard';
import { ProvisioningCard } from './components/ProvisioningCard';
import { NotificationCard } from './components/NotificationCard';
import { AuditTrailCard } from './components/AuditTrailCard';

function getSectionLink(request: OnboardingRequest): { href: string; label: string } {
  const isOnboarded =
    request.status === 'COMPLETED'
    || request.status === 'NOTIFICATION_SENT'
    || request.status === 'ACCOUNT_CREATED';

  if (request.submission.requestType === 'LEAVING_COMPANY') {
    return { href: '/auditor/employees/offboarding', label: 'Offboarding' };
  }
  if (request.submission.requestType === 'NEW_HIRE' && !isOnboarded) {
    return { href: '/auditor/employees/onboarding', label: 'Onboarding' };
  }
  return { href: '/auditor/employees/all', label: 'All employees' };
}

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  useAuditorUser();
  const { setActiveNavHref } = useAuditorNav();
  const [request, setRequest] = useState<OnboardingRequest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getRequest(params.id)
      .then((result) => {
        if (isMounted) setRequest(result);
      })
      .catch(() => {
        if (isMounted) setLoadError('Could not load this request. It may not exist or you may need to sign in again.');
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const backLink = request ? getSectionLink(request) : null;

  useEffect(() => {
    setActiveNavHref(backLink ? backLink.href : null);
    return () => setActiveNavHref(null);
  }, [backLink, setActiveNavHref]);

  return (
    <main className="ops-main">
      {loadError && <div className="notice notice-error">{loadError}</div>}

      {!request && !loadError && <div className="skeleton" style={{ height: 420 }} />}

      {request && (
        <>
          {backLink && (
            <Link href={backLink.href} className="ops-back-link">
              ← Back to {backLink.label}
            </Link>
          )}
          <RequestHeader request={request} onUpdated={setRequest} />
          <RequestStepTracker request={request} />
          {request.supersededByRequestId && (
            <div className="notice" style={{ marginBottom: 20 }}>
              This employee&rsquo;s record continues in{' '}
              <Link href={`/auditor/requests/${request.supersededByRequestId}`}>{request.supersededByRequestCode}</Link>. This
              request is kept for history and no longer editable here.
            </div>
          )}
          <div className="request-flow-stack">
            <EmployeeInfoCard request={request} onUpdated={setRequest} />
            <AccountSetupCard request={request} onSaved={setRequest} />
            <ProvisioningCard request={request} onUpdated={setRequest} />
            <NotificationCard request={request} onUpdated={setRequest} />
            <AuditTrailCard entries={request.auditTrail} />
          </div>
        </>
      )}
    </main>
  );
}

