"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MARKETING_TABS, DATE_RANGE_LABEL, SCOPE_BREADCRUMB } from "./shared/mock-data";
import OverviewTab from "./tabs/OverviewTab";
import CampaignsTab from "./tabs/CampaignsTab";
import SeoTab from "./tabs/SeoTab";
import ContentTab from "./tabs/ContentTab";
import ReportsTab from "./tabs/ReportsTab";
import PixelsTab from "./tabs/PixelsTab";

const TAB_COMPONENTS = {
  overview: OverviewTab,
  campaigns: CampaignsTab,
  seo: SeoTab,
  content: ContentTab,
  reports: ReportsTab,
  pixels: PixelsTab,
};

function resolveTab(raw) {
  return TAB_COMPONENTS[raw] ? raw : "overview";
}

export default function MarketingContentWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(true);

  const activeTab = resolveTab(searchParams.get("tab"));

  const setActiveTab = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const ActivePanel = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#F4F6F5]" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div className="text-right">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-1"
          >
            رجوع
            <ChevronLeft className="size-3.5" />
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-22 font-bold text-gray-900 leading-tight">التسويق والمحتوى</h1>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-10 font-bold text-amber-700">
              تحليلات قيد التطوير
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{SCOPE_BREADCRUMB}</p>
        </div>

        <div className="flex-1" />

        <div className="text-13 text-status-neutral shrink-0">{DATE_RANGE_LABEL}</div>

        <button
          type="button"
          onClick={() => setFiltersOpen((prev) => !prev)}
          aria-label={filtersOpen ? "طي الفلاتر" : "إظهار الفلاتر"}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-700 transition-colors mt-1 shrink-0"
        >
          <ChevronUp className="size-3.5" />
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-0">
        <div className="flex flex-wrap items-center gap-6 overflow-x-auto">
          {[...MARKETING_TABS].reverse().map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "pb-3 pt-1 text-sm font-bold whitespace-nowrap border-b-2 transition-colors shrink-0",
                activeTab === tab.value
                  ? "text-brand-dark border-brand-dark"
                  : "text-gray-400 border-transparent hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="border-b border-surface-border-soft" />
      </div>

      <ActivePanel />
    </div>
  );
}
