"use client";

import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart, { VerticalBarChart } from "../shared/HorizontalBarChart";
import ReportSectionCard, { ReportLineList } from "../shared/ReportSectionCard";
import {
  DAILY_SALES,
  REVENUE_BY_CONTRACT,
  REVENUE_BY_DURATION,
  SALES_BY_PERIOD,
  SALES_KPIS,
  SALES_SUMMARY,
} from "../mock-data";

export default function SalesReportTab() {
  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={SALES_KPIS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="المبيعات حسب الفترة">
          <ReportLineList
            items={SALES_BY_PERIOD.map((row) => ({
              label: row.label,
              value: `${row.value.toLocaleString("en-US")} ${row.suffix}`,
            }))}
          />
        </ReportSectionCard>

        <ReportSectionCard title="اتجاه المبيعات اليومي">
          <VerticalBarChart items={DAILY_SALES} height={180} />
        </ReportSectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="الإيرادات حسب مدة العقد">
          <HorizontalBarChart items={REVENUE_BY_DURATION} />
        </ReportSectionCard>

        <ReportSectionCard title="الإيرادات حسب نوع العقد">
          <HorizontalBarChart items={REVENUE_BY_CONTRACT} />
        </ReportSectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="hidden lg:block" />
        <ReportSectionCard title="الخصومات والاسترجاعات وصافي الإيراد">
          <ReportLineList items={SALES_SUMMARY} />
        </ReportSectionCard>
      </div>
    </div>
  );
}
