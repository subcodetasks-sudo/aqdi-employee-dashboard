"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { StatusPill } from "../shared/Badges";
import { TH, TD } from "../shared/table";
import {
  SERVICE_PAGE_STATS,
  SERVICE_PAGES,
  ARTICLE_STATS,
  ARTICLE_CATEGORIES,
  ARTICLES,
  EDITORIAL_QUEUE,
} from "../shared/mock-data";

const VIEWS = [
  { value: "pages", label: "صفحات الخدمات" },
  { value: "articles", label: "المقالات" },
];

export default function ContentTab() {
  const [view, setView] = useState("pages");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => toast.success(view === "pages" ? "إنشاء صفحة خدمة جديدة (واجهة تجريبية)" : "إنشاء مقال جديد (واجهة تجريبية)")}
          className="h-9 px-4 rounded-lg bg-[#0B5345] text-white text-[13px] font-bold flex items-center gap-1.5 hover:bg-[#0F6B57] transition-colors"
        >
          <Plus className="size-4" />
          {view === "pages" ? "صفحة خدمة جديدة" : "مقال جديد"}
        </button>

        <div className="inline-flex rounded-full border border-[#E6EBE9] bg-white p-1 gap-1">
          {VIEWS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value)}
              className={cn(
                "h-8 px-4 rounded-full text-[12px] font-bold transition-all",
                view === item.value ? "bg-[#0B5345] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {view === "pages" ? <ServicePagesView /> : <ArticlesView />}
    </div>
  );
}

function ServicePagesView() {
  return (
    <>
      <StatCardRow items={SERVICE_PAGE_STATS} className="lg:grid-cols-3" />

      <SectionCard title="صفحات الخدمات والصفحات الثابتة للموقع">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>العنوان</th>
                <th className={TH}>الرابط</th>
                <th className={TH}>الكلمة المستهدفة</th>
                <th className={TH}>الحالة</th>
                <th className={TH}>التاريخ</th>
                <th className={TH}></th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_PAGES.map((row) => (
                <tr key={row.title}>
                  <td className={cn(TD, "font-semibold text-[#111827]")}>{row.title}</td>
                  <td className={cn(TD, "text-[#2563EB]")}>{row.link}</td>
                  <td className={TD}>{row.keyword}</td>
                  <td className={TD}>
                    <StatusPill status={row.status} />
                  </td>
                  <td className={cn(TD, "tabular-nums")}>{row.date}</td>
                  <td className={TD}>
                    <EditButton />
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

function ArticlesView() {
  const [category, setCategory] = useState("الكل");

  const rows = useMemo(
    () => (category === "الكل" ? ARTICLES : ARTICLES.filter((article) => article.category === category)),
    [category]
  );

  return (
    <>
      <StatCardRow items={ARTICLE_STATS} className="lg:grid-cols-6" />

      <div className="flex flex-wrap gap-2">
        {ARTICLE_CATEGORIES.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setCategory(label)}
            className={cn(
              "h-8 px-3.5 rounded-full text-[12px] font-bold transition-all",
              category === label
                ? "bg-[#0B5345] text-white"
                : "bg-white text-[#374151] border border-[#E6EBE9] hover:bg-[#F9FAFB]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <SectionCard>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>العنوان</th>
                <th className={TH}>التصنيف</th>
                <th className={TH}>الكاتب</th>
                <th className={TH}>الحالة</th>
                <th className={TH}>التاريخ</th>
                <th className={TH}>كلمات</th>
                <th className={TH}>مشاهدات</th>
                <th className={TH}>Leads</th>
                <th className={TH}>إيراد</th>
                <th className={TH}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.title}>
                  <td className={cn(TD, "font-semibold text-[#111827] whitespace-normal max-w-[280px]")}>{row.title}</td>
                  <td className={TD}>
                    <span className="text-[11px] font-semibold text-[#374151] bg-[#F3F4F6] rounded px-2 py-1">
                      {row.category}
                    </span>
                  </td>
                  <td className={TD}>{row.author}</td>
                  <td className={TD}>
                    <StatusPill status={row.status} />
                  </td>
                  <td className={cn(TD, "tabular-nums")}>{row.date}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.words.toLocaleString("en-US")}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.views.toLocaleString("en-US")}</td>
                  <td className={cn(TD, "tabular-nums")}>{row.leads}</td>
                  <td className={cn(TD, "font-semibold text-[#111827] tabular-nums")}>{row.revenue}</td>
                  <td className={TD}>
                    <EditButton />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="التقويم التحريري – قيد الإعداد">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EDITORIAL_QUEUE.map((item) => (
            <div key={item.title} className="rounded-lg border border-[#E6EBE9] p-3.5 flex flex-col gap-2">
              <p
                className={cn(
                  "text-[11px] font-bold w-fit rounded-full px-2 py-0.5",
                  item.status === "مجدول" ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#F3F4F6] text-[#6B7280]"
                )}
              >
                {item.date}
              </p>
              <p className="text-[13px] font-semibold text-[#111827]">{item.title}</p>
              <span className="text-[11px] font-semibold text-[#374151] bg-[#F3F4F6] rounded px-2 py-1 w-fit">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function EditButton() {
  return (
    <button
      type="button"
      onClick={() => toast.success("فتح المحرر (واجهة تجريبية)")}
      className="h-8 px-3 rounded-lg border border-[#E6EBE9] bg-white text-[12px] font-bold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
    >
      تحرير
    </button>
  );
}
