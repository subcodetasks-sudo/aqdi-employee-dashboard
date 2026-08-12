"use client";

import { cn } from "@/lib/utils";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart, { VerticalBarChart } from "../shared/HorizontalBarChart";
import ReportSectionCard, { ReportLineList } from "../shared/ReportSectionCard";
import {
  CONVERSION_FUNNEL,
  DAILY_ORDERS,
  OPERATIONAL_METRICS,
  ORDERS_BY_STATUS,
  PERFORMANCE_KPIS,
  PNL_LINES,
  REVENUE_BY_PAYMENT,
  UNIT_ECONOMICS,
} from "../mock-data";

export default function PerformanceReportTab() {
  const funnelBars = CONVERSION_FUNNEL.map((step) => ({
    label: `${step.label} (${step.pct})`,
    value: step.value,
    color: "#0B5345",
  }));

  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={PERFORMANCE_KPIS} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ReportSectionCard title="قمع التحويل">
          <HorizontalBarChart items={funnelBars} />
        </ReportSectionCard>

        <ReportSectionCard title="الاتجاه اليومي للطلبات">
          <VerticalBarChart items={DAILY_ORDERS} height={160} />
        </ReportSectionCard>

        <ReportSectionCard title="الطلبات حسب الحالة">
          <HorizontalBarChart items={ORDERS_BY_STATUS} />
        </ReportSectionCard>

        <ReportSectionCard title="الإيرادات حسب طريقة الدفع">
          <HorizontalBarChart items={REVENUE_BY_PAYMENT} />
        </ReportSectionCard>

        <ReportSectionCard title="الأداء التشغيلي">
          <ReportLineList
            items={OPERATIONAL_METRICS.map((row) => ({
              label: row.label,
              value: row.value,
            }))}
          />
        </ReportSectionCard>

        <ReportSectionCard title="قائمة الدخل">
          <ReportLineList items={PNL_LINES.slice(0, 7)} />
        </ReportSectionCard>
      </div>

      <ReportSectionCard title="اقتصاد العقد الواحد">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-3 text-[12px] font-semibold text-[#9CA3AF] border-b border-[#EEF1F0] text-right">
                  الخدمة
                </th>
                <th className="px-3 py-3 text-[12px] font-semibold text-[#9CA3AF] border-b border-[#EEF1F0] text-right">
                  الكمية
                </th>
                <th className="px-3 py-3 text-[12px] font-semibold text-[#9CA3AF] border-b border-[#EEF1F0] text-right">
                  القيمة
                </th>
                <th className="px-3 py-3 text-[12px] font-semibold text-[#9CA3AF] border-b border-[#EEF1F0] text-right">
                  النسبة
                </th>
              </tr>
            </thead>
            <tbody>
              {UNIT_ECONOMICS.map((row) => (
                <tr
                  key={row.name}
                  className={cn(row.highlight && "bg-[#FFF7ED]")}
                >
                  <td className="px-3 py-3 text-[13px] font-semibold text-[#111827] border-b border-[#F3F4F6]">
                    {row.name}
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#374151] border-b border-[#F3F4F6]">
                    {row.qty}
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#374151] border-b border-[#F3F4F6] tabular-nums">
                    {row.value.toLocaleString("en-US")} ريال
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#374151] border-b border-[#F3F4F6]">
                    {row.pct}
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
