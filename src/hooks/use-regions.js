"use client";

import {
  useReferenceListQuery,
  getReferenceLabel,
  mapReferenceToOptions,
} from "@/src/hooks/use-reference-list";

export const getRegionLabel = getReferenceLabel;

export function mapRegionsToOptions(items = []) {
  return mapReferenceToOptions(items, getRegionLabel);
}

export function useRegions(enabled = true) {
  const { items, isLoading } = useReferenceListQuery({
    queryKey: ["regions"],
    endpoint: "/admin/regions",
    params: { per_page: 200 },
    enabled,
  });

  return {
    items,
    options: mapRegionsToOptions(items),
    isLoading,
  };
}
