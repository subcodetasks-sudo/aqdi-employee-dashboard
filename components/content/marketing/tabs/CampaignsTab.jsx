"use client";

import { useState } from "react";
import { RefreshCw, ChevronLeft, ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { SourceBadge, StatusDot } from "../shared/Badges";
import { TH, TD } from "../shared/table";
import { SYNC_PLATFORMS, CAMPAIGN_STATS, CAMPAIGNS } from "../shared/mock-data";

export default function CampaignsTab() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    toast.success("تتم مزامنة الحملات من حسابات الإعلانات (واجهة تجريبية)");
    setTimeout(() => setSyncing(false), 900);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSync}
            className="h-10 px-4 rounded-lg bg-brand-dark text-white text-13 font-bold flex items-center gap-2 hover:bg-[#0F6B57] transition-colors shrink-0"
          >
            <RefreshCw className={cn("size-4", syncing && "animate-spin")} />
            مزامنة الآن
          </button>

          <div className="flex flex-wrap items-center gap-2 text-xs text-status-neutral">
            <span>تُزامن تلقائيًا من:</span>
            {[...SYNC_PLATFORMS].reverse().map((platform) => (
              <span
                key={platform.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-surface-border-soft bg-white px-2.5 py-1 text-xs font-semibold text-gray-700"
              >
                <span
                  className={cn("size-[7px] rounded-full", platform.connected ? "bg-[#16A34A]" : "bg-[#D1D5DB]")}
                />
                {platform.label}
              </span>
            ))}
          </div>
        </div>
        <p className="text-11 text-gray-400 italic">
          الأرقام تُسحب آليًا من حسابات الإعلانات — لإدارة الربط والمعرّفات افتح تبويب «الربط والبكسلات».
        </p>
      </div>

      <StatCardRow items={CAMPAIGN_STATS} className="lg:grid-cols-5" />

      <SectionCard title="كل الحملات" subtitle="مُزامَنة من الحسابات المربوطة · مرتبة حسب ROAS">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr>
                <th className={TH}></th>
                <th className={TH}>المصدر/الحملة</th>
                <th className={TH}>الحالة</th>
                <th className={TH}>الصرف</th>
                <th className={TH}>الإيراد</th>
                <th className={TH}>ROAS</th>
                <th className={TH}>Leads</th>
                <th className={TH}>تحويلات</th>
                <th className={TH}>CAC</th>
                <th className={TH}>الربح</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((row) => (
                <tr key={row.name}>
                  <td className={TD}>
                    <ChevronLeft className="size-4 text-gray-400" />
                  </td>
                  <td className={TD}>
                    <div className="flex items-center gap-2 mb-1">
                      <SourceBadge source={row.source} />
                      <span className="font-semibold text-gray-900">{row.name}</span>
                    </div>
                    <p
                      className={cn(
                        "text-11 flex items-center gap-1",
                        row.linked ? "text-gray-400" : "text-red-600"
                      )}
                    >
                      {row.linked ? (
                        <>
                          مزامنة تلقائية · {row.account}
                          <ExternalLink className="size-3" />
                        </>
                      ) : (
                        <>
                          {row.account}
                          <AlertTriangle className="size-3" />
                          غير مربوط
                        </>
                      )}
                    </p>
                  </td>
                  <td className={TD}>
                    <StatusDot status={row.status} />
                  </td>
                  <td className={cn(TD, "tabular-nums")}>{row.spend.toLocaleString("en-US")}ريال</td>
                  <td className={cn(TD, "tabular-nums")}>{row.revenue.toLocaleString("en-US")}ريال</td>
                  <td className={cn(TD, "font-bold text-green-700 tabular-nums")}>{row.roas}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.leads}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.conversions}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.cac}ريال</td>
                  <td
                    className={cn(
                      TD,
                      "font-bold tabular-nums",
                      row.profit.includes("-") ? "text-red-600" : "text-green-700"
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
    </div>
  );
}
