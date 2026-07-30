"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

function normalizeList(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

async function fetchUnitTypes(contractType) {
  const res = await axiosInstance.get("/admin/unit-types", {
    params: {
      contract_type: contractType,
      per_page: 200,
    },
  });
  return normalizeList(res.data);
}

export function getUnitTypeLabel(item = {}) {
  return (
    item?.name_trans ||
    item?.name_ar ||
    item?.name ||
    item?.name_en ||
    (item?.id != null ? String(item.id) : "—")
  );
}

export function mapUnitTypesToOptions(items = []) {
  return items
    .filter((item) => item?.id != null)
    .map((item) => ({
      value: String(item.id),
      label: String(getUnitTypeLabel(item)).trim() || String(item.id),
    }));
}

export function useUnitTypes(contractType, enabled = true) {
  const query = useQuery({
    queryKey: ["unit-types", contractType],
    queryFn: () => fetchUnitTypes(contractType),
    enabled: enabled && !!contractType,
    staleTime: 60_000,
  });

  const items = query.data ?? [];

  return {
    items,
    options: mapUnitTypesToOptions(items),
    isLoading: query.isLoading,
  };
}
