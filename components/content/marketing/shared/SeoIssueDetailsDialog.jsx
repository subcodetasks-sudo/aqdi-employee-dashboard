"use client";

import { ExternalLink, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { useSeoCrawlIssueDetails } from "@/src/hooks/use-seo-crawl";
import { SeverityBadge } from "./Badges";

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
        <span
          className={cn(
            "text-13 font-bold",
            state.tone === "g" ? "text-[#0b7a4c]" : "text-[#c0392b]"
          )}
        >
          {state.text}
        </span>
      ) : (
        <p className="text-13 font-bold text-[#111827] dark:text-white">—</p>
      )}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-white/10" />
      <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-white/10" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function errorMessage(error) {
  const status = error?.response?.status;
  if (status === 404) return "لم يتم العثور على هذه المشكلة.";
  if (status === 403) return "ليس لديك صلاحية لعرض تفاصيل هذه المشكلة.";
  return error?.response?.data?.message || "تعذر تحميل تفاصيل المشكلة.";
}

export default function SeoIssueDetailsDialog({ issueId, open, onOpenChange }) {
  const { details, isLoading, error, refetch } = useSeoCrawlIssueDetails(issueId, {
    enabled: open,
  });

  const page = details?.page_details;
  const loadTimeSec =
    page?.load_time_ms != null ? `${(page.load_time_ms / 1000).toFixed(2)} ث` : null;
  const extraDetails =
    details?.details && typeof details.details === "object" && Object.keys(details.details).length
      ? details.details
      : null;

  return (
    <Dialog dir="rtl" open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 border-b pb-4 dark:border-white/10">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#111827] dark:text-white truncate">
                {details?.problem_ar || details?.problem || "تفاصيل المشكلة"}
              </h2>
              {details?.problem_en ? (
                <p className="text-xs text-gray-400 dark:text-white/45 mt-1">{details.problem_en}</p>
              ) : null}
            </div>
            {details?.severity ? <SeverityBadge severity={details.severity} className="shrink-0" /> : null}
          </div>
        </DialogHeader>

        {isLoading ? (
          <DetailsSkeleton />
        ) : error ? (
          <div className="flex items-center justify-between gap-3 flex-wrap py-4">
            <p className="text-13 text-red-600 dark:text-red-300">{errorMessage(error)}</p>
            <button
              type="button"
              className="mk-mini inline-flex items-center gap-1.5"
              onClick={() => refetch()}
            >
              <RotateCw className="size-3.5" />
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-xs text-gray-400 dark:text-white/45 mb-1">مسار الصفحة</p>
                <p
                  className="text-13 font-bold text-[#111827] dark:text-white break-all"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                >
                  {details?.page || "—"}
                </p>
              </div>
              {page?.url ? (
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mk-mini inline-flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink className="size-3.5" />
                  فتح الصفحة
                </a>
              ) : null}
            </div>

            {page ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="رمز الاستجابة (HTTP)" value={page.status_code} />
                <Field label="زمن التحميل" value={loadTimeSec} />
                <Field label="نوع المحتوى" value={page.content_type} dir="ltr" />
                <Field label="عنوان الصفحة" value={page.title} />
                <Field label="عدد H1" value={page.h1_count} />
                <Field label="عدد الصور" value={page.image_count} />
                <Field label="صور بدون نص بديل" value={page.images_missing_alt} />
                <Field label="روابط داخلية صادرة" value={page.outbound_internal_links} />
                <Field label="روابط داخلية واردة" value={page.inbound_internal_links} />
                <BoolField label="قابلة للفهرسة" value={page.is_indexable} />
                <BoolField label="صفحة سليمة" value={page.is_healthy} />
              </div>
            ) : (
              <p className="text-13 text-gray-400 dark:text-white/50">
                لا توجد بيانات صفحة مخزنة مرتبطة بهذه المشكلة.
              </p>
            )}

            {page ? (
              <div>
                <p className="text-xs text-gray-400 dark:text-white/45 mb-1">وصف الميتا</p>
                <p className="text-13 text-[#374151] dark:text-white/75">
                  {page.meta_description || "—"}
                </p>
              </div>
            ) : null}

            {extraDetails ? (
              <div>
                <p className="text-xs text-gray-400 dark:text-white/45 mb-2">تفاصيل إضافية</p>
                <div className="rounded-lg border border-[#EEF1F0] dark:border-white/[0.08] divide-y divide-[#EEF1F0] dark:divide-white/[0.08]">
                  {Object.entries(extraDetails).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="text-12 text-gray-400 dark:text-white/45">{key}</span>
                      <span className="text-13 font-medium text-[#111827] dark:text-white break-all">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
