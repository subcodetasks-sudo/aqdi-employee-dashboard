"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

export const TENANT_ROLES_API = "/v2/tenant-roles";
export const TENANT_ROLES_QUERY_KEY = "tenant-roles";

export function extractTenantRoles(response) {
  const body = response?.data ?? response;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body)) return body;
  return [];
}

export function getTenantRoleLabel(role = {}) {
  return (
    role?.text_of_reason ??
    role?.name ??
    role?.label ??
    role?.title ??
    (role?.id != null ? String(role.id) : "—")
  );
}

export function mapTenantRolesToOptions(roles = []) {
  return roles
    .filter((role) => role?.id != null)
    .map((role) => ({
      value: String(role.id),
      label: String(getTenantRoleLabel(role)).trim() || String(role.id),
    }));
}

async function fetchTenantRoles() {
  const res = await axiosInstance.get(TENANT_ROLES_API);
  return extractTenantRoles(res.data);
}

export function useTenantRoles(enabled = true) {
  const query = useQuery({
    queryKey: [TENANT_ROLES_QUERY_KEY],
    queryFn: fetchTenantRoles,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const items = query.data ?? [];

  return {
    items,
    options: mapTenantRolesToOptions(items),
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
