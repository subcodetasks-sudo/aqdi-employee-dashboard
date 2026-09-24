"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

export const ADMIN_SERVICES_PRICING_API = "/admin/services-pricing";
export const SERVICES_PRICING_QUERY_KEY = "services-pricing";

export function extractAdminServicesPricing(response) {
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

function parseOptionalNumber(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildServicesPricingPayload(form) {
  const payload = {
    name_ar: String(form.name_ar || "").trim(),
    contract_type: form.contract_type,
  };

  const nameEn = String(form.name_en || "").trim();
  if (nameEn) payload.name_en = nameEn;

  const price = parseOptionalNumber(form.price);
  if (price != null) payload.price = price;

  return payload;
}

export function useAdminServicesPricing({
  page = 1,
  perPage = 20,
  contractType = "",
  search = "",
} = {}) {
  const query = useQuery({
    queryKey: [
      SERVICES_PRICING_QUERY_KEY,
      "admin",
      page,
      perPage,
      contractType || "all",
      search,
    ],
    queryFn: async () => {
      const res = await axiosInstance.get(ADMIN_SERVICES_PRICING_API, {
        params: {
          page,
          per_page: perPage,
          contract_type: contractType || undefined,
          search: search || undefined,
        },
      });
      return extractAdminServicesPricing(res.data);
    },
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
