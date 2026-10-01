'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';

// Home "آخر النشاطات" is fed from the same source as the notification panel:
// new orders still waiting to be received (status_id=1).
const ACTIVITY_LIMIT = 6;

async function fetchUnreceivedOrders() {
  const response = await axiosInstance.get(
    `/admin/orders?status_id=1&per_page=${ACTIVITY_LIMIT}&page=1`,
  );
  return response?.data?.data ?? {};
}

function mapOrderToActivity(order, hrefBase) {
  const idLabel = order?.uuid
    ? `#${order.uuid}`
    : order?.id != null
      ? `#${order.id}`
      : '';

  return {
    id: order?.id ?? order?.uuid,
    type: 'order_new',
    title: order?.contract_type
      ? `طلب ${order.contract_type} جديد`
      : 'طلب جديد بانتظار الاستلام',
    subtitle: [idLabel, 'بانتظار الاستلام'].filter(Boolean).join(' · '),
    href: order?.id != null ? `${hrefBase}/${order.id}` : null,
    created_at: order?.created_at || order?.updated_at || null,
  };
}

export function useHomeRecentActivity({
  enabled = true,
  hrefBase = '/home/orders',
} = {}) {
  const query = useQuery({
    queryKey: ['unReceivedOrders', 'home-activity'],
    queryFn: fetchUnreceivedOrders,
    enabled,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });

  const raw = query.data;
  const items = raw?.items ?? (Array.isArray(raw) ? raw : []);

  return {
    activity: items.map((order) => mapOrderToActivity(order, hrefBase)),
    total: raw?.pagination?.total ?? items.length,
    isLoading: enabled && query.isLoading,
    isError: query.isError,
  };
}
