"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OrdersPagination({ pagination, currentPage, onPageChange }) {
  if (!pagination || pagination.last_page <= 1) return null;

  const pages = [];
  const { last_page } = pagination;
  const range = 1;
  const start = Math.max(1, currentPage - range);
  const end = Math.min(last_page, currentPage + range);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < last_page) {
    if (end < last_page - 1) pages.push("...");
    pages.push(last_page);
  }

  return (
    <div className="flex items-center justify-center gap-2.5 mt-4" dir="rtl">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-ink-placeholder hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink-placeholder"
      >
        <ChevronRight className="size-4" />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="text-ink-placeholder px-1">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-13 font-medium transition-all ${
              currentPage === page
                ? "bg-brand-main text-white shadow-lg shadow-brand-main/20"
                : "border border-neutral-200 text-ink-placeholder hover:bg-neutral-100"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(pagination.last_page, currentPage + 1))}
        disabled={currentPage === pagination.last_page}
        className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-ink-placeholder hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink-placeholder"
      >
        <ChevronLeft className="size-4" />
      </button>
    </div>
  );
}
