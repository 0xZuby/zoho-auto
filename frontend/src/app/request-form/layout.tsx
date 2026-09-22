'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { PortalLoginForm } from '@/components/PortalLoginForm';

/**
 * The request form is HR-authenticated (backend/src/routes/form.js requires
 * an HR or Administrator session on every /api/form/* route), so every
 * /request-form route shares this sign-in gate before rendering its content.
 */
export default function RequestFormLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refresh } = useCurrentUser();
  const router = useRouter();

  async function handleSignOut() {
    await logout();
    await refresh();
    router.refresh();
  }

  if (isLoading) {
    return (
      <main className="center-page">
        <div className="skeleton" style={{ height: 200, width: 360 }} />
      </main>
    );
  }

  if (!user || (user.role !== 'HR' && user.role !== 'ADMINISTRATOR')) {
    return (
      <PortalLoginForm
        onSignedIn={refresh}
        portalName="HR request form"
        heroTitle="Send the right details once."
        heroSubtitle="Sign in with your HR account to submit a new hire, offboarding, or employee-info request."
        panelEyebrow="HR portal"
        panelIntro="Use your InsideMaps HR account to start a request."
        submitLabel="Enter HR portal"
      />
    );
  }

  return (
    <>
      <div className="hr-topbar">
        <span className="text-muted text-sm">
          Signed in as <strong>{user.name}</strong> ({user.role === 'ADMINISTRATOR' ? 'Administrator' : 'HR'})
        </span>
        <button type="button" className="btn btn-ghost" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
