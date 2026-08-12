"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { NEW_CONTRACT_STATUS_ID } from "@/src/lib/contract-statuses";

export const REALTIME_NEW_ORDERS_QUERY_KEY = "realtime-new-orders";
export const REALTIME_ORDERS_QUERY_KEY = "realtime-orders";
export const ALL_ORDERS_QUERY_KEY = "all-orders";
export const ADMIN_ORDERS_API = "/admin/orders";

const DEFAULT_NEW_PER_PAGE = 100;
const MAX_PAGES = 5;
const DEFAULT_REFETCH_INTERVAL = 15_000;
const TABLE_PER_PAGE = 20;

export function extractOrdersPayload(response) {
  const body = response?.data ?? response;
  const payload = body?.data ?? body;
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.data?.items)
      ? payload.data.items
      : [];
  const pagination = payload?.pagination ?? payload?.data?.pagination ?? null;
  return { items, pagination };
}

export function buildAdminOrdersParams({
  page = 1,
  perPage = TABLE_PER_PAGE,
  search,
  contractStatusId,
  isCompleted,
  isReceived,
  employeeId,
  contractType,
} = {}) {
  const params = { page, per_page: perPage };

  if (search) params.search = search;
  if (contractStatusId != null && contractStatusId !== "") {
    params.contract_status_id = contractStatusId;
  }
  if (isCompleted === 0 || isCompleted === 1 || isCompleted === "0" || isCompleted === "1") {
    params.is_completed = isCompleted;
  }
  if (isReceived === true || isReceived === false || isReceived === "true" || isReceived === "false") {
    params.is_received = isReceived;
  }
  if (employeeId != null && employeeId !== "") {
    params.employee_id = employeeId;
  }
  if (contractType) params.contract_type = contractType;

  return params;
}

export function buildAdminOrdersUrl(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value == null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `${ADMIN_ORDERS_API}?${qs}` : ADMIN_ORDERS_API;
}

async function fetchAdminOrders(params) {
  const response = await axiosInstance.get(ADMIN_ORDERS_API, { params });
  const { items, pagination } = extractOrdersPayload(response);
  return {
    items,
    pagination,
    total: pagination?.total ?? items.length,
  };
}

async function fetchOrdersByContractStatus(statusId, { perPage = DEFAULT_NEW_PER_PAGE } = {}) {
  const first = await fetchAdminOrders(
    buildAdminOrdersParams({
      page: 1,
      perPage,
      contractStatusId: statusId,
    })
  );
  const lastPage = Math.min(first.pagination?.last_page ?? 1, MAX_PAGES);

  if (lastPage <= 1) return first;

  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      fetchAdminOrders(
        buildAdminOrdersParams({
          page: index + 2,
          perPage,
          contractStatusId: statusId,
        })
      )
    )
  );

  const allItems = [...first.items, ...rest.flatMap((page) => page.items)];
  return {
    items: allItems,
    pagination: first.pagination,
    total: first.pagination?.total ?? allItems.length,
  };
}

export function useRealtimeNewOrders({
  statusId = NEW_CONTRACT_STATUS_ID,
  enabled = true,
  autoRefresh = true,
  refetchInterval = DEFAULT_REFETCH_INTERVAL,
} = {}) {
  const query = useQuery({
    queryKey: [REALTIME_NEW_ORDERS_QUERY_KEY, statusId],
    queryFn: () => fetchOrdersByContractStatus(statusId),
    enabled: enabled && statusId != null && statusId !== "",
    refetchInterval: autoRefresh ? refetchInterval : false,
    refetchIntervalInBackground: Boolean(autoRefresh),
    placeholderData: keepPreviousData,
  });

  const items = query.data?.items ?? [];

  return {
    items,
    total: query.data?.total ?? items.length,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

export function useRealtimeOrdersList({
  params,
  enabled = true,
  autoRefresh = false,
  refetchInterval = DEFAULT_REFETCH_INTERVAL,
  queryKey = REALTIME_ORDERS_QUERY_KEY,
} = {}) {
  const query = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => fetchAdminOrders(params),
    enabled,
    refetchInterval: autoRefresh ? refetchInterval : false,
    refetchIntervalInBackground: Boolean(autoRefresh),
    placeholderData: keepPreviousData,
  });

  const items = query.data?.items ?? [];

  return {
    items,
    total: query.data?.total ?? items.length,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
