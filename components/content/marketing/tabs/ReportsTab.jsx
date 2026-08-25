"use client";

import { useState } from "react";
import { FileDown, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { SourceBadge } from "../shared/Badges";
import { TH, TD } from "../shared/table";
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

export default function ReportsTab() {
  const [period, setPeriod] = useState("all");
  const [channel, setChannel] = useState("all");
  const [dateFrom, setDateFrom] = useState("2026-06-24");
  const [dateTo, setDateTo] = useState("2026-07-24");

  const handleExport = (label) => toast.success(`${label} (واجهة تجريبية)`);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REPORT_HIGHLIGHTS.map((item) => (
          <div key={item.title} className="rounded-xl border border-surface-border-soft bg-white p-4 flex flex-col gap-2 min-w-0">
            <p className="text-11 text-gray-400">{item.title}</p>
            <div className="flex items-center gap-2 min-w-0">
              {item.badge ? <SourceBadge source={item.badge} /> : null}
              <span className="text-sm font-bold text-gray-900 truncate">{item.label}</span>
            </div>
            <p className="text-xs text-gray-700">{item.detail}</p>
          </div>
        ))}
      </div>

      <SectionCard title={PERIOD_COMPARISON.title}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PERIOD_COMPARISON.items.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xs font-bold text-green-700 mb-1">▲ {item.change}</p>
              <p className="text-22 font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <StatCardRow items={REPORT_STATS} className="lg:grid-cols-5" />

      <SectionCard title="منشئ التقارير التفصيلية">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport("تصدير PDF")}
              className="h-9 px-4 rounded-lg border border-surface-border-soft bg-white text-xs font-bold text-gray-700 hover:bg-[#F9FAFB] transition-colors flex items-center gap-1.5"
            >
              <FileText className="size-4 text-status-neutral" />
              PDF
            </button>
            <button
              type="button"
              onClick={() => handleExport("تصدير Excel/CSV")}
              className="h-9 px-4 rounded-lg border border-surface-border-soft bg-white text-xs font-bold text-gray-700 hover:bg-[#F9FAFB] transition-colors flex items-center gap-1.5"
            >
              <FileDown className="size-4 text-status-neutral" />
              Excel/CSV
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {REPORT_PERIODS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPeriod(option.id)}
                className={cn(
                  "h-9 px-4 rounded-full text-xs font-bold transition-all",
                  period === option.id
                    ? "bg-brand-dark text-white"
                    : "bg-white text-[#424242] border border-surface-border hover:bg-[#F9FAFB]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-status-neutral">
              من
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-lg border border-surface-border-soft px-2 text-xs text-gray-700"
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-status-neutral">
              إلى
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-lg border border-surface-border-soft px-2 text-xs text-gray-700"
              />
            </label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="h-9 w-[140px] rounded-lg border-surface-border-soft text-xs font-semibold bg-white dark:bg-[#0F1C16] dark:border-white/10 dark:text-white">
                <SelectValue placeholder="حسب القناة" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {CHANNEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-1 mt-4">
          <p className="text-xs text-gray-400 mb-3">{REPORT_CHANNEL_TABLE.rangeLabel}</p>
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>البُعد</th>
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
              {REPORT_CHANNEL_TABLE.rows.map((row) => (
                <tr key={row.source}>
                  <td className={TD}>
                    <SourceBadge source={row.source} />
                  </td>
                  <td className={cn(TD, "tabular-nums")}>{row.spend.toLocaleString("en-US")} ريال</td>
                  <td className={cn(TD, "tabular-nums")}>{row.revenue.toLocaleString("en-US")} ريال</td>
                  <td className={cn(TD, "font-bold text-green-700 tabular-nums")}>{row.roas}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.leads}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.conversions}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.cac} ريال</td>
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
              <tr>
                <td className={cn(TD, "font-bold text-gray-900")}>الإجمالي</td>
                <td className={cn(TD, "font-bold text-gray-900 tabular-nums")}>
                  {REPORT_CHANNEL_TABLE.total.spend.toLocaleString("en-US")} ريال
                </td>
                <td className={cn(TD, "font-bold text-gray-900 tabular-nums")}>
                  {REPORT_CHANNEL_TABLE.total.revenue.toLocaleString("en-US")} ريال
                </td>
                <td className={cn(TD, "font-bold text-green-700 tabular-nums")}>{REPORT_CHANNEL_TABLE.total.roas}</td>
                <td className={cn(TD, "font-bold text-gray-900 tabular-nums")}>{REPORT_CHANNEL_TABLE.total.leads}</td>
                <td className={cn(TD, "font-bold text-gray-900 tabular-nums")}>
                  {REPORT_CHANNEL_TABLE.total.conversions}
                </td>
                <td className={cn(TD, "font-bold text-gray-900 tabular-nums")}>{REPORT_CHANNEL_TABLE.total.cac} ريال</td>
                <td className={cn(TD, "font-bold text-green-700 tabular-nums")}>{REPORT_CHANNEL_TABLE.total.profit}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
