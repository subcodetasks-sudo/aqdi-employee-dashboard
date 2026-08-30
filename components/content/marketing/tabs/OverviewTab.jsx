"use client";

import Link from "next/link";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { SourceBadge, TrendBadge, RoasChip, PosChip } from "../shared/Badges";
import GroupedBarChart from "../shared/GroupedBarChart";
import HorizontalBarChart from "@/components/Reports/shared/HorizontalBarChart";
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

function formatRoas(value) {
  const raw = String(value).replace(/^x/i, "").replace(/×$/, "");
  return `${raw}×`;
}

function formatProfit(profit) {
  const neg = String(profit).includes("-");
  const num = String(profit).replace(/[^\d,]/g, "");
  return `${neg ? "" : "+"}${num} ﷼`;
}

export default function OverviewTab() {
  return (
    <div>
      <div className="mkt-hero">
        <div className="mkt-hero-l">
          <div className="mkt-hero-lbl">العائد على الإنفاق الإعلاني (ROAS)</div>
          <div className="mkt-hero-big">{OVERVIEW_ROAS.value}</div>
          <div className="mkt-hero-cap">
            لكل <b>{OVERVIEW_ROAS.hintParts.spend}</b> صُرف على الإعلانات، رجع{" "}
            <b>{OVERVIEW_ROAS.hintParts.return}</b> إيرادًا مُسنَدًا
          </div>
        </div>
        <div className="mkt-hero-r">
          <div className="mkt-hero-kpi">
            <span>{OVERVIEW_ROAS.totalSpend}</span>
            <small>إجمالي الصرف</small>
          </div>
          <div className="mkt-hero-kpi">
            <span>{OVERVIEW_ROAS.attributedRevenue}</span>
            <small>إيراد مُسنَد</small>
          </div>
          <div className="mkt-hero-kpi pos">
            <span>{OVERVIEW_ROAS.netProfit}</span>
            <small>ربح صافٍ</small>
          </div>
        </div>
      </div>

      <StatCardRow items={OVERVIEW_STATS} />

      <div className="cpf-grid">
        <SectionCard title="الصرف مقابل الإيراد — حسب القناة">
          <GroupedBarChart items={CHANNEL_SPEND_REVENUE} />
        </SectionCard>
        <SectionCard title="القمع التسويقي الكامل">
          <HorizontalBarChart
            items={MARKETING_FUNNEL.map((step, index) => ({
              label: step.label,
              value: step.value,
              detail: step.dropPct,
              color: ["#0E5F4E", "#127A62", "#1A9478", "#25B088"][index],
            }))}
          />
        </SectionCard>
      </div>

      <SectionCard title="أداء القنوات المدفوعة (ROI)" className="mt-[14px]">
        <div className="tblwrap">
          <table className="mkt-tbl">
            <thead>
              <tr>
                <th>القناة</th>
                <th>الصرف</th>
                <th>الإيراد</th>
                <th>ROAS</th>
                <th>تحويلات</th>
                <th>CAC</th>
                <th>الربح</th>
              </tr>
            </thead>
            <tbody>
              {CHANNEL_ROI.map((row) => {
                const profitNeg = String(row.profit).includes("-");
                return (
                  <tr key={row.source}>
                    <td>
                      <SourceBadge source={row.source} />
                    </td>
                    <td>{row.spend.toLocaleString("en-US")} ﷼</td>
                    <td>{row.revenue.toLocaleString("en-US")} ﷼</td>
                    <td>
                      <RoasChip value={formatRoas(row.roas)} numeric={parseFloat(String(row.roas).replace(/[^\d.]/g, ""))} />
                    </td>
                    <td>{row.conversions}</td>
                    <td>{row.cac} ﷼</td>
                    <td className={profitNeg ? "mk-neg" : "mk-pos"}>{formatProfit(row.profit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="mkt-top3">
        <SectionCard title="أكثر الحملات تحقيقًا للطلبات">
          <div className="mkt-toplist">
            {TOP_CAMPAIGNS_BY_LEADS.map((item) => (
              <div key={item.label} className="mkt-toprow">
                <span className="mkt-topn">
                  {item.label} <SourceBadge source={item.source} />
                </span>
                <b>{item.leads} طلب</b>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="أكثر الصفحات والمقالات زيارة">
          <div className="mkt-toplist">
            {TOP_PAGES_VISITED.map((item) => (
              <div key={item.label} className="mkt-toprow">
                <span className="mkt-topn">
                  {item.label} <span className="mkt-cat">{item.type}</span>
                </span>
                <b>{item.visits.toLocaleString("en-US")}</b>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="أهم الكلمات في Google">
          <div className="mkt-toplist">
            {TOP_GOOGLE_KEYWORDS.map((item, index) => (
              <div key={`${item.label}-${index}`} className="mkt-toprow">
                <span className="mkt-topn">
                  <PosChip pos={item.rank} /> {item.label}
                </span>
                <TrendBadge trend={item.trend} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="cpf-grid" style={{ marginTop: 14 }}>
        <div className="cpf-sec mk-callout good">
          <div className="mk-co-t">أفضل حملة (ROAS)</div>
          <div className="mk-co-n">{BEST_CAMPAIGN.title}</div>
          <div className="mk-co-v">
            {formatRoas(BEST_CAMPAIGN.roas)} · {BEST_CAMPAIGN.profitLabel}
          </div>
          <Link href="?tab=campaigns" className="mk-co-b">
            التفاصيل →
          </Link>
        </div>
        <div className="cpf-sec mk-callout bad">
          <div className="mk-co-t">أضعف حملة (ROAS)</div>
          <div className="mk-co-n">{WORST_CAMPAIGN.title}</div>
          <div className="mk-co-v">
            {formatRoas(WORST_CAMPAIGN.roas)} · {WORST_CAMPAIGN.profitLabel}
          </div>
          <Link href="?tab=campaigns" className="mk-co-b">
            التفاصيل →
          </Link>
        </div>
      </div>
    </div>
  );
}
