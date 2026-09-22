"use client";

import {
  useReferenceListQuery,
  getReferenceLabel,
  mapReferenceToOptions,
} from "@/src/hooks/use-reference-list";

export const getPropertyTypeLabel = getReferenceLabel;

export function mapPropertyTypesToOptions(items = []) {
  return mapReferenceToOptions(items, getPropertyTypeLabel);
}

export function usePropertyTypes(contractType, enabled = true) {
  const { items, isLoading } = useReferenceListQuery({
    queryKey: ["property-types", contractType],
    endpoint: "/admin/real-estate-types",
    params: { contract_type: contractType, per_page: 200 },
    enabled: enabled && !!contractType,
  });

  return {
    items,
    options: mapPropertyTypesToOptions(items),
    isLoading,
  };
}
