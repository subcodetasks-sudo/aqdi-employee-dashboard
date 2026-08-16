"use client";

import {
  useReferenceListQuery,
  getReferenceLabel,
  mapReferenceToOptions,
} from "@/src/hooks/use-reference-list";

export const getPaymentTypeLabel = getReferenceLabel;

export function mapPaymentTypesToOptions(items = []) {
  return mapReferenceToOptions(items, getPaymentTypeLabel);
}

export function usePaymentTypes(contractType, enabled = true) {
  const { items, isLoading } = useReferenceListQuery({
    queryKey: ["payment-types", contractType],
    endpoint: "/admin/payment-types",
    params: { contract_type: contractType, per_page: 100 },
    enabled: enabled && !!contractType,
  });

  return {
    items,
    options: mapPaymentTypesToOptions(items),
    isLoading,
  };
}
