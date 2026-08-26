"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ExternalLink, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeoCrawlIssueDetails, useSeoCrawlIssues } from "@/src/hooks/use-seo-crawl";
import AllOrdersPagination from "@/components/Orders/all-orders-pagination";
import SectionCard from "./shared/SectionCard";
import { SeverityBadge } from "./shared/Badges";
import { decodeUriText } from "./shared/decode-uri-text";
import "./marketing-design.css";

const BOOL_LABEL = {
  true: { text: "نعم", tone: "g" },
  false: { text: "لا", tone: "r" },
};

function Field({ label, value, dir }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-white/45 mb-1">{label}</p>
      <p className="text-13 font-bold text-[#111827] dark:text-white break-words" dir={dir}>
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function BoolField({ label, value }) {
  const state = value === null || value === undefined ? null : BOOL_LABEL[String(value)];
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-white/45 mb-1">{label}</p>
      {state ? (
        <span className={cn("text-13 font-bold", state.tone === "g" ? "text-[#0b7a4c]" : "text-[#c0392b]")}>
          {state.text}
        </span>
      ) : (
        <p className="text-13 font-bold text-[#111827] dark:text-white">—</p>
      )}
    </div>
  );
}

function EmptyText({ children }) {
  return <p className="text-13 text-gray-400 dark:text-white/50">{children}</p>;
}

function IssueRow({ row, expanded, onToggle }) {
  const { details, isLoading } = useSeoCrawlIssueDetails(row.id, { enabled: expanded });
  const extraDetails =
    details?.details && typeof details.details === "object" && Object.keys(details.details).length
      ? details.details
      : null;

  return (
    <>
      <tr className="cursor-pointer" onClick={onToggle}>
        <td>{decodeUriText(row.problem_ar || row.problem || row.problem_en)}</td>
        <td>{row.type}</td>
        <td>
          <SeverityBadge severity={row.severity} />
        </td>
        <td>
          <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={4}>
            {isLoading ? (
              <p className="text-13 text-gray-400 dark:text-white/50 py-2">جارٍ التحميل...</p>
            ) : extraDetails ? (
              <div className="rounded-lg border border-[#EEF1F0] dark:border-white/[0.08] divide-y divide-[#EEF1F0] dark:divide-white/[0.08] my-2">
                {Object.entries(extraDetails).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-12 text-gray-400 dark:text-white/45">{key}</span>
                    <span className="text-13 font-medium text-[#111827] dark:text-white break-all">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : decodeUriText(String(value))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-13 text-gray-400 dark:text-white/50 py-2">
                لا توجد تفاصيل إضافية لهذه المشكلة.
              </p>
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}

export default function WebsiteDetailsWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = searchParams.get("page") || "";
  const issueId = searchParams.get("issueId");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [expandedId, setExpandedId] = useState(null);

  const { details: seedDetails, isLoading: seedLoading } = useSeoCrawlIssueDetails(issueId, {
    enabled: Boolean(issueId),
  });

  const {
    items: issues,
    pagination,
    isLoading: issuesLoading,
    error: issuesError,
    refetch: refetchIssues,
  } = useSeoCrawlIssues({
    search: pagePath,
    page,
    perPage,
    enabled: Boolean(pagePath),
  });

  const pageMeta = seedDetails?.page_details;
  const loadTimeSec =
    pageMeta?.load_time_ms != null ? `${(pageMeta.load_time_ms / 1000).toFixed(2)} ث` : null;

  const goBack = () => router.push("/home/marketing-and-content?tab=seo");

  return (
    <div
      className="mkt-page flex flex-col min-h-screen -m-[45px] p-[45px] max-[1700px]:-m-[30px] max-[1700px]:p-[30px] bg-[#F4F6F5] dark:bg-[#0B1411]"
      dir="rtl"
    >
      <div className="radm-head">
        <button type="button" className="mkt-back" onClick={goBack}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 6-6 6 6 6" />
          </svg>
          رجوع
        </button>

        <div className="radm-ttl min-w-0">
          <b className="truncate block" dir="ltr" style={{ textAlign: "right" }}>
            {decodeUriText(pagePath) || "تفاصيل الصفحة"}
          </b>
          <small>مشاكل السيو المكتشفة لهذه الصفحة</small>
        </div>

        {pageMeta?.url ? (
          <div className="radm-kpis">
            <a
              href={pageMeta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mk-mini inline-flex items-center gap-1.5"
            >
              <ExternalLink className="size-3.5" />
              فتح الصفحة
            </a>
          </div>
        ) : null}
      </div>

      <div className="mkt-body">
        <SectionCard title="بيانات الصفحة" className="mt-[14px]">
          {seedLoading ? (
            <EmptyText>جارٍ التحميل...</EmptyText>
          ) : pageMeta ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="رمز الاستجابة (HTTP)" value={pageMeta.status_code} />
                <Field label="زمن التحميل" value={loadTimeSec} />
                <Field label="نوع المحتوى" value={pageMeta.content_type} dir="ltr" />
                <Field label="عنوان الصفحة" value={pageMeta.title} />
                <Field label="عدد H1" value={pageMeta.h1_count} />
                <Field label="عدد الصور" value={pageMeta.image_count} />
                <Field label="صور بدون نص بديل" value={pageMeta.images_missing_alt} />
                <Field label="روابط داخلية صادرة" value={pageMeta.outbound_internal_links} />
                <Field label="روابط داخلية واردة" value={pageMeta.inbound_internal_links} />
                <BoolField label="قابلة للفهرسة" value={pageMeta.is_indexable} />
                <BoolField label="صفحة سليمة" value={pageMeta.is_healthy} />
              </div>
              {pageMeta.meta_description ? (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 dark:text-white/45 mb-1">وصف الميتا</p>
                  <p className="text-13 text-[#374151] dark:text-white/75">{pageMeta.meta_description}</p>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyText>لا توجد بيانات صفحة مخزنة متاحة.</EmptyText>
          )}
        </SectionCard>

        <SectionCard title="قائمة المشاكل" className="mt-[14px]">
          {!pagePath ? (
            <EmptyText>لم يتم تحديد صفحة لعرض مشاكلها.</EmptyText>
          ) : issuesError ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-13 text-red-600 dark:text-red-300">
                {issuesError?.response?.data?.message || "تعذر تحميل قائمة المشاكل."}
              </p>
              <button
                type="button"
                className="mk-mini inline-flex items-center gap-1.5"
                onClick={() => refetchIssues()}
              >
                <RotateCw className="size-3.5" />
                إعادة المحاولة
              </button>
            </div>
          ) : issuesLoading && issues.length === 0 ? (
            <EmptyText>جارٍ التحميل...</EmptyText>
          ) : issues.length === 0 ? (
            <EmptyText>لا توجد مشاكل مسجلة لهذه الصفحة.</EmptyText>
          ) : (
            <>
              <div className="tblwrap">
                <table className="mkt-tbl">
                  <thead>
                    <tr>
                      <th>المشكلة</th>
                      <th>النوع</th>
                      <th>الخطورة</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((row) => (
                      <IssueRow
                        key={row.id}
                        row={row}
                        expanded={expandedId === row.id}
                        onToggle={() => setExpandedId((cur) => (cur === row.id ? null : row.id))}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <AllOrdersPagination
                  pagination={pagination}
                  currentPage={page}
                  onPageChange={setPage}
                  perPage={perPage}
                  onPerPageChange={(n) => {
                    setPerPage(n);
                    setPage(1);
                  }}
                  unitLabel="مشكلة"
                />
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
