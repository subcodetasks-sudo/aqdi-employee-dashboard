"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
  CONTRACT_STATUSES_API,
  CONTRACT_STATUSES_QUERY_KEY,
  extractContractStatusItems,
  resolveCanceledContractStatusId,
  resolveNewContractStatusId,
  resolveReceivedContractStatusId,
  resolveReturnedContractStatusId,
} from "@/src/lib/contract-statuses";

export function useContractStatuses({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: [CONTRACT_STATUSES_QUERY_KEY],
    queryFn: () => axiosInstance(CONTRACT_STATUSES_API),
    enabled,
    staleTime: 60_000,
  });

  const items = useMemo(
    () => extractContractStatusItems(query.data),
    [query.data]
  );

  const activeItems = useMemo(
    () => items.filter((item) => item?.is_active !== false && item?.is_active !== 0),
    [items]
  );

  return {
    items,
    activeItems,
    newStatusId: resolveNewContractStatusId(items),
    receivedStatusId: resolveReceivedContractStatusId(items),
    returnedStatusId: resolveReturnedContractStatusId(items),
    canceledStatusId: resolveCanceledContractStatusId(items),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
