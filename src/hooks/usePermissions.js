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
} from '@/src/lib/permissions';

export function usePermissions() {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state._hasHydrated);
  const setUser = useUserStore((state) => state.setUser);

  const storedPermissions = useMemo(() => normalizeUserPermissions(user), [user]);

  const shouldFetchRole =
    !!user?.role_id && storedPermissions.length === 0 && !isSuperAdmin(user);

  const {
    data: rolePermissionsData,
    isLoading: rolePermissionsLoading,
    isError: rolePermissionsError,
  } = useQuery({
    queryKey: ['my-role-permissions', user?.role_id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/roles/${user.role_id}`);
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

  const isReady = hasHydrated;
  const isPermissionsLoading =
    shouldFetchRole && rolePermissionsLoading && !rolePermissionsError;

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
    user,
    permissions,
    roleId: user?.role_id ?? null,
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
