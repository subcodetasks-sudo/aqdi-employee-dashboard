"use client";

import { useReferenceListQuery } from "@/src/hooks/use-reference-list";

export function usePaperworks(contractType, enabled = true) {
  const { items, isLoading } = useReferenceListQuery({
    queryKey: ["paperworks", contractType],
    endpoint: "/admin/paperworks",
    params: { contract_type: contractType, per_page: 100 },
    enabled: enabled && !!contractType,
  });

  return {
    items,
    isLoading,
  };
}
