"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100];

export default function AllOrdersPagination({
  pagination,
  currentPage,
  onPageChange,
  perPage,
  onPerPageChange,
  dark,
}) {
  const total = pagination?.total ?? 0;
  const lastPage = Math.max(1, pagination?.last_page ?? 1);
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const btnClass = (active) =>
    cn(
      "size-9 rounded-full flex items-center justify-center text-[13px] font-medium transition-all",
      active
        ? "bg-[#0B5345] text-white"
        : dark
          ? "border border-white/10 text-white/55 hover:bg-white/10"
          : "border border-[#E4E4E4] text-[#A3A3A3] hover:bg-[#f5f5f5]"
    );

  return (
    <div
      className="flex items-center justify-between gap-3 flex-wrap mt-1"
      dir="rtl"
    >
      <p
        className={cn(
          "text-[13px] font-medium",
          dark ? "text-white/45" : "text-[#6B7280]"
        )}
      >
        عرض{" "}
        <span className="tabular-nums font-bold text-[#0B5345] dark:text-[#6EE7B7]">
          {from}-{to}
        </span>{" "}
        من{" "}
        <span className="tabular-nums font-bold">{total}</span> طلب
      </p>

      <div className="flex items-center gap-3">
        <label
          className={cn(
            "flex items-center gap-2 text-[12.5px] font-bold",
            dark ? "text-white/55" : "text-[#6B7280]"
          )}
        >
          صفوف/صفحة
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className={cn(
              "h-9 rounded-full border px-3 text-[13px] font-bold bg-transparent",
              dark
                ? "border-white/10 text-white"
                : "border-[#E4E4E4] text-[#111827]"
            )}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={btnClass(false)}
            aria-label="السابق"
          >
            <ChevronRight className="size-4" />
          </button>
          <span
            className={cn(
              "min-w-[52px] text-center text-[13px] font-bold tabular-nums",
              dark ? "text-white/80" : "text-[#111827]"
            )}
          >
            {currentPage} / {lastPage}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
            disabled={currentPage >= lastPage}
            className={btnClass(false)}
            aria-label="التالي"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
