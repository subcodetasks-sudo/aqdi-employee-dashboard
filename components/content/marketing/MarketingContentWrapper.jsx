"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { MARKETING_TABS, DATE_RANGE_LABEL, SCOPE_BREADCRUMB } from "./shared/mock-data";
import OverviewTab from "./tabs/OverviewTab";
import CampaignsTab from "./tabs/CampaignsTab";
import SeoTab from "./tabs/SeoTab";
import ContentTab from "./tabs/ContentTab";
import ReportsTab from "./tabs/ReportsTab";
import PixelsTab from "./tabs/PixelsTab";
import "./marketing-design.css";

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

  const activeTab = resolveTab(searchParams.get("tab"));

  const setActiveTab = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const ActivePanel = TAB_COMPONENTS[activeTab];

  return (
    <div
      className="mkt-page flex flex-col min-h-screen -m-[45px] p-[45px] max-[1700px]:-m-[30px] max-[1700px]:p-[30px] bg-[#F4F6F5] dark:bg-[#0B1411]"
      dir="rtl"
    >
      <div className="radm-head">
        <button type="button" className="mkt-back" onClick={() => router.back()}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 6-6 6 6 6" />
          </svg>
          رجوع
        </button>

        <div className="radm-ttl">
          <b>التسويق والمحتوى</b>
          <small>{SCOPE_BREADCRUMB}</small>
        </div>

        <div className="radm-kpis">
          <span className="radm-kpi">{DATE_RANGE_LABEL}</span>
        </div>
      </div>

      <div className="mkt-tabs" role="tablist">
        {MARKETING_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn("mtab", activeTab === tab.value && "on")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mkt-body">
        <ActivePanel />
      </div>
    </div>
  );
}
