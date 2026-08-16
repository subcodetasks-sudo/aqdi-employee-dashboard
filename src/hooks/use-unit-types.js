"use client";

import {
  useReferenceListQuery,
  getReferenceLabel,
  mapReferenceToOptions,
} from "@/src/hooks/use-reference-list";

export const getUnitTypeLabel = getReferenceLabel;

export function mapUnitTypesToOptions(items = []) {
  return mapReferenceToOptions(items, getUnitTypeLabel);
}

export function useUnitTypes(contractType, enabled = true) {
  const { items, isLoading } = useReferenceListQuery({
    queryKey: ["unit-types", contractType],
    endpoint: "/admin/unit-types",
    params: { contract_type: contractType, per_page: 200 },
    enabled: enabled && !!contractType,
  });

  return {
    items,
    options: mapUnitTypesToOptions(items),
    isLoading,
  };
}
