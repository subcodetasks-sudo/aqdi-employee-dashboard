"use client";

import { useState } from "react";
import Link from "next/link";
import { AlignJustify, ChevronLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SITE_APP_SETTINGS, SYSTEM_CATEGORIES } from "./mock-data";

export default function GeneralSettingsTab() {
  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(SITE_APP_SETTINGS.map((item) => [item.id, item.enabled]))
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-[14px] font-bold text-[#054D44]">إعدادات الموقع والتطبيق</h2>

        <div className="grid grid-cols-5 gap-3 max-[1200px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
          {SITE_APP_SETTINGS.map((item) => {
            const enabled = toggles[item.id];
            return (
              <div
                key={item.id}
                className="flex flex-col items-center gap-3 rounded-2xl border border-[#E6EBE9] bg-white px-4 py-5 shadow-[0_4px_12px_rgba(11,83,69,0.04)] dark:bg-[#13241C] dark:border-white/10"
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    enabled ? "bg-[#054D44]" : "bg-[#D1D5DB]"
                  )}
                />
                <div className="text-center">
                  <p className="text-[14px] font-bold text-[#111827] dark:text-white">
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[12px] font-bold",
                      enabled ? "text-[#054D44]" : "text-[#DC2626]"
                    )}
                  >
                    {enabled ? "مفعل" : "معطل"}
                  </p>
                </div>
                <Switch
                  dir="ltr"
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    setToggles((prev) => ({ ...prev, [item.id]: checked }))
                  }
                  className="data-[state=checked]:bg-[#054D44]"
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[14px] font-bold text-[#054D44]">
          إعدادات النظام ({SYSTEM_CATEGORIES.length} فئة)
        </h2>

        <div className="grid grid-cols-6 gap-3 max-[1400px]:grid-cols-4 max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
          {SYSTEM_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex items-center gap-3 rounded-2xl border border-[#E6EBE9] bg-white px-3 py-3.5 shadow-[0_4px_12px_rgba(11,83,69,0.04)] transition-all hover:border-[#054D44]/30 hover:shadow-md dark:bg-[#13241C] dark:border-white/10"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F1] text-[#054D44] dark:bg-emerald-500/15 dark:text-emerald-300">
                <AlignJustify className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-[#111827] dark:text-white">
                  {category.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-medium text-[#9CA3AF]">
                  {category.subtitle}
                </span>
              </span>
              <ChevronLeft className="size-4 shrink-0 text-[#D1D5DB] transition-colors group-hover:text-[#054D44]" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
