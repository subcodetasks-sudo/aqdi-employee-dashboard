"use client";

import { useMemo } from "react";
import {
  useReferenceListQuery,
  getReferenceLabel,
} from "@/src/hooks/use-reference-list";

export const getCityLabel = getReferenceLabel;

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
  const { items, isLoading } = useReferenceListQuery({
    queryKey: ["cities"],
    endpoint: "/admin/cities",
    params: { per_page: 500 },
    enabled,
  });

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
    isLoading,
  };
}
