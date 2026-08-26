import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

const COUNT_QUERY_OPTIONS = {
  staleTime: 60_000,
  gcTime: 10 * 60_000,
  refetchOnWindowFocus: false,
  // Must refetch when stale (e.g. after invalidateQueries) so status tabs update
  refetchOnMount: true,
  retry: false,
};

const extractTotal = (response) => {
  const body = response?.data;
  return (
    body?.data?.data?.pagination?.total ??
    body?.data?.pagination?.total ??
    0
  );
};

const fetchListTotal = async (url) => {
  const separator = url.includes("?") ? "&" : "?";
  const response = await axiosInstance(`${url}${separator}page=1&per_page=1`);
  return extractTotal(response);
};

export function useOrderStatusCounts(
  statusItems = [],
  { baseUrl, statusParam = "status_id", extraParams = "" } = {}
) {
  const params = extraParams ? extraParams.replace(/^&/, "") : "";
  const allUrl = params ? `${baseUrl}?${params}` : baseUrl;
  const statusIds = useMemo(
    () => (statusItems ?? []).map((item) => item.id).filter(Boolean),
    [statusItems]
  );

  const queries = useQueries({
    queries: useMemo(
      () => [
        {
          queryKey: ["order-status-count", baseUrl, "all", params],
          queryFn: () => fetchListTotal(allUrl),
          enabled: Boolean(baseUrl),
          ...COUNT_QUERY_OPTIONS,
        },
        ...statusIds.map((id) => ({
          queryKey: ["order-status-count", baseUrl, id, params],
          queryFn: () =>
            fetchListTotal(
              `${baseUrl}?${statusParam}=${id}${params ? `&${params}` : ""}`
            ),
          enabled: Boolean(baseUrl),
          ...COUNT_QUERY_OPTIONS,
        })),
      ],
      [allUrl, baseUrl, params, statusIds, statusParam]
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
