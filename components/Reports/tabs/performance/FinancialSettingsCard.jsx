"use client";

import { useState } from "react";
import { useProfitSettings, useUpdateProfitSettings } from "@/src/hooks/use-reports";
import ReportSectionCard from "../../shared/ReportSectionCard";

const SETTING_FIELDS = [
  ["moyasar_fee_percent", "رسوم موياسر", "%"],
  ["meter_fee", "رسوم نقل العداد باسم المستأجر", "ريال"],
  ["monthly_salaries", "الرواتب الشهرية", "ريال"],
  ["operating_budget", "المصاريف التشغيلية الشهرية", "ريال"],
  ["marketing_budget", "الميزانية التسويقية الشهرية", "ريال"],
];

export default function FinancialSettingsCard() {
  const { data: settingsData } = useProfitSettings();
  const { mutate: updateSettings } = useUpdateProfitSettings();
  const [settings, setSettings] = useState(null);

  const currentSettings = settings ?? settingsData ?? {};

  const saveSetting = (key, rawValue) => {
    const numericValue = rawValue === "" ? null : Number(rawValue);
    const next = { ...currentSettings, [key]: Number.isNaN(numericValue) ? rawValue : numericValue };
    setSettings(next);
    if (numericValue === null || !Number.isNaN(numericValue)) updateSettings(next);
  };

  return (
    <ReportSectionCard title="الإعدادات المالية (تُحفظ تلقائيًا)">
      <div className="flex flex-col gap-3">
        {SETTING_FIELDS.map(([key, label, unit]) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-status-neutral dark:text-white/60">{label}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step={key === "moyasar_fee_percent" ? "0.05" : key === "meter_fee" ? "1" : "500"}
                value={currentSettings[key] ?? ""}
                onChange={(e) => saveSetting(key, e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-surface-border-soft text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-dark dark:bg-[#0F1C16] dark:border-white/10 dark:text-white"
              />
              <span className="text-xs text-gray-400 shrink-0 dark:text-white/50">{unit}</span>
            </div>
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3 dark:text-white/50">
        تُوزَّع الثابتة على أيام الفترة المختارة (شهر = 30 يومًا)
      </p>
    </ReportSectionCard>
  );
}
