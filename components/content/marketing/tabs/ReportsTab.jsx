"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { SourceBadge, RoasChip } from "../shared/Badges";
import {
  REPORT_HIGHLIGHTS,
  PERIOD_COMPARISON,
  REPORT_STATS,
  REPORT_PERIODS,
  REPORT_CHANNEL_TABLE,
} from "../shared/mock-data";

const CHANNEL_OPTIONS = [
  { id: "all", label: "كل القنوات" },
  { id: "google", label: "قوقل" },
  { id: "meta", label: "ميتا" },
  { id: "tiktok", label: "تيك توك" },
  { id: "snap", label: "سناب" },
  { id: "x", label: "إكس" },
];

function formatRoas(value) {
  const raw = String(value).replace(/^x/i, "").replace(/×$/, "");
  return `${raw}×`;
}

function formatProfit(profit) {
  const neg = String(profit).includes("-");
  const num = String(profit).replace(/[^\d,]/g, "");
  return `${neg ? "" : "+"}${num} ﷼`;
}

export default function ReportsTab() {
  const [period, setPeriod] = useState("all");
  const [channel, setChannel] = useState("all");
  const [dateFrom, setDateFrom] = useState("2026-06-24");
  const [dateTo, setDateTo] = useState("2026-07-24");

  const handleExport = (label) => toast.success(`${label} (واجهة تجريبية)`);

  return (
    <div>
      <div className="mkt-best4">
        {REPORT_HIGHLIGHTS.map((item) => (
          <div key={item.title} className="cpf-sec mk-best">
            <div className="mk-co-t">{item.title}</div>
            <div className="mk-co-n" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {item.badge === "1" ? (
                <span className="mkt-pos ptop">1</span>
              ) : item.badge && item.badge !== "قوقل" ? (
                <SourceBadge source={item.badge} />
              ) : item.badge === "قوقل" ? (
                <SourceBadge source="قوقل" />
              ) : null}
              {item.label}
            </div>
            <div className="mk-co-v">{item.detail}</div>
          </div>
        ))}
      </div>

      <SectionCard title={PERIOD_COMPARISON.title} className="mt-[14px]">
        <div className="mkt-cmp">
          {PERIOD_COMPARISON.items.map((item) => (
            <div key={item.label} className="mkt-cmpc">
              <div className="mkt-up" style={{ marginBottom: 4 }}>
                ▲ {item.change}
              </div>
              <div className="mkt-cmpv">{item.value.replace(/ريال/g, "﷼")}</div>
              <div className="mkt-cmpl">{item.label}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <StatCardRow items={REPORT_STATS} />

      <SectionCard title="منشئ التقارير التفصيلية" className="mt-[14px]">
        <div className="mkt-blogbar" style={{ marginTop: 0 }}>
          <div className="mkt-cats">
            <button type="button" className="mk-mini" onClick={() => handleExport("تصدير PDF")}>
              PDF
            </button>
            <button type="button" className="mk-mini" onClick={() => handleExport("تصدير Excel/CSV")}>
              Excel/CSV
            </button>
          </div>
          <div className="mkt-cats">
            {REPORT_PERIODS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPeriod(option.id)}
                className={cn("mkt-catb", period === option.id && "on")}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="mkt-syncright">
            <label className="mkt-synctime" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              من
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mk-mini"
              />
            </label>
            <label className="mkt-synctime" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              إلى
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mk-mini"
              />
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mk-mini"
              dir="rtl"
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mkt-synchint" style={{ marginTop: 10 }}>
          {REPORT_CHANNEL_TABLE.rangeLabel}
        </p>
        <div className="tblwrap">
          <table className="mkt-tbl">
            <thead>
              <tr>
                <th>البُعد</th>
                <th>الصرف</th>
                <th>الإيراد</th>
                <th>ROAS</th>
                <th>Leads</th>
                <th>تحويلات</th>
                <th>CAC</th>
                <th>الربح</th>
              </tr>
            </thead>
            <tbody>
              {REPORT_CHANNEL_TABLE.rows.map((row) => (
                <tr key={row.source}>
                  <td>
                    <SourceBadge source={row.source} />
                  </td>
                  <td>{row.spend.toLocaleString("en-US")} ﷼</td>
                  <td>{row.revenue.toLocaleString("en-US")} ﷼</td>
                  <td>
                    <RoasChip
                      value={formatRoas(row.roas)}
                      numeric={parseFloat(String(row.roas).replace(/[^\d.]/g, ""))}
                    />
                  </td>
                  <td>{row.leads}</td>
                  <td>{row.conversions}</td>
                  <td>{row.cac} ﷼</td>
                  <td className={row.profit.includes("-") ? "mk-neg" : "mk-pos"}>
                    {formatProfit(row.profit)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="mkt-title">الإجمالي</td>
                <td className="mkt-title">
                  {REPORT_CHANNEL_TABLE.total.spend.toLocaleString("en-US")} ﷼
                </td>
                <td className="mkt-title">
                  {REPORT_CHANNEL_TABLE.total.revenue.toLocaleString("en-US")} ﷼
                </td>
                <td>
                  <RoasChip
                    value={formatRoas(REPORT_CHANNEL_TABLE.total.roas)}
                    numeric={parseFloat(String(REPORT_CHANNEL_TABLE.total.roas).replace(/[^\d.]/g, ""))}
                  />
                </td>
                <td className="mkt-title">{REPORT_CHANNEL_TABLE.total.leads}</td>
                <td className="mkt-title">{REPORT_CHANNEL_TABLE.total.conversions}</td>
                <td className="mkt-title">{REPORT_CHANNEL_TABLE.total.cac} ﷼</td>
                <td className="mk-pos">{formatProfit(REPORT_CHANNEL_TABLE.total.profit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
