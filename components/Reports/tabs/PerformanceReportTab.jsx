"use client";

import { cn } from "@/lib/utils";
import Loader from "@/components/home/loader";
import { usePerformanceReport } from "@/src/hooks/use-reports";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart, { VerticalBarChart } from "../shared/HorizontalBarChart";
import ReportSectionCard, { ReportLineList } from "../shared/ReportSectionCard";
import ReportError from "../shared/ReportError";

export default function PerformanceReportTab({ period, dateFrom, dateTo }) {
  const { data, isLoading, isError, error } = usePerformanceReport(period, dateFrom, dateTo);
  if (isLoading) return <Loader />;
  if (isError) return <ReportError title="لوحة الأداء" error={error} fallback="تعذّر تحميل لوحة الأداء." />;
  const funnelBars = (data?.conversion_funnel ?? []).map((step) => ({
    label: `${step.label} (${step.pct})`,
    value: step.value,
    color: "#0B5345",
  }));

  const kpis = [["revenue", "الإيرادات", "wallet"], ["refunded_count", "المبالغ المسترجعة", "undo"], ["delayed_count", "المتأخرة", "clock"], ["canceled_count", "الملغاة", "xCircle"], ["active_count", "النشطة", "activity"], ["total_count", "الإجمالي", "file"]].map(([key, label, icon]) => ({ key, label, value: data?.kpis?.[key] ?? 0, icon }));
  const operational = data?.operational_metrics ?? {};
  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={kpis} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ReportSectionCard title="قمع التحويل">
          <HorizontalBarChart items={funnelBars} />
        </ReportSectionCard>

        <ReportSectionCard title="الاتجاه اليومي للطلبات">
          <VerticalBarChart items={data?.daily_orders ?? []} height={160} />
        </ReportSectionCard>

        <ReportSectionCard title="الطلبات حسب الحالة">
          <HorizontalBarChart items={data?.orders_by_status ?? []} />
        </ReportSectionCard>

        <ReportSectionCard title="الإيرادات حسب طريقة الدفع">
          <HorizontalBarChart items={(data?.revenue_by_payment_method ?? []).map((row) => ({ label: row.label, value: row.value }))} />
        </ReportSectionCard>

        <ReportSectionCard title="الأداء التشغيلي">
          <ReportLineList
            items={[
              { label: "إجمالي الطلبات", value: operational.total_orders ?? 0 },
              { label: "متوسط الاستلام", value: `${operational.avg_receive_seconds ?? 0} ث` },
              { label: "أطول انتظار", value: `${operational.longest_wait_seconds ?? 0} ث` },
              { label: "نسبة الالتزام", value: `${operational.sla_percent ?? 0}%` },
              { label: "متأخر أكثر من 24 ساعة", value: operational.delayed_over_24h_count ?? 0 },
            ]}
          />
        </ReportSectionCard>

        <ReportSectionCard title="قائمة الدخل">
          <ReportLineList items={[]} />
        </ReportSectionCard>
      </div>

      <ReportSectionCard title="اقتصاد العقد الواحد">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-3 text-xs font-semibold text-gray-400 border-b border-[#EEF1F0] text-right dark:text-white/50 dark:border-white/10">
                  الخدمة
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-gray-400 border-b border-[#EEF1F0] text-right dark:text-white/50 dark:border-white/10">
                  الكمية
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-gray-400 border-b border-[#EEF1F0] text-right dark:text-white/50 dark:border-white/10">
                  القيمة
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-gray-400 border-b border-[#EEF1F0] text-right dark:text-white/50 dark:border-white/10">
                  النسبة
                </th>
              </tr>
            </thead>
            <tbody>
              {(data?.unit_economics ?? []).map((row) => (
                <tr
                  key={row.service ?? row.label}
                  className={cn(row.highlight && "bg-[#FFF7ED] dark:bg-amber-500/10")}
                >
                  <td className="px-3 py-3 text-13 font-semibold text-gray-900 border-b border-status-neutral-bg dark:text-white dark:border-white/10">
                    {row.label}
                  </td>
                  <td className="px-3 py-3 text-13 text-gray-700 border-b border-status-neutral-bg dark:text-white/70 dark:border-white/10">
                    {row.qty}
                  </td>
                  <td className="px-3 py-3 text-13 text-gray-700 border-b border-status-neutral-bg tabular-nums dark:text-white/70 dark:border-white/10">
                    {Number(row.value ?? 0).toLocaleString("en-US")} ريال
                  </td>
                  <td className="px-3 py-3 text-13 text-gray-700 border-b border-status-neutral-bg dark:text-white/70 dark:border-white/10">
                    {row.percent ?? 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportSectionCard>
    </div>
  );
}
