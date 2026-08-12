"use client";

import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart from "../shared/HorizontalBarChart";
import ReportSectionCard from "../shared/ReportSectionCard";
import {
  ORDERS_BY_CONTRACT,
  ORDERS_BY_EMPLOYEE,
  ORDERS_BY_STAGE,
  ORDERS_KPIS,
} from "../mock-data";

export default function OrdersReportTab() {
  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={ORDERS_KPIS} columns="grid-cols-2 sm:grid-cols-4 xl:grid-cols-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="الطلبات حسب الموظف">
          <HorizontalBarChart items={ORDERS_BY_EMPLOYEE} />
        </ReportSectionCard>

        <ReportSectionCard title="الطلبات حسب نوع العقد">
          <HorizontalBarChart items={ORDERS_BY_CONTRACT} />
        </ReportSectionCard>
      </div>

      <ReportSectionCard title="الطلبات حسب المرحلة">
        <HorizontalBarChart items={ORDERS_BY_STAGE} />
      </ReportSectionCard>
    </div>
  );
}
