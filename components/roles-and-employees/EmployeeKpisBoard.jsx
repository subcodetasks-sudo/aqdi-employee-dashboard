"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Loader from "@/components/home/loader";
import { useEmployeeKpisBoard } from "@/src/hooks/use-employee-kpis";
import EmployeePerfCard from "./EmployeePerfCard";
import { findKpiCard } from "./employee-perf-metrics";
import "./employee-perf.css";

const FALLBACK_PERIODS = [
  { key: "today", label_ar: "اليوم" },
  { key: "yesterday", label_ar: "أمس" },
  { key: "last_7_days", label_ar: "آخر 7 أيام" },
  { key: "last_30_days", label_ar: "آخر 30 يومًا" },
  { key: "all", label_ar: "كل الفترات" },
  { key: "custom", label_ar: "مدة محددة" },
];

function buildDetailsHref(employeeId, period, dateFrom, dateTo) {
  const params = new URLSearchParams({ period });
  if (period === "custom" && dateFrom && dateTo) {
    params.set("date_from", dateFrom);
    params.set("date_to", dateTo);
  }
  return `/home/roles-and-employees/employees/${employeeId}/kpis?${params.toString()}`;
}

export default function EmployeeKpisBoard() {
  const [period, setPeriod] = useState("today");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const isCustom = period === "custom";
  const hasValidRange = Boolean(dateFrom && dateTo && dateFrom <= dateTo);
  const needsCustomRange = isCustom && !hasValidRange;

  const { data, isLoading, isError, error, refetch } = useEmployeeKpisBoard(
    period,
    dateFrom || undefined,
    dateTo || undefined
  );

  const handlePeriodChange = (value) => {
    setPeriod(value);
    if (value !== "custom") {
      setDateFrom("");
      setDateTo("");
    }
  };

  const periods = data?.periods?.length
    ? data.periods
    : FALLBACK_PERIODS.map((p) => ({ ...p, selected: p.key === period }));
  const items = data?.items ?? [];
  const summary = data?.summary;

  const periodLabel = periods.find((p) => p.key === period)?.label_ar ?? "اليوم";

  const itemsWithMax = useMemo(() => {
    const maxCompleted = Math.max(
      1,
      items.reduce((max, item) => Math.max(max, findKpiCard(item, "completed")?.value ?? 0), 0)
    );
    return items.map((item) => ({ ...item, _maxCompleted: maxCompleted }));
  }, [items]);

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">مؤشرات الموظفين</h2>
        {summary && !needsCustomRange ? (
          <p className="text-xs text-gray-400 mt-1 dark:text-white/50">
            {summary.employees_count} موظف · استلم {summary.received_total} · منجز {summary.completed_total} · متأخر{" "}
            {summary.late_over_24h_total}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-[#E5E7EB] dark:border-white/10">
        {periods.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handlePeriodChange(p.key)}
            className={cn(
              "px-4 py-2.5 text-13 font-semibold transition-colors border-b-2 -mb-px",
              period === p.key
                ? "text-brand-dark border-brand-dark dark:text-emerald-300 dark:border-emerald-400"
                : "text-gray-400 border-transparent hover:text-gray-700 dark:text-white/45 dark:hover:text-white/70"
            )}
          >
            {p.label_ar}
          </button>
        ))}
      </div>

      {isCustom ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#616161] dark:text-white/60">
            من
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs dark:bg-card dark:border-white/10 dark:text-white/80"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#616161] dark:text-white/60">
            إلى
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)}
              className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs dark:bg-card dark:border-white/10 dark:text-white/80"
            />
          </label>
        </div>
      ) : null}

      {needsCustomRange ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-gray-400 dark:border-white/10 dark:text-white/45">
          اختر تاريخ البداية والنهاية لعرض المؤشرات.
        </div>
      ) : isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300">
          {error?.response?.status === 403 ? (
            "ليس لديك صلاحية عرض مؤشرات الموظفين."
          ) : (
            <>
              تعذّر تحميل مؤشرات الموظفين.{" "}
              <button type="button" onClick={() => refetch()} className="font-semibold underline">
                إعادة المحاولة
              </button>
            </>
          )}
        </div>
      ) : itemsWithMax.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-gray-400 dark:border-white/10 dark:text-white/45">
          لا يوجد موظفون لعرضهم في هذه الفترة.
        </div>
      ) : (
        <div className="perfgrid">
          {itemsWithMax.map((item) => (
            <EmployeePerfCard
              key={item.employee?.id}
              item={item}
              periodLabel={periodLabel}
              detailsHref={buildDetailsHref(item.employee?.id, period, dateFrom, dateTo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
