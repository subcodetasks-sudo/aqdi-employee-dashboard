"use client";

import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart, { VerticalBarChart } from "../shared/HorizontalBarChart";
import ReportSectionCard, { ReportLineList } from "../shared/ReportSectionCard";
import Loader from "@/components/home/loader";
import { useSalesReport } from "@/src/hooks/use-reports";
import ReportError from "../shared/ReportError";

export default function SalesReportTab({ period, dateFrom, dateTo, contractType, employee }) {
  const { data, isLoading, isError, error } = useSalesReport(period, dateFrom, dateTo, contractType, employee);
  if (isLoading) return <Loader />;
  if (isError) return <ReportError title="المبيعات والإيرادات" error={error} fallback="تعذّر تحميل تقرير المبيعات." />;
  const kpis = [
    ["total_sales", "إجمالي المبيعات (ريال)", "wallet"], ["payments_count", "عدد عمليات الدفع", "receipt"],
    ["avg_order_value", "متوسط قيمة الطلب", "creditCard"], ["discounts_used", "الخصومات المستخدمة", "tag"],
    ["refunds", "المبالغ المسترجعة", "undo"], ["net_revenue", "صافي الإيرادات", "banknote"],
  ].map(([key, label, icon]) => ({ key, label, value: data?.kpis?.[key] ?? 0, icon }));
  const money = (value) => `${Number(value ?? 0).toLocaleString("en-US")} ريال`;
  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="المبيعات حسب الفترة">
          <ReportLineList
            items={(data?.by_period ?? []).map((row) => ({
              label: row.label,
              value: money(row.value),
            }))}
          />
        </ReportSectionCard>

        <ReportSectionCard title="اتجاه المبيعات اليومي">
          <VerticalBarChart items={data?.daily ?? []} height={180} />
        </ReportSectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="الإيرادات حسب مدة العقد">
          <HorizontalBarChart items={data?.revenue_by_duration ?? []} />
        </ReportSectionCard>

        <ReportSectionCard title="الإيرادات حسب نوع العقد">
          <HorizontalBarChart items={data?.revenue_by_contract_type ?? []} />
        </ReportSectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="hidden lg:block" />
        <ReportSectionCard title="الخصومات والاسترجاعات وصافي الإيراد">
          <ReportLineList items={[
            { label: "الخصومات الممنوحة", value: money(data?.summary?.discounts_granted), tone: "gold" },
            { label: "عدد الطلبات المخصومة", value: `${data?.summary?.discounted_orders_count ?? 0} طلب` },
            { label: "المبالغ المسترجعة", value: money(data?.summary?.refunds_total) },
            { label: "نسبة الاسترجاع من المبيعات", value: `${data?.summary?.refund_rate_percent ?? 0}%` },
            { label: "صافي الإيرادات بعد الاسترجاع =", value: money(data?.summary?.net_revenue_after_refunds), tone: "green", bold: true },
          ]} />
        </ReportSectionCard>
      </div>
    </div>
  );
}
