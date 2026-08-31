'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';
import { useContractStatuses } from '@/src/hooks/use-contract-statuses';
import { RETURN_CONTRACT_STATUS_ID } from '@/src/lib/contract-statuses';

const POLL_INTERVAL = 60_000;

const fetchReturnedOrdersTotal = async (statusId) => {
  const response = await axiosInstance.get('/admin/orders', {
    params: { status_id: statusId, per_page: 1, page: 1 },
  });
  const body = response?.data?.data ?? response?.data ?? {};
  return body?.pagination?.total ?? 0;
};

// Polls the total number of returned (مسترجع) contracts for the sidebar badge.
export function useReturnedOrdersCount() {
  const { returnedStatusId } = useContractStatuses();
  const statusId = returnedStatusId ?? RETURN_CONTRACT_STATUS_ID;

  const { data: total } = useQuery({
    queryKey: ['returnedOrdersTotal', statusId],
    queryFn: () => fetchReturnedOrdersTotal(statusId),
    enabled: statusId != null && statusId !== '',
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: 30_000,
  });

  return total ?? 0;
}
