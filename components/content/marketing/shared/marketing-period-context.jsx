"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Shared marketing period filter, persisted in the URL so switching marketing
 * tabs keeps the selection. `?mkt_period=` plus `?mkt_from=` / `?mkt_to=` for a
 * custom range.
 *
 * A single <MarketingPeriodProvider> wraps the active tab so every tracking /
 * content / reports hook and the <PeriodFilterBar> read one computed value
 * instead of each re-deriving it from `useSearchParams()`.
 */

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

const MarketingPeriodContext = createContext(null);

function useMarketingPeriodValue() {
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

  return useMemo(
    () => ({
      period: selectedKey,
      dateFrom,
      dateTo,
      isCustom,
      setPeriod,
      setRange,
      queryParams,
    }),
    [selectedKey, dateFrom, dateTo, isCustom, setPeriod, setRange, queryParams]
  );
}

export function MarketingPeriodProvider({ children }) {
  const value = useMarketingPeriodValue();
  return (
    <MarketingPeriodContext.Provider value={value}>
      {children}
    </MarketingPeriodContext.Provider>
  );
}

export function useMarketingPeriod() {
  const ctx = useContext(MarketingPeriodContext);
  if (!ctx) {
    throw new Error(
      "useMarketingPeriod must be used within <MarketingPeriodProvider>"
    );
  }
  return ctx;
}
