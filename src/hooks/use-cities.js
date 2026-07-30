"use client";

import { useMemo } from "react";
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

async function fetchCities() {
  const res = await axiosInstance.get("/admin/cities", {
    params: { per_page: 500 },
  });
  return normalizeList(res.data);
}

export function getCityLabel(item = {}) {
  return (
    item?.name_trans ||
    item?.name_ar ||
    item?.name ||
    item?.name_en ||
    (item?.id != null ? String(item.id) : "—")
  );
}

export function getCityRegionId(item = {}) {
  return item?.region_id ?? item?.regions?.id ?? item?.region?.id ?? null;
}

export function mapCitiesToOptions(items = []) {
  return items
    .filter((item) => item?.id != null)
    .map((item) => ({
      value: String(item.id),
      label: String(getCityLabel(item)).trim() || String(item.id),
      regionId:
        getCityRegionId(item) != null ? String(getCityRegionId(item)) : null,
    }));
}

export function useCities({ enabled = true, regionId = null } = {}) {
  const query = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    enabled,
    staleTime: 60_000,
  });

  const items = query.data ?? [];
  const regionKey =
    regionId === null || regionId === undefined || regionId === ""
      ? null
      : String(regionId);

  const filteredItems = useMemo(() => {
    if (!regionKey) return items;
    return items.filter((item) => String(getCityRegionId(item)) === regionKey);
  }, [items, regionKey]);

  return {
    items: filteredItems,
    options: mapCitiesToOptions(filteredItems),
    isLoading: query.isLoading,
  };
}
