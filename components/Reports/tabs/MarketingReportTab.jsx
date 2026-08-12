"use client";

import { cn } from "@/lib/utils";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart from "../shared/HorizontalBarChart";
import ReportSectionCard from "../shared/ReportSectionCard";
import {
  MARKETING_KPIS,
  ORDERS_BY_SOURCE,
  SOURCE_CAC,
  TOP_KEYWORDS,
  WEAK_CAMPAIGNS,
} from "../mock-data";

const TH =
  "px-3 py-3 text-[12px] font-semibold text-[#9CA3AF] border-b border-[#EEF1F0] whitespace-nowrap text-right";
const TD = "px-3 py-3 text-[13px] text-[#374151] border-b border-[#F3F4F6] whitespace-nowrap";

export default function MarketingReportTab() {
  const sourceBars = ORDERS_BY_SOURCE.map((row) => ({
    label: `${row.label} — ${row.orders} طلب · ${row.paid} مدفوع`,
    value: row.orders,
    color: row.color,
  }));

  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={MARKETING_KPIS} columns="grid-cols-2 sm:grid-cols-4" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="تكلفة الاستحواذ والتحويل حسب المصدر">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className={TH}>المصدر</th>
                  <th className={TH}>طلبات</th>
                  <th className={TH}>مدفوع</th>
                  <th className={TH}>الإيراد</th>
                  <th className={TH}>الإنفاق</th>
                  <th className={TH}>CAC</th>
                  <th className={TH}>تحويل</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_CAC.map((row) => (
                  <tr key={row.source}>
                    <td className={`${TD} font-semibold text-[#111827]`}>{row.source}</td>
                    <td className={TD}>{row.orders}</td>
                    <td className={TD}>{row.paid}</td>
                    <td className={`${TD} tabular-nums`}>
                      {row.revenue.toLocaleString("en-US")}
                    </td>
                    <td className={`${TD} tabular-nums`}>
                      {row.spend.toLocaleString("en-US")}
                    </td>
                    <td className={`${TD} tabular-nums`}>{row.cac.toLocaleString("en-US")}</td>
                    <td className={cn(TD, "font-semibold text-[#15803D]")}>{row.conversion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSectionCard>

        <ReportSectionCard title="الطلبات حسب المصدر">
          <HorizontalBarChart items={sourceBars} />
        </ReportSectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="الحملات الأضعف (ROAS منخفض)">
          <div className="flex flex-col gap-3">
            {WEAK_CAMPAIGNS.map((campaign) => (
              <div
                key={campaign.name}
                className="flex items-center justify-between gap-4 py-2 border-b border-[#F3F4F6] last:border-0"
              >
                <span className="text-[13px] text-[#374151]">{campaign.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "text-[13px] font-bold tabular-nums",
                      campaign.tone === "danger" ? "text-[#DC2626]" : "text-[#B45309]"
                    )}
                  >
                    {campaign.profit}
                  </span>
                  <span className="text-[12px] text-[#9CA3AF]">{campaign.roas}</span>
                </div>
              </div>
            ))}
          </div>
        </ReportSectionCard>

        <ReportSectionCard title="أفضل الكلمات الإعلانية (إيراداً)">
          <HorizontalBarChart items={TOP_KEYWORDS} />
        </ReportSectionCard>
      </div>
    </div>
  );
}
