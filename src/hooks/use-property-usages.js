"use client";

import {
  useReferenceListQuery,
  getReferenceLabel,
  mapReferenceToOptions,
} from "@/src/hooks/use-reference-list";

export const getPropertyUsageLabel = getReferenceLabel;

export function mapPropertyUsagesToOptions(items = []) {
  return mapReferenceToOptions(items, getPropertyUsageLabel);
}

export function usePropertyUsages(contractType, enabled = true) {
  const { items, isLoading } = useReferenceListQuery({
    queryKey: ["property-usages", contractType],
    endpoint: "/admin/real-estate-usages",
    params: { contract_type: contractType, per_page: 200 },
    enabled: enabled && !!contractType,
  });

  return {
    items,
    options: mapPropertyUsagesToOptions(items),
    isLoading,
  };
}
