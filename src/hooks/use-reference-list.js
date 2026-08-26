"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

export function normalizeListResponse(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export function getReferenceLabel(item = {}) {
  return (
    item?.name_trans ||
    item?.name_ar ||
    item?.name ||
    item?.name_en ||
    (item?.id != null ? String(item.id) : "—")
  );
}

export function mapReferenceToOptions(items = [], getLabel = getReferenceLabel) {
  return items
    .filter((item) => item?.id != null)
    .map((item) => ({
      value: String(item.id),
      label: String(getLabel(item)).trim() || String(item.id),
    }));
}

/** Shared fetch+normalize+cache wiring for simple "list of reference items" endpoints. */
export function useReferenceListQuery({ queryKey, endpoint, params, enabled = true }) {
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axiosInstance.get(endpoint, { params });
      return normalizeListResponse(res.data);
    },
    enabled,
    staleTime: 60_000,
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
