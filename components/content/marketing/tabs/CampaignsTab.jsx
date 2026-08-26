"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { SourceBadge, StatusDot, RoasChip } from "../shared/Badges";
import { SYNC_PLATFORMS, CAMPAIGN_STATS, CAMPAIGNS } from "../shared/mock-data";

function formatRoas(value) {
  const raw = String(value).replace(/^x/i, "").replace(/×$/, "");
  return `${raw}×`;
}

function formatProfit(profit) {
  const neg = String(profit).includes("-");
  const num = String(profit).replace(/[^\d,]/g, "");
  return `${neg ? "" : "+"}${num} ﷼`;
}

export default function CampaignsTab() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    toast.success("تتم مزامنة الحملات من حسابات الإعلانات (واجهة تجريبية)");
    setTimeout(() => setSyncing(false), 900);
  };

  const sorted = [...CAMPAIGNS].sort((a, b) => {
    const ra = parseFloat(String(a.roas).replace(/[^\d.]/g, "")) || 0;
    const rb = parseFloat(String(b.roas).replace(/[^\d.]/g, "")) || 0;
    return rb - ra;
  });

  return (
    <div>
      <div className="mkt-syncbar">
        <div className="mkt-srcs">
          <span className="mkt-src-lbl">تُزامَن تلقائيًا من:</span>
          {SYNC_PLATFORMS.map((platform) => (
            <span key={platform.label} className={cn("mkt-srcchip", !platform.connected && "off")}>
              <i className={cn("mkt-srcdot", platform.connected && "on")} />
              {platform.label}
            </span>
          ))}
        </div>
        <div className="mkt-syncright">
          <span className="mkt-synctime">آخر مزامنة: 2026-07-24 11:32</span>
          <button type="button" className="mkt-syncb" onClick={handleSync} disabled={syncing}>
            {syncing ? "⟳ جارٍ المزامنة..." : "⟳ مزامنة الآن"}
          </button>
        </div>
      </div>
      <p className="mkt-synchint">
        الأرقام تُسحب آليًا من حسابات الإعلانات — لإدارة الربط والمعرّفات افتح تبويب «الربط والبكسلات».
      </p>

      <StatCardRow items={CAMPAIGN_STATS} />

      <SectionCard
        title="كل الحملات — مُزامَنة من الحسابات المربوطة · مرتبة حسب ROAS"
        className="mt-3"
      >
        <div className="tblwrap">
          <table className="mkt-tbl">
            <thead>
              <tr>
                <th>الحملة / المصدر</th>
                <th>الحالة</th>
                <th>الصرف</th>
                <th>الإيراد</th>
                <th>ROAS</th>
                <th>Leads</th>
                <th>تحويلات</th>
                <th>CAC</th>
                <th>الربح</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.name}>
                  <td className="mkt-title">
                    {row.name} <SourceBadge source={row.source} />
                    <span className={cn("mkt-srcline", !row.linked && "warn")}>
                      {row.linked ? `⟳ ${row.account} · مزامنة تلقائية` : `⚠ ${row.account} · غير مربوط`}
                    </span>
                  </td>
                  <td>
                    <StatusDot status={row.status} />
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
                  <td>
                    <span className="mk-arrow">←</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
