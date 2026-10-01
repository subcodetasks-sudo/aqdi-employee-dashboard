'use client';

import { usePermissions } from '@/src/hooks/use-permissions';

/**
 * Renders children only when the current user has the given section permission.
 */
export default function PermissionGate({
  section,
  action = 'view',
  children,
  fallback = null,
}) {
  const { can, isReady } = usePermissions();

  if (!section) return children;
  if (!isReady) return null;
  if (!can(section, action)) return fallback;

  return children;
}
