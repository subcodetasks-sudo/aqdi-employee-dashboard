"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
  MARKETING_PERIODS,
  MarketingPeriodProvider,
  useMarketingPeriod,
} from "@/components/content/marketing/shared/marketing-period-context";

/**
 * Marketing-tracking API wiring — three read-only snapshot endpoints under
 * `/admin/marketing-tracking` (see prompts/admin-marketing-tracking.md):
 *
 *   GET /admin/marketing-tracking            → overview (ROAS header, KPIs, chart, top-lists, best/weakest)
 *   GET /admin/marketing-tracking/keywords   → keyword-ranking cards + table
 *   GET /admin/marketing-tracking/channels   → marketing funnel + paid-channel ROI
 *
 * All three take the same shared period filter and require `analytics.view`.
 * Every response echoes `period` / `date_from` / `date_to` / `periods` and a
 * `currency_label_ar`. Nothing here computes ROAS / CAC / funnel % — those come
 * from the API already formatted.
 */

export const MARKETING_TRACKING_QUERY_KEY = "marketing-tracking";

// The shared period filter now lives in a context provider so every marketing
// hook + <PeriodFilterBar> read one computed value. Re-exported here so existing
// `@/src/hooks/use-marketing-tracking` imports keep working.
export {
  MARKETING_PERIODS,
  MarketingPeriodProvider,
  useMarketingPeriod,
};

const retryUnlessClientError = (failureCount, error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 404 || status === 422) return false;
  return failureCount < 2;
};

function useTrackingQuery(segment, queryParams, { enabled = true } = {}) {
  const query = useQuery({
    queryKey: [MARKETING_TRACKING_QUERY_KEY, segment, queryParams],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/marketing-tracking${segment ? `/${segment}` : ""}`,
        { params: queryParams }
      );
      return res?.data?.data ?? null;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: retryUnlessClientError,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Overview page: sections 3 + 4 (one fetch). */
export function useMarketingOverview({ enabled = true } = {}) {
  const { queryParams } = useMarketingPeriod();
  return useTrackingQuery("", queryParams, { enabled });
}

/** Section 1: keyword-ranking summary cards + table. */
export function useMarketingKeywords({ enabled = true } = {}) {
  const { queryParams } = useMarketingPeriod();
  return useTrackingQuery("keywords", queryParams, { enabled });
}

/** Section 2: marketing funnel + paid-channel ROI. */
export function useMarketingChannels({ enabled = true } = {}) {
  const { queryParams } = useMarketingPeriod();
  return useTrackingQuery("channels", queryParams, { enabled });
}
