'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';
import { isAllOrdersListPath } from '@/src/lib/order-routes';
import { useSidebarStore } from '@/src/stores/sidebar-store';

const POLL_INTERVAL = 30_000;

const fetchUnreceivedOrdersTotal = async () => {
  const response = await axiosInstance.get('/admin/orders?is_received=false&per_page=1&page=1');
  return response?.data?.data?.pagination?.total ?? 0;
};

function openNotificationsSidebar({ queryClient, setSidebarOpen, setDisplayedPart }) {
  queryClient.invalidateQueries({ queryKey: ['unReceivedOrders'] });
  setSidebarOpen(true);
  setDisplayedPart('notification');
}

// Polls unreceived-orders count and opens the notification sidebar
// only on the جميع الطلبات page (`/home/orders`).
export function useUnreceivedOrdersWatcher() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { setDisplayedPart, setSidebarOpen } = useSidebarStore();
  const previousTotalRef = useRef(null);
  const isAllOrdersPage = isAllOrdersListPath(pathname);

  const { data: total } = useQuery({
    queryKey: ['unReceivedOrdersTotal'],
    queryFn: fetchUnreceivedOrdersTotal,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!isAllOrdersPage || total === undefined || total <= 0) return;

    openNotificationsSidebar({ queryClient, setSidebarOpen, setDisplayedPart });
  }, [isAllOrdersPage, total, queryClient, setSidebarOpen, setDisplayedPart]);

  useEffect(() => {
    if (total === undefined) return;

    const previousTotal = previousTotalRef.current;
    if (
      isAllOrdersPage &&
      previousTotal !== null &&
      total > previousTotal
    ) {
      openNotificationsSidebar({ queryClient, setSidebarOpen, setDisplayedPart });
    }
    previousTotalRef.current = total;
  }, [isAllOrdersPage, total, queryClient, setSidebarOpen, setDisplayedPart]);

  return total ?? 0;
}
