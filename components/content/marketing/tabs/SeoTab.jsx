"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { TrendBadge, SeverityBadge } from "../shared/Badges";
import { TH, TD } from "../shared/table";
import {
  SEO_KEYWORD_STATS,
  SEO_KEYWORDS,
  SEO_CRAWL_META,
  SEO_CRAWL_STATS,
  SEO_CRAWL_DETAILS,
  SEO_PAGE_ISSUES,
} from "../shared/mock-data";

const VIEWS = [
  { value: "keywords", label: "الكلمات المفتاحية" },
  { value: "crawl", label: "فحص الموقع (الزحف)" },
];

export default function SeoTab() {
  const [view, setView] = useState("keywords");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <div className="inline-flex rounded-full border border-surface-border-soft bg-white p-1 gap-1">
          {VIEWS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value)}
              className={cn(
                "h-8 px-4 rounded-full text-xs font-bold transition-all",
                view === item.value ? "bg-brand-dark text-white" : "text-status-neutral hover:bg-[#F9FAFB]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {view === "keywords" ? <KeywordsView /> : <CrawlView />}
    </div>
  );
}

function KeywordsView() {
  return (
    <>
      <StatCardRow items={SEO_KEYWORD_STATS} className="lg:grid-cols-6" />

      <SectionCard title="الكلمات المفتاحية" subtitle="الترتيب والمنافسة والحالة">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>الكلمة / الصفحة</th>
                <th className={TH}>الترتيب الحالي</th>
                <th className={TH}>السابق</th>
                <th className={TH}>بحث/شهر</th>
                <th className={TH}>المنافسة</th>
                <th className={TH}>الحالة</th>
                <th className={TH}>الإيراد</th>
              </tr>
            </thead>
            <tbody>
              {SEO_KEYWORDS.map((row) => (
                <tr key={row.keyword} className={cn(row.highlight && "bg-[#F0FDF4]")}>
                  <td className={TD}>
                    <p className="font-semibold text-gray-900">{row.keyword}</p>
                    <p className="text-11 text-gray-400 mt-0.5">{row.page}</p>
                  </td>
                  <td className={TD}>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center size-6 rounded-full text-11 font-bold",
                        row.trend === "ارتفعت" ? "bg-[#DCFCE7] text-green-700" : "bg-status-neutral-bg text-gray-700"
                      )}
                    >
                      {row.current}
                    </span>
                  </td>
                  <td className={cn(TD, "tabular-nums text-gray-400")}>{row.previous}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.volume.toLocaleString("en-US")}</td>
                  <td className={TD}>{row.competition}</td>
                  <td className={TD}>
                    <TrendBadge trend={row.trend} />
                  </td>
                  <td className={cn(TD, "font-semibold text-gray-900 tabular-nums")}>
                    {row.revenue.toLocaleString("en-US")} ريال
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

function CrawlView() {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    toast.success("بدء فحص الموقع تقنيًا (واجهة تجريبية)");
    setTimeout(() => setScanning(false), 900);
  };

  return (
    <>
      <div className="rounded-xl border border-surface-border-soft bg-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">زحف وفحص الموقع تقنيًا</h3>
          <p className="text-xs text-status-neutral mt-1 max-w-lg">
            يفحص كل صفحات aqdi.sa ويكتشف الأخطاء التقنية التي تضر بترتيبك في Google.
          </p>
          <p className="text-11 text-gray-400 mt-1.5">{SEO_CRAWL_META.lastScan}</p>
        </div>
        <button
          type="button"
          onClick={handleScan}
          className="h-10 px-4 rounded-lg bg-brand-dark text-white text-13 font-bold flex items-center gap-2 hover:bg-[#0F6B57] transition-colors shrink-0"
        >
          <RefreshCw className={cn("size-4", scanning && "animate-spin")} />
          ابدء فحص الموقع
        </button>
      </div>

      <StatCardRow items={SEO_CRAWL_STATS} className="lg:grid-cols-4" />

      <SectionCard title="تفصيل نتائج الفحص">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SEO_CRAWL_DETAILS.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-lg px-3 py-2.5",
                item.tone === "red" && "bg-[#FEE2E2]",
                item.tone === "amber" && "bg-[#FEF3C7]",
                item.tone === "green" && "bg-[#DCFCE7]"
              )}
            >
              <p
                className={cn(
                  "text-base font-bold",
                  item.tone === "red" && "text-red-600",
                  item.tone === "amber" && "text-[#B45309]",
                  item.tone === "green" && "text-green-700"
                )}
              >
                {item.value}
              </p>
              <p className="text-11 text-status-neutral mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="قائمة المشاكل حسب الصفحة">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>الصفحة</th>
                <th className={TH}>المشكلة</th>
                <th className={TH}>الخطورة</th>
              </tr>
            </thead>
            <tbody>
              {SEO_PAGE_ISSUES.map((row, index) => (
                <tr key={`${row.page}-${index}`}>
                  <td className={cn(TD, "font-semibold text-gray-900")}>{row.page}</td>
                  <td className={TD}>{row.issue}</td>
                  <td className={TD}>
                    <SeverityBadge severity={row.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
