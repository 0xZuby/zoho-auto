'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth-api';
import type { AuthUser } from '@/lib/types';

interface UseCurrentUserResult {
  user: AuthUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/** Loads the signed-in auditor/administrator from the session cookie, if any. */
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { user, isLoading, refresh };
}
