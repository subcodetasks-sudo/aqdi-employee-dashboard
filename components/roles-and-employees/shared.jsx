"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const ROLE_BADGE_COLORS = [
  { bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]" },
  { bg: "bg-[#D1FAE5]", text: "text-[#047857]" },
  { bg: "bg-[#CFFAFE]", text: "text-[#0E7490]" },
  { bg: "bg-[#FEF3C7]", text: "text-[#B45309]" },
  { bg: "bg-[#EDE9FE]", text: "text-[#6D28D9]" },
  { bg: "bg-[#FCE7F3]", text: "text-[#BE185D]" },
];

export function getRoleBadgeColor(index = 0) {
  return ROLE_BADGE_COLORS[index % ROLE_BADGE_COLORS.length];
}

export function getInitials(name) {
  if (!name) return "?";
  const trimmed = String(name).trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed[0].toUpperCase();
}

export function RoleBadge({ role, colorIndex = 0, className }) {
  const colors = getRoleBadgeColor(colorIndex);
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap",
        colors.bg,
        colors.text,
        className
      )}
    >
      {role || "غير محدد"}
    </span>
  );
}

export function EmployeeAvatar({ name, image, size = "sm" }) {
  const sizeClass = size === "sm" ? "size-8 text-[12px]" : "size-10 text-[14px]";

  if (image) {
    const px = size === "sm" ? 32 : 40;
    return (
      <div className={cn("rounded-full overflow-hidden border border-[#E4E4E4] shrink-0", sizeClass)}>
        <Image
          src={image}
          alt={name || ""}
          width={px}
          height={px}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[#D1FAE5] text-[#047857] font-bold flex items-center justify-center shrink-0",
        sizeClass
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export function OutlineActionButton({ children, variant = "default", className, ...props }) {
  const variants = {
    default:
      "border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]",
    view: "border-[#D1D5DB] text-[#0B5345] hover:bg-[#E8F5F1]",
    edit: "border-[#93C5FD] text-[#2563EB] hover:bg-[#EFF6FF]",
    delete: "border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2]",
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center h-8 px-3 rounded-lg border bg-white text-[12px] font-semibold transition-colors whitespace-nowrap",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const TABLE_TH =
  "text-right px-4 py-3.5 text-[12px] font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap bg-[#F0F7F4]";

export const TABLE_WRAPPER =
  "w-full overflow-x-auto bg-white rounded-2xl border border-[#E5E7EB] shadow-sm";

export function formatSalary(value) {
  if (value == null || value === "") return null;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return null;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatDateShort(dateString) {
  if (!dateString) return "---";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  } catch {
    return dateString;
  }
}

export function TablePagination({ pagination, currentPage, setCurrentPage }) {
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
    <div className="flex items-center justify-center gap-2.5 mt-6" dir="rtl">
      <button
        type="button"
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ChevronRight className="size-4" />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="text-[#A3A3A3] px-1">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => setCurrentPage(page)}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium transition-all",
              currentPage === page
                ? "bg-brand-main text-white shadow-lg shadow-brand-main/20"
                : "border border-[#E4E4E4] text-[#A3A3A3] hover:bg-[#f5f5f5]"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => setCurrentPage((prev) => Math.min(last_page, prev + 1))}
        disabled={currentPage === last_page}
        className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="size-4" />
      </button>
    </div>
  );
}
