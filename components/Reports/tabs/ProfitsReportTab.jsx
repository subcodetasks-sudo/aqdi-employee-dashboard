"use client";

import { useState } from "react";
import Loader from "@/components/home/loader";
import { useProfitSettings, useProfitsReport, useUpdateProfitSettings } from "@/src/hooks/use-reports";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart from "../shared/HorizontalBarChart";
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
  const serviceProfitability = (data?.service_profitability ?? []).map((item) => ({
    label: `${item.label} — ${item.margin_percent ?? 0}%`,
    value: Number(item.profit ?? 0),
  }));
  const fields = [["moyasar_fee_percent", "رسوم Moyasar", "%"], ["monthly_salaries", "الرواتب الشهرية", "ريال"], ["operating_budget", "المصاريف التشغيلية", "ريال"], ["marketing_budget", "ميزانية التسويق", "ريال"]];
  const saveSetting = (key, rawValue) => {
    const numericValue = rawValue === "" ? null : Number(rawValue);
    const next = { ...currentSettings, [key]: Number.isNaN(numericValue) ? rawValue : numericValue };
    setSettings(next);
    if (numericValue === null || !Number.isNaN(numericValue)) updateSettings(next);
  };

  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={kpis} />

      <div dir="ltr" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="أكثر و أقل الخدمات ربحاً">
          <HorizontalBarChart items={serviceProfitability} />
        </ReportSectionCard>

        <ReportSectionCard title="قائمة الأرباح والخسائر – كل الفترات">
          <ReportLineList items={pnl} />
        </ReportSectionCard>
      </div>

      <ReportSectionCard title="الإعدادات الحالية (حفظ تلقائي)">
        <div  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map(([key, label, unit]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-status-neutral dark:text-white/60">{label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentSettings[key] ?? ""}
                  onChange={(e) => saveSetting(key, e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-surface-border-soft text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-dark dark:bg-[#0F1C16] dark:border-white/10 dark:text-white"
                />
                <span className="text-xs text-gray-400 shrink-0 dark:text-white/50">{unit}</span>
              </div>
            </label>
          ))}
        </div>
      </ReportSectionCard>
    </div>
  );
}
