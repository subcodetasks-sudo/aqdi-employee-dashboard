'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/src/stores/user-store';
import { bootstrapAuthSession } from '@/src/utils/axios';

export default function StoreHydrator() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      useUserStore.getState().hydrate();
      await bootstrapAuthSession();
      // Re-read: bootstrap may have refreshed (or invalidated) the session.
      if (!cancelled) {
        useUserStore.getState().hydrate();
        useUserStore.setState({ _hasHydrated: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
