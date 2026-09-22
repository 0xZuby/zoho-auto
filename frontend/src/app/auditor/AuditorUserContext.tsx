'use client';

import { createContext, useContext } from 'react';
import type { AuthUser } from '@/lib/types';

/**
 * Provides the signed-in Auditor/Administrator to every page nested under
 * the /auditor layout, so only the layout needs to call useCurrentUser().
 */
const AuditorUserContext = createContext<AuthUser | null>(null);

export function AuditorUserProvider({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  return <AuditorUserContext.Provider value={user}>{children}</AuditorUserContext.Provider>;
}

export function useAuditorUser(): AuthUser {
  const user = useContext(AuditorUserContext);
  if (!user) {
    throw new Error('useAuditorUser must be used within the /auditor layout.');
  }
  return user;
}
