'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Loader from '@/components/home/loader';
import HomeWelcomeSkeleton from '@/components/home/home-welcome-skeleton';
import { usePermissions } from '@/src/hooks/usePermissions';
import { getSectionForPath } from '@/src/lib/permissions';

function PageLoadingFallback({ pathname }) {
  if (pathname === '/home') {
    return <HomeWelcomeSkeleton />;
  }
  return <Loader />;
}

export default function RoutePermissionGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { canRoute, isReady, firstAllowedHref, user } = usePermissions();

  const section = getSectionForPath(pathname);
  const allowed = canRoute(pathname);
  const requiresPermissionCheck = section !== null;

  useEffect(() => {
    if (!isReady) return;

    // Redirect only — do not call logout() here. Clearing storage on a null user
    // races with persist rehydration and can wipe a valid session (esp. on
    // secondary pages that mount extra API calls like return-orders).
    if (!user) {
      router.replace('/login');
      return;
    }

    if (allowed) return;

    toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
    router.replace(firstAllowedHref);
  }, [isReady, allowed, firstAllowedHref, router, user]);

  if (!isReady || !user) {
    return <PageLoadingFallback pathname={pathname} />;
  }

  if (!allowed && requiresPermissionCheck) {
    return <PageLoadingFallback pathname={pathname} />;
  }

  return children;
}
