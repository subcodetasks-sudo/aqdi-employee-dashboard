'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';
import { fetchUnreceivedOrdersTotal } from '@/src/hooks/use-unreceived-orders-watcher';

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

async function fetchReport(endpoint, period) {
    const res = await axiosInstance.get(`/admin/reports/${endpoint}`, {
        params: { period },
    });
    return res?.data?.data ?? {};
}

const retryUnlessAuthError = (failureCount, error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) return false;
    return failureCount < 2;
};

/**
 * Live KPI counters for the /home welcome cards.
 *
 * - The reports figures come from `/admin/reports/*`, which require the
 *   `analytics` permission — pass `canAnalytics` so we never fire (and get
 *   force-logged-out by) a 401 for users without it.
 * - `unreceived_realtime` comes from the same count that powers the sidebar
 *   badge — gate it with `canUnreceived` (orders / realtime view).
 *
 * Any field whose source is disabled or unavailable is returned as `null`, and
 * the card renders "—" rather than a stale placeholder.
 */
export function useHomeSummary({ canAnalytics = false, canUnreceived = false } = {}) {
    const ordersAll = useQuery({
        queryKey: ['home-summary', 'orders', 'all'],
        queryFn: () => fetchReport('orders', 'all'),
        enabled: canAnalytics,
        staleTime: 60_000,
        retry: retryUnlessAuthError,
    });

    const ordersToday = useQuery({
        queryKey: ['home-summary', 'orders', 'today'],
        queryFn: () => fetchReport('orders', 'today'),
        enabled: canAnalytics,
        staleTime: 60_000,
        retry: retryUnlessAuthError,
    });

    const salesToday = useQuery({
        queryKey: ['home-summary', 'sales', 'today'],
        queryFn: () => fetchReport('sales', 'today'),
        enabled: canAnalytics,
        staleTime: 60_000,
        retry: retryUnlessAuthError,
    });

    const customersWeek = useQuery({
        queryKey: ['home-summary', 'customers', 'last_7_days'],
        queryFn: () => fetchReport('customers', 'last_7_days'),
        enabled: canAnalytics,
        staleTime: 60_000,
        retry: retryUnlessAuthError,
    });

    const unreceived = useQuery({
        queryKey: ['unReceivedOrdersTotal'],
        queryFn: fetchUnreceivedOrdersTotal,
        enabled: canUnreceived,
        staleTime: 30_000,
        retry: retryUnlessAuthError,
    });

    const allKpis = ordersAll.data?.kpis ?? {};
    const todayKpis = ordersToday.data?.kpis ?? {};
    const salesKpis = salesToday.data?.kpis ?? {};
    const customersKpis = customersWeek.data?.kpis ?? {};

    return {
        summary: {
            pending_orders: canAnalytics ? toNumber(allKpis.incomplete) : null,
            completed_today: canAnalytics ? toNumber(todayKpis.paid) : null,
            return_orders: canAnalytics ? toNumber(allKpis.returned) : null,
            new_clients_this_week: canAnalytics ? toNumber(customersKpis.new) : null,
            unreceived_realtime: canUnreceived ? toNumber(unreceived.data) : null,
            revenue_today: canAnalytics ? toNumber(salesKpis.total_sales) : null,
            currency: 'SAR',
        },
        isLoading:
            (canAnalytics &&
                (ordersAll.isLoading ||
                    ordersToday.isLoading ||
                    salesToday.isLoading ||
                    customersWeek.isLoading)) ||
            (canUnreceived && unreceived.isLoading),
    };
}
