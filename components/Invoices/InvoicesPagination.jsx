"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pageList(page, lastPage) {
  const pages = [];
  const range = 1;
  const start = Math.max(1, page - range);
  const end = Math.min(lastPage, page + range);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < lastPage) {
    if (end < lastPage - 1) pages.push("...");
    pages.push(lastPage);
  }

  return pages;
}

const NAV_BUTTON =
  "inline-flex size-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] transition-colors hover:bg-status-neutral-bg hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#4B5563] dark:border-white/10 dark:bg-card dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-emerald-300 dark:disabled:hover:bg-card dark:disabled:hover:text-white/70";

export default function InvoicesPagination({
  page,
  pageSize,
  total,
  onPageChange,
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const pages = pageList(page, lastPage);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
      <p className="text-xs font-medium text-gray-400 dark:text-white/45 whitespace-nowrap">
        عرض <span className="font-bold text-gray-700 dark:text-white/70">{from}–{to}</span> من{" "}
        <span className="font-bold text-gray-700 dark:text-white/70">{total}</span>
      </p>

      {lastPage > 1 && (
        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="الصفحة السابقة"
            className={NAV_BUTTON}
          >
            <ChevronLeft className="size-4" />
          </button>

          {pages.map((item, idx) =>
            item === "..." ? (
              <span
                key={`dots-${idx}`}
                className="px-1.5 text-13 text-gray-400 dark:text-white/35"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={page === item ? "page" : undefined}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-lg text-13 font-bold tabular-nums transition-colors",
                  page === item
                    ? "bg-brand-dark text-white"
                    : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-status-neutral-bg dark:border-white/10 dark:bg-card dark:text-white/70 dark:hover:bg-white/[0.06]"
                )}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(lastPage, page + 1))}
            disabled={page === lastPage}
            aria-label="الصفحة التالية"
            className={NAV_BUTTON}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
