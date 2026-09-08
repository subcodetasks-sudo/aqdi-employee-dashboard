'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';
import { useUserStore } from '@/src/stores/user-store';
import {
  canAccess,
  canAccessAny,
  canAccessRoute,
  extractPermissionsFromRole,
  getFirstAllowedHref,
  getSectionForPath,
  isSuperAdmin,
  normalizeUserPermissions,
  resolveAuthUser,
} from '@/src/lib/permissions';

export function usePermissions() {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state._hasHydrated);
  const setUser = useUserStore((state) => state.setUser);

  const authUser = useMemo(() => resolveAuthUser(user), [user]);
  const storedPermissions = useMemo(() => normalizeUserPermissions(user), [user]);

  const roleId = authUser?.role_id ?? null;

  const shouldFetchRole =
    !!roleId && storedPermissions.length === 0 && !isSuperAdmin(user);

  const {
    data: rolePermissionsData,
    isLoading: rolePermissionsLoading,
    isError: rolePermissionsError,
  } = useQuery({
    queryKey: ['my-role-permissions', roleId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/roles/${roleId}`);
      return res?.data;
    },
    enabled: shouldFetchRole,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  useEffect(() => {
    if (!rolePermissionsData) return;

    const names = extractPermissionsFromRole(rolePermissionsData);
    if (names.length === 0) return;

    const currentUser = useUserStore.getState().user;
    if (!currentUser) return;
    if (normalizeUserPermissions(currentUser).length > 0) return;

    setUser({
      ...currentUser,
      permissions: names,
    });
  }, [rolePermissionsData, setUser]);

  const permissions = useMemo(() => {
    const fromUser = normalizeUserPermissions(user);
    if (fromUser.length > 0) return fromUser;
    if (rolePermissionsData) return extractPermissionsFromRole(rolePermissionsData);
    return [];
  }, [user, rolePermissionsData]);

  // True only while we still need the role payload to know what the user can do.
  // On error we settle with whatever we have (usually []) — fail closed, don't keep
  // the UI in a "show everything" loading state forever.
  const isPermissionsLoading =
    shouldFetchRole && rolePermissionsLoading && !rolePermissionsError;

  // Hydrated + permission resolution settled. Callers must hide gated nav/tabs
  // until this is true (`isReady && can(...)`), never `!isReady || can(...)`.
  const isReady = hasHydrated && !isPermissionsLoading;

  const can = useCallback(
    (section, action = 'view') => canAccess(permissions, user, section, action),
    [permissions, user]
  );

  const canAny = useCallback(
    (section, actions = []) => canAccessAny(permissions, user, section, actions),
    [permissions, user]
  );

  const canRoute = useCallback(
    (pathname) => canAccessRoute(pathname, permissions, user),
    [permissions, user]
  );

  const isAdmin = useMemo(() => isSuperAdmin(user), [user]);

  return {
    user: authUser ?? user,
    permissions,
    roleId,
    isAdmin,
    isReady,
    isPermissionsLoading,
    can,
    canAny,
    canRoute,
    getSectionForPath,
    firstAllowedHref: getFirstAllowedHref(permissions, user),
  };
}
