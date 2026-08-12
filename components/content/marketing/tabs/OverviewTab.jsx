"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { SourceBadge, TrendBadge } from "../shared/Badges";
import GroupedBarChart from "../shared/GroupedBarChart";
import FunnelBars from "../shared/FunnelBars";
import { TH, TD } from "../shared/table";
import {
  OVERVIEW_ROAS,
  OVERVIEW_STATS,
  CHANNEL_SPEND_REVENUE,
  MARKETING_FUNNEL,
  CHANNEL_ROI,
  TOP_GOOGLE_KEYWORDS,
  TOP_PAGES_VISITED,
  TOP_CAMPAIGNS_BY_LEADS,
  BEST_CAMPAIGN,
  WORST_CAMPAIGN,
} from "../shared/mock-data";

export default function OverviewTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-[#0B5345] px-6 py-5 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-wrap">
          <StatMini label="إجمالي الصرف" value={`${OVERVIEW_ROAS.totalSpend} ريال`} />
          <StatMini label="إيراد مُسنَد" value={`${OVERVIEW_ROAS.attributedRevenue} ريال`} />
          <StatMini label="ربح صافي" value={`${OVERVIEW_ROAS.netProfit}ريال`} />
        </div>
        <div className="text-right">
          <p className="text-[13px] text-white/70 font-semibold">العائد على الإنفاق الإعلاني (ROAS)</p>
          <p className="text-[38px] font-extrabold text-white leading-none mt-1">{OVERVIEW_ROAS.value}</p>
          <p className="text-[12px] text-white/60 mt-2 max-w-xs">{OVERVIEW_ROAS.hint}</p>
        </div>
      </div>

      <StatCardRow items={OVERVIEW_STATS} className="lg:grid-cols-6" />

      <SectionCard title="الصرف مقابل الإيراد حسب القناة">
        <GroupedBarChart items={CHANNEL_SPEND_REVENUE} />
      </SectionCard>

      <SectionCard title="القمع التسويقي الكامل">
        <FunnelBars steps={MARKETING_FUNNEL} />
      </SectionCard>

      <SectionCard title="أداء القنوات المدفوعة (ROI)">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>القناة</th>
                <th className={TH}>الصرف</th>
                <th className={TH}>الإيراد</th>
                <th className={TH}>ROAS</th>
                <th className={TH}>تحويلات</th>
                <th className={TH}>CAC</th>
                <th className={TH}>الربح</th>
              </tr>
            </thead>
            <tbody>
              {CHANNEL_ROI.map((row) => (
                <tr key={row.source}>
                  <td className={TD}>
                    <SourceBadge source={row.source} />
                  </td>
                  <td className={cn(TD, "tabular-nums")}>{row.spend.toLocaleString("en-US")} ريال</td>
                  <td className={cn(TD, "tabular-nums")}>{row.revenue.toLocaleString("en-US")} ريال</td>
                  <td className={cn(TD, "font-bold text-[#15803D] tabular-nums")}>{row.roas}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.conversions}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.cac} ريال</td>
                  <td
                    className={cn(
                      TD,
                      "font-bold tabular-nums",
                      row.profit.includes("-") ? "text-[#DC2626]" : "text-[#15803D]"
                    )}
                  >
                    {row.profit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="أهم الكلمات في Google">
          <ul className="flex flex-col gap-3">
            {TOP_GOOGLE_KEYWORDS.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="size-5 rounded-full bg-[#F3F4F6] text-[#374151] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {item.rank}
                  </span>
                  <span className="text-[13px] text-[#374151] truncate">{item.label}</span>
                </span>
                <TrendBadge trend={item.trend} className="shrink-0" />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="أكثر الصفحات والمقالات زيارة">
          <ul className="flex flex-col gap-3">
            {TOP_PAGES_VISITED.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] rounded px-1.5 py-0.5 shrink-0">
                    {item.type}
                  </span>
                  <span className="text-[13px] text-[#374151] truncate">{item.label}</span>
                </span>
                <span className="text-[13px] font-bold text-[#111827] tabular-nums shrink-0">
                  {item.visits.toLocaleString("en-US")}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="أكثر الحملات تحقيقًا للطلبات">
          <ul className="flex flex-col gap-3">
            {TOP_CAMPAIGNS_BY_LEADS.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <SourceBadge source={item.source} />
                  <span className="text-[13px] text-[#374151] truncate">{item.label}</span>
                </span>
                <span className="text-[13px] font-bold text-[#111827] tabular-nums shrink-0">
                  {item.leads} طلب
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <HighlightCampaignCard tone="best" title="أفضل حملة (ROAS)" campaign={BEST_CAMPAIGN} />
        <HighlightCampaignCard tone="worst" title="أضعف حملة (ROAS)" campaign={WORST_CAMPAIGN} />
      </div>
    </div>
  );
}

function StatMini({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-[16px] font-bold text-white leading-tight">{value}</p>
      <p className="text-[11px] text-white/60 mt-0.5">{label}</p>
    </div>
  );
}

function HighlightCampaignCard({ tone, title, campaign }) {
  const isBest = tone === "best";
  return (
    <div
      className={cn(
        "rounded-xl p-5 flex items-center justify-between gap-4",
        isBest ? "bg-[#ECFDF5] border border-[#A7F3D0]" : "bg-[#FEF2F2] border border-[#FECACA]"
      )}
    >
      <div className="min-w-0">
        <p className={cn("text-[12px] font-bold mb-1", isBest ? "text-[#15803D]" : "text-[#DC2626]")}>{title}</p>
        <div className="flex items-center gap-2 mb-1.5">
          <SourceBadge source={campaign.source} />
          <span className="text-[14px] font-bold text-[#111827] truncate">{campaign.title}</span>
        </div>
        <p className="text-[12px] text-[#6B7280]">
          {campaign.roas} · {campaign.profitLabel}
        </p>
      </div>
      <Link
        href="?tab=campaigns"
        className={cn(
          "inline-flex items-center gap-1 text-[12px] font-bold shrink-0",
          isBest ? "text-[#15803D]" : "text-[#DC2626]"
        )}
      >
        التفاصيل
        <ArrowLeft className="size-3.5" />
      </Link>
    </div>
  );
}
