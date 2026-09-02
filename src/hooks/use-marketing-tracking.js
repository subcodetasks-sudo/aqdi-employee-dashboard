"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

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

// Canonical period keys accepted by the admin reports/tracking endpoints.
export const MARKETING_PERIODS = [
  { key: "today", label_ar: "اليوم" },
  { key: "yesterday", label_ar: "أمس" },
  { key: "last_7_days", label_ar: "آخر 7 أيام" },
  { key: "last_30_days", label_ar: "آخر 30 يومًا" },
  { key: "all", label_ar: "الكل" },
  { key: "custom", label_ar: "مخصص" },
];

const DEFAULT_PERIOD = "last_30_days";
const VALID_PERIOD_KEYS = new Set(MARKETING_PERIODS.map((p) => p.key));
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Shared period filter, persisted in the URL so switching marketing tabs keeps
 * the selection. `?mkt_period=` plus `?mkt_from=` / `?mkt_to=` for a custom range.
 */
export function useMarketingPeriod() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawPeriod = searchParams.get("mkt_period");
  const rawFrom = searchParams.get("mkt_from");
  const rawTo = searchParams.get("mkt_to");

  const dateFrom = ISO_DATE.test(rawFrom || "") ? rawFrom : null;
  const dateTo = ISO_DATE.test(rawTo || "") ? rawTo : null;
  const hasValidRange = Boolean(dateFrom && dateTo && dateFrom <= dateTo);

  // `isCustom` is UI intent — the custom tab + date pickers stay open even while
  // only one of the two dates has been picked. The effective key for tab
  // highlighting is "custom" in that case; the API query holds on the default
  // window until the range is complete.
  const isCustom = rawPeriod === "custom";
  const selectedKey = isCustom
    ? "custom"
    : VALID_PERIOD_KEYS.has(rawPeriod)
      ? rawPeriod
      : DEFAULT_PERIOD;

  const commit = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.period === "custom") {
        params.set("mkt_period", "custom");
        if (next.dateFrom) params.set("mkt_from", next.dateFrom);
        else params.delete("mkt_from");
        if (next.dateTo) params.set("mkt_to", next.dateTo);
        else params.delete("mkt_to");
      } else {
        if (!next.period || next.period === DEFAULT_PERIOD) params.delete("mkt_period");
        else params.set("mkt_period", next.period);
        params.delete("mkt_from");
        params.delete("mkt_to");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setPeriod = useCallback(
    (key) => {
      if (key === "custom") commit({ period: "custom", dateFrom, dateTo });
      else commit({ period: key });
    },
    [commit, dateFrom, dateTo]
  );

  const setRange = useCallback(
    (from, to) =>
      commit({ period: "custom", dateFrom: from || null, dateTo: to || null }),
    [commit]
  );

  // Query params sent to the API. Custom range → `period=custom` + both dates;
  // an incomplete custom range holds on the default window.
  const queryParams = useMemo(() => {
    if (isCustom && hasValidRange) {
      return { period: "custom", date_from: dateFrom, date_to: dateTo };
    }
    if (isCustom) return { period: DEFAULT_PERIOD };
    return { period: selectedKey };
  }, [isCustom, hasValidRange, dateFrom, dateTo, selectedKey]);

  return {
    period: selectedKey,
    dateFrom,
    dateTo,
    isCustom,
    setPeriod,
    setRange,
    queryParams,
  };
}

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
