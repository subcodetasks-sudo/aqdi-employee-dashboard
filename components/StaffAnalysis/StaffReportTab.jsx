"use client";

import { usePeriodFilter } from "@/components/analysis/shared/usePeriodFilter";
import TotalStaff from "./TotalStaff";
import StaffAnalysisWrapper from "./StaffAnalysisWrapper";

const METRICS = [
  { id: "total", label: "عدد الموظفين" },
  { id: "most_received_orders", label: "أكثر الموظفين استلم طلب" },
  { id: "most_completed_orders", label: "أكثر الموظفين وثق طلب" },
  { id: "most_incompleted_orders", label: "أكثر موظف اكتسب طلب غير مدفوع" },
  { id: "most_refunded_orders", label: "أكثر موظف قدم استرجاع" },
];

export default function StaffReportTab() {
  const { period: metric, setPeriod: setMetric } = usePeriodFilter("metric");

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="flex flex-wrap gap-2">
        {METRICS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMetric(option.id)}
            className={`h-9 px-4 rounded-full text-[13px] font-bold transition-all ${
              metric === option.id
                ? "bg-brand-main text-white"
                : "bg-white text-ink-body border border-surface-border hover:bg-surface-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {metric === "total" ? <TotalStaff /> : <StaffAnalysisWrapper id={metric} />}
    </div>
  );
}
