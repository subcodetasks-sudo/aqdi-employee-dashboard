"use client";

import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart from "../shared/HorizontalBarChart";
import ReportSectionCard from "../shared/ReportSectionCard";
import {
  CUSTOMER_SEGMENTS,
  CUSTOMERS_KPIS,
  TOP_CUSTOMERS,
} from "../mock-data";

const TH =
  "px-3 py-3 text-[12px] font-semibold text-[#9CA3AF] border-b border-[#EEF1F0] whitespace-nowrap text-right";
const TD = "px-3 py-3 text-[13px] text-[#374151] border-b border-[#F3F4F6] whitespace-nowrap";

export default function CustomersReportTab() {
  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={CUSTOMERS_KPIS} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="العملاء الجدد مقابل العائدين">
          <HorizontalBarChart items={CUSTOMER_SEGMENTS} />
        </ReportSectionCard>

        <ReportSectionCard title="أفضل العملاء من حيث القيمة">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr>
                  <th className={TH}>العميل</th>
                  <th className={TH}>الجوال</th>
                  <th className={TH}>العقود</th>
                  <th className={TH}>المدفوعة</th>
                  <th className={TH}>إجمالي الإنفاق</th>
                </tr>
              </thead>
              <tbody>
                {TOP_CUSTOMERS.map((row) => (
                  <tr key={row.mobile}>
                    <td className={`${TD} font-semibold text-[#111827]`}>{row.name}</td>
                    <td className={`${TD} tabular-nums`} dir="ltr">
                      {row.mobile}
                    </td>
                    <td className={TD}>{row.contracts}</td>
                    <td className={TD}>{row.paid}</td>
                    <td className={`${TD} tabular-nums font-semibold`}>
                      {row.spending.toLocaleString("en-US")} ريال
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSectionCard>
      </div>
    </div>
  );
}
