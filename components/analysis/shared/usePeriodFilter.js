"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const PERIOD_OPTIONS = [
  { id: "day", label: "اليـوم" },
  { id: "week", label: "الأسبوع" },
  { id: "month", label: "الشهر" },
  { id: "year", label: "السنة" },
  { id: "total", label: "الإجمالي" },
];

/** Reads/writes the `period` query param — replaces the old `[id]` route segment (day/week/month/year/total). */
export function usePeriodFilter(paramName = "period") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = searchParams.get(paramName) ?? "total";

  const setPeriod = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return { period, setPeriod };
}
