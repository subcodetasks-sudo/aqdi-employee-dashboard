"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

export const ADMIN_TENANT_ROLES_API = "/admin/tenant-roles";
export const ADMIN_TENANT_ROLES_QUERY_KEY = "admin-tenant-roles";

export function extractAdminTenantRoles(response) {
  const body = response?.data ?? response;
  if (Array.isArray(body?.data?.items)) {
    return {
      items: body.data.items,
      pagination: body.data.pagination ?? null,
    };
  }
  if (Array.isArray(body?.items)) {
    return { items: body.items, pagination: body.pagination ?? null };
  }
  if (Array.isArray(body?.data)) {
    return { items: body.data, pagination: null };
  }
  if (Array.isArray(body)) {
    return { items: body, pagination: null };
  }
  return { items: [], pagination: null };
}

export function buildTenantRolePayload(form) {
  const hasUserInput = Boolean(form.hasUserInput);
  return {
    text_of_reason: String(form.text_of_reason || "").trim(),
    service_definition: form.service_definition?.trim()
      ? form.service_definition.trim()
      : null,
    input_field_label: hasUserInput
      ? String(form.input_field_label || "").trim() || null
      : null,
    input_field_type: hasUserInput ? form.input_field_type || null : null,
    icon: form.icon?.trim() ? form.icon.trim() : null,
    input_icon: hasUserInput && form.input_icon?.trim()
      ? form.input_icon.trim()
      : null,
    pop: Boolean(form.pop),
  };
}

export function useAdminTenantRoles({
  search = "",
  page = 1,
  perPage = 20,
  sortBy = "id",
  sortOrder = "asc",
} = {}) {
  const query = useQuery({
    queryKey: [
      ADMIN_TENANT_ROLES_QUERY_KEY,
      search,
      page,
      perPage,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await axiosInstance.get(ADMIN_TENANT_ROLES_API, {
        params: {
          search: search || undefined,
          page,
          per_page: perPage,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      });
      return extractAdminTenantRoles(res.data);
    },
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
