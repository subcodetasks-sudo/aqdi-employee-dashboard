'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';
import { useContractStatuses } from '@/src/hooks/use-contract-statuses';
import { RETURN_CONTRACT_STATUS_ID } from '@/src/lib/contract-statuses';
import { useUserStore } from '@/src/stores/user-store';

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
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasHydrated = useUserStore((state) => state._hasHydrated);
  const canPoll = hasHydrated && isAuthenticated;
  const { returnedStatusId } = useContractStatuses({ enabled: canPoll });
  const statusId = returnedStatusId ?? RETURN_CONTRACT_STATUS_ID;

  const { data: total } = useQuery({
    queryKey: ['returnedOrdersTotal', statusId],
    queryFn: () => fetchReturnedOrdersTotal(statusId),
    enabled: canPoll && statusId != null && statusId !== '',
    refetchInterval: canPoll ? POLL_INTERVAL : false,
    refetchIntervalInBackground: true,
    staleTime: 30_000,
  });

  return total ?? 0;
}
