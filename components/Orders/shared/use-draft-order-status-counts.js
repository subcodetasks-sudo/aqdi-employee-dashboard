import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
  DRAFT_ORDERS_API,
  buildDraftOrdersUrl,
} from "@/src/lib/draft-contract-statuses";

const COUNT_QUERY_OPTIONS = {
  staleTime: 60_000,
  gcTime: 10 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  retry: false,
};

const extractTotal = (response) => {
  const body = response?.data;
  return (
    body?.data?.pagination?.total ??
    body?.data?.data?.pagination?.total ??
    body?.pagination?.total ??
    0
  );
};

const fetchListTotal = async (url) => {
  const separator = url.includes("?") ? "&" : "?";
  const response = await axiosInstance(`${url}${separator}page=1&per_page=1`);
  return extractTotal(response);
};

/** Counts draft orders per contract status via GET /admin/orders/draft?status_id= */
export function useDraftOrderStatusCounts(statusItems = []) {
  const statusIds = useMemo(
    () => (statusItems ?? []).map((item) => item.id).filter(Boolean),
    [statusItems]
  );

  const queries = useQueries({
    queries: useMemo(
      () => [
        {
          queryKey: ["draft-order-status-count", "all"],
          queryFn: () => fetchListTotal(DRAFT_ORDERS_API),
          ...COUNT_QUERY_OPTIONS,
        },
        ...statusIds.map((id) => ({
          queryKey: ["draft-order-status-count", "status_id", id],
          queryFn: () =>
            fetchListTotal(buildDraftOrdersUrl({ statusId: id })),
          enabled: Boolean(id),
          ...COUNT_QUERY_OPTIONS,
        })),
      ],
      [statusIds]
    ),
  });

  const allTotal = queries[0]?.data ?? 0;
  const byId = statusIds.reduce((acc, id, index) => {
    acc[id] = queries[index + 1]?.data ?? 0;
    return acc;
  }, {});

  const isLoading = queries.some((query) => query.isLoading);

  return { allTotal, byId, isLoading };
}
