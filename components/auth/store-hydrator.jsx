'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/src/stores/user-store';
import { bootstrapAuthSession } from '@/src/utils/axios';

export default function StoreHydrator({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await bootstrapAuthSession();
      } finally {
        if (cancelled) return;
        useUserStore.getState().hydrate();
        useUserStore.setState({ _hasHydrated: true });
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return children;
}
