'use client';

import { useCurrentUser } from '@/lib/useCurrentUser';
import { PortalLoginForm } from '@/components/PortalLoginForm';
import { AuditorSidebar } from './components/AuditorSidebar';
import { AuditorUserProvider } from './AuditorUserContext';
import { Placeholder } from './components/Placeholder';
import './auditor.css';

/**
 * Every /auditor route shares one auth check and one sidebar shell, so
 * individual pages only need to render their own content.
 */
export default function AuditorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refresh } = useCurrentUser();

  if (isLoading) {
    return (
      <main className="center-page">
        <Placeholder height={200} label="Verifying session" />
      </main>
    );
  }

  if (!user || (user.role !== 'AUDITOR' && user.role !== 'ADMINISTRATOR')) {
    return <PortalLoginForm onSignedIn={refresh} />;
  }

  return (
    <div className="ops-shell">
      <AuditorSidebar user={user} />
      <div className="ops-shell-main">
        <AuditorUserProvider user={user}>{children}</AuditorUserProvider>
      </div>
    </div>
  );
}
