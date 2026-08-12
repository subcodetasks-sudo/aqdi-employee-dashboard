"use client";

import { useState } from "react";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import ReportSectionCard, { ReportLineList } from "../shared/ReportSectionCard";
import {
  PNL_LINES,
  PROFIT_SETTINGS,
  PROFITS_KPIS,
  SERVICE_PROFITABILITY,
} from "../mock-data";

export default function ProfitsReportTab() {
  const [settings, setSettings] = useState(
    Object.fromEntries(PROFIT_SETTINGS.map((s) => [s.key, s.value]))
  );

  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={PROFITS_KPIS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="أكثر و أقل الخدمات ربحاً">
          <div className="flex flex-col gap-3">
            {SERVICE_PROFITABILITY.map((item) => {
              const peak = Math.max(...SERVICE_PROFITABILITY.map((s) => s.value));
              const width = Math.max((item.value / peak) * 100, 4);

              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[12px] text-[#9CA3AF] w-10 shrink-0 tabular-nums">
                    {item.margin}
                  </span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex-1 h-7 bg-[#F3F4F6] rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md"
                        style={{ width: `${width}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-[13px] text-[#374151] truncate min-w-0 flex-1 text-right">
                      {item.medal ? "🥇 " : ""}
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold w-10 shrink-0 tabular-nums">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </ReportSectionCard>

        <ReportSectionCard title="قائمة الأرباح والخسائر – كل الفترات">
          <ReportLineList items={PNL_LINES} />
        </ReportSectionCard>
      </div>

      <ReportSectionCard title="الإعدادات الحالية (حفظ تلقائي)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROFIT_SETTINGS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#6B7280]">{field.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings[field.key]}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="flex-1 h-10 px-3 rounded-lg border border-[#E6EBE9] text-[14px] font-semibold text-[#111827] focus:outline-none focus:border-[#0B5345]"
                />
                <span className="text-[12px] text-[#9CA3AF] shrink-0">{field.unit}</span>
              </div>
            </label>
          ))}
        </div>
      </ReportSectionCard>
    </div>
  );
}
