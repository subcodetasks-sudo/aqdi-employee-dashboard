"use client";

import {
  useReferenceListQuery,
  getReferenceLabel,
  mapReferenceToOptions,
} from "@/src/hooks/use-reference-list";

export const getUnitUsageLabel = getReferenceLabel;

export function mapUnitUsagesToOptions(items = []) {
  return mapReferenceToOptions(items, getUnitUsageLabel);
}

export function useUnitUsages(contractType, enabled = true) {
  const { items, isLoading } = useReferenceListQuery({
    queryKey: ["unit-usages", contractType],
    endpoint: "/admin/unit-usages",
    params: { contract_type: contractType, per_page: 200 },
    enabled: enabled && !!contractType,
  });

  return {
    items,
    options: mapUnitUsagesToOptions(items),
    isLoading,
  };
}
