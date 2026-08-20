"use client";

import { useState } from "react";
import Loader from "@/components/home/loader";
import { useProfitSettings, useProfitsReport, useUpdateProfitSettings } from "@/src/hooks/use-reports";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import ReportSectionCard, { ReportLineList } from "../shared/ReportSectionCard";
import ReportError from "../shared/ReportError";

export default function ProfitsReportTab({ period, dateFrom, dateTo }) {
  const { data, isLoading, isError, error } = useProfitsReport(period, dateFrom, dateTo);
  const { data: settingsData } = useProfitSettings();
  const { mutate: updateSettings } = useUpdateProfitSettings();
  const [settings, setSettings] = useState(null);
  const currentSettings = settings ?? settingsData ?? {};
  if (isLoading) return <Loader />;
  if (isError) return <ReportError title="الأرباح والتكاليف" error={error} fallback="تعذّر تحميل تقرير الأرباح." />;
  const k = data?.kpis ?? {};
  const kpis = [["customer_income", "دخل العملاء", "wallet"], ["gross_profit", "إجمالي الربح", "wallet"], ["net_profit", "صافي الربح", "wallet", "danger"], ["margin_percent", "هامش الربح", "percent"], ["profit_per_order", "ربح لكل طلب", "wallet"], ["ad_spend", "مصاريف الإعلانات", "wallet", "danger"]].map(([key, label, icon, tone]) => ({ key, label, value: key === "margin_percent" ? `${k[key] ?? 0}%` : k[key] ?? 0, icon, tone, isText: key === "margin_percent" }));
  const pnl = (data?.pnl ?? []).map((row) => ({ label: row.label, value: `${Number(row.value ?? 0).toLocaleString("en-US")} ريال`, tone: row.value < 0 ? "red" : "green", bold: row.is_total || row.is_subtotal, separator: row.is_subtotal }));
  const fields = [["moyasar_fee_percent", "رسوم Moyasar", "%"], ["monthly_salaries", "الرواتب الشهرية", "ريال"], ["operating_budget", "المصاريف التشغيلية", "ريال"], ["marketing_budget", "ميزانية التسويق", "ريال"]];
  const saveSetting = (key, value) => { const next = { ...currentSettings, [key]: value }; setSettings(next); updateSettings(next); };

  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="أكثر و أقل الخدمات ربحاً">
          <div className="flex flex-col gap-3">
            {(data?.service_revenue ?? []).map((item) => {
              const peak = Math.max(...(data?.service_revenue ?? []).map((s) => s.revenue), 1);
              const width = Math.max((item.revenue / peak) * 100, 4);

              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[12px] text-[#9CA3AF] w-10 shrink-0 tabular-nums dark:text-white/50">
                    {item.revenue_share_percent ?? 0}%
                  </span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex-1 h-7 bg-[#F3F4F6] rounded-md overflow-hidden dark:bg-white/10">
                      <div
                        className="h-full rounded-md"
                        style={{ width: `${width}%`, backgroundColor: "#0B5345" }}
                      />
                    </div>
                    <span className="text-[13px] text-[#374151] truncate min-w-0 flex-1 text-right dark:text-white/70">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold w-10 shrink-0 tabular-nums dark:text-white">
                    {Number(item.revenue ?? 0).toLocaleString("en-US")}
                  </span>
                </div>
              );
            })}
          </div>
        </ReportSectionCard>

        <ReportSectionCard title="قائمة الأرباح والخسائر – كل الفترات">
          <ReportLineList items={pnl} />
        </ReportSectionCard>
      </div>

      <ReportSectionCard title="الإعدادات الحالية (حفظ تلقائي)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map(([key, label, unit]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#6B7280] dark:text-white/60">{label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentSettings[key] ?? ""}
                  onChange={(e) => saveSetting(key, e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-[#E6EBE9] text-[14px] font-semibold text-[#111827] focus:outline-none focus:border-[#0B5345] dark:bg-[#0F1C16] dark:border-white/10 dark:text-white"
                />
                <span className="text-[12px] text-[#9CA3AF] shrink-0 dark:text-white/50">{unit}</span>
              </div>
            </label>
          ))}
        </div>
      </ReportSectionCard>
    </div>
  );
}
