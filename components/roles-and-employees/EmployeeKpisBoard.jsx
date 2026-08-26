"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Loader from "@/components/home/loader";
import { useEmployeeKpisBoard } from "@/src/hooks/use-employee-kpis";
import { EmployeeAvatar } from "./shared";

const FALLBACK_PERIODS = [
  { key: "today", label_ar: "اليوم" },
  { key: "yesterday", label_ar: "أمس" },
  { key: "last_7_days", label_ar: "آخر 7 أيام" },
  { key: "last_30_days", label_ar: "آخر 30 يومًا" },
  { key: "all", label_ar: "كل الفترات" },
  { key: "custom", label_ar: "مدة محددة" },
];

function findCard(item, key) {
  return item.cards?.find((c) => c.key === key);
}

function StatTile({ label, value, danger }) {
  return (
    <div className="rounded-xl bg-[#F9FAFB] p-3 text-center dark:bg-white/5">
      <p className={cn("text-lg font-black", danger ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white")}>
        {value}
      </p>
      <p className="text-11 text-gray-400 mt-0.5 dark:text-white/45">{label}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="text-center min-w-0">
      <p className="text-13 font-bold text-gray-900 truncate dark:text-white">{value ?? "—"}</p>
      <p className="text-11 text-gray-400 mt-0.5 dark:text-white/45">{label}</p>
    </div>
  );
}

function buildDetailsHref(employeeId, period, dateFrom, dateTo) {
  const params = new URLSearchParams({ period });
  if (period === "custom" && dateFrom && dateTo) {
    params.set("date_from", dateFrom);
    params.set("date_to", dateTo);
  }
  return `/home/roles-and-employees/employees/${employeeId}/kpis?${params.toString()}`;
}

function EmployeeKpiCard({ item, period, dateFrom, dateTo }) {
  const employee = item.employee ?? {};
  const shift = item.shift ?? {};
  const isOnDuty = shift.is_on_duty ?? shift.duty_status === "inside";

  const openNow = findCard(item, "open_now");
  const received = findCard(item, "received");
  const completed = findCard(item, "completed");
  const late = findCard(item, "late_over_24h");
  const isLateDanger = late?.tone === "danger" && (late?.value ?? 0) > 0;

  const hasExtraMetrics = item.avg_receive || item.avg_process || item.revenue || item.receive_sla;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden dark:bg-card dark:border-white/10">
      <div className="p-5 flex flex-col gap-5">
        <div className="flex items-start gap-3 min-w-0">
          <EmployeeAvatar name={employee.name} image={employee.profile_image} size="md" />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate dark:text-white">
              {employee.name_label ?? employee.name ?? "—"}
            </h3>
            {employee.role_title ? (
              <p className="text-xs text-gray-400 mt-0.5 dark:text-white/50">{employee.role_title}</p>
            ) : null}
            <p className="text-xs text-gray-400 mt-1 dark:text-white/45">{shift.label_ar ?? "—"}</p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-11 font-semibold",
                isOnDuty
                  ? "bg-[#D1FAE5] text-[#047857] dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-status-neutral-bg text-status-neutral dark:bg-white/10 dark:text-white/60"
              )}
            >
              <span className={cn("size-1.5 rounded-full", isOnDuty ? "bg-brand-accent" : "bg-gray-400")} />
              {shift.duty_status_label_ar ?? (isOnDuty ? "داخل الدوام الآن" : "خارج الدوام")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatTile label={openNow?.label_ar ?? "مفتوح الآن"} value={openNow?.value ?? 0} />
          <StatTile label={received?.label_ar ?? "استلم"} value={received?.value ?? 0} />
          <StatTile label={completed?.label_ar ?? "منجز بالفترة"} value={completed?.value ?? 0} />
          <StatTile label={late?.label_ar ?? "متأخر > 24 س"} value={late?.value ?? 0} danger={isLateDanger} />
        </div>

        {hasExtraMetrics ? (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed border-[#E5E7EB] dark:border-white/10">
            {item.avg_receive ? <MiniMetric label="متوسط الاستلام (د عمل)" value={item.avg_receive.value_label} /> : null}
            {item.avg_process ? <MiniMetric label="متوسط المعالجة" value={item.avg_process.value_label} /> : null}
            {item.revenue ? <MiniMetric label="إيراد محقق" value={item.revenue.value_label} /> : null}
            {item.receive_sla ? (
              <MiniMetric
                label="التزام الاستلام ≤ 5د"
                value={item.receive_sla.percent != null ? `${item.receive_sla.percent}%` : "—"}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <Link
        href={buildDetailsHref(employee.id, period, dateFrom, dateTo)}
        className="flex items-center justify-center gap-1.5 py-3.5 border-t border-[#E5E7EB] text-13 font-semibold text-brand-dark hover:bg-[#F0F7F4] transition-colors dark:border-white/10 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
      >
        التفاصيل الكاملة
        <ChevronLeft className="size-4" />
      </Link>
    </div>
  );
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
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-gray-400 dark:border-white/10 dark:text-white/45">
          لا يوجد موظفون لعرضهم في هذه الفترة.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {items.map((item) => (
            <EmployeeKpiCard
              key={item.employee?.id}
              item={item}
              period={period}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
