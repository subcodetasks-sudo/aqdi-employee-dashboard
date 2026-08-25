'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/src/stores/user-store';

export default function StoreHydrator() {
  useEffect(() => {
    const finishHydration = () => {
      useUserStore.setState({ _hasHydrated: true });
    };

    const unsubFinish = useUserStore.persist.onFinishHydration(finishHydration);

    if (useUserStore.persist.hasHydrated()) {
      finishHydration();
      return unsubFinish;
    }

    void Promise.resolve(useUserStore.persist.rehydrate()).finally(finishHydration);

    return () => {
      unsubFinish();
    };
  }, []);

  return null;
}
