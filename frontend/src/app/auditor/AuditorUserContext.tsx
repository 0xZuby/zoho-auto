'use client';

import { createContext, useContext, useState } from 'react';
import type { AuthUser } from '@/lib/types';

/**
 * Provides the signed-in Auditor/Administrator and the active sidebar section
 * override (used when viewing a request detail page) to every page nested
 * under the /auditor layout.
 */
interface AuditorContextValue {
  user: AuthUser;
  activeNavHref: string | null;
  setActiveNavHref: (href: string | null) => void;
}

const AuditorUserContext = createContext<AuditorContextValue | null>(null);

export function AuditorUserProvider({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const [activeNavHref, setActiveNavHref] = useState<string | null>(null);
  return (
    <AuditorUserContext.Provider value={{ user, activeNavHref, setActiveNavHref }}>
      {children}
    </AuditorUserContext.Provider>
  );
}

export function useAuditorUser(): AuthUser {
  const ctx = useContext(AuditorUserContext);
  if (!ctx) {
    throw new Error('useAuditorUser must be used within the /auditor layout.');
  }
  return ctx.user;
}

export function useAuditorNav() {
  const ctx = useContext(AuditorUserContext);
  if (!ctx) {
    throw new Error('useAuditorNav must be used within the /auditor layout.');
  }
  return { activeNavHref: ctx.activeNavHref, setActiveNavHref: ctx.setActiveNavHref };
}
