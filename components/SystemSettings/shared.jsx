"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, PanelLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";

export const SETTINGS_ADD_TRIGGER_CLASS =
  "h-10 px-4 rounded-xl border border-[#E6EBE9] bg-white text-[13px] font-bold text-[#111827] hover:border-[#054D44]/40 hover:text-[#054D44] shadow-sm inline-flex items-center gap-1.5 transition-colors";

export const SETTINGS_EDIT_TRIGGER_CLASS =
  "h-8 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-[12px] font-bold text-[#059669] hover:bg-[#ECFDF5] shadow-none inline-flex items-center justify-center transition-colors";

export const SETTINGS_DELETE_TRIGGER_CLASS =
  "h-8 px-3.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[12px] font-bold text-[#DC2626] hover:bg-[#FEE2E2] shadow-none inline-flex items-center justify-center transition-colors";

export const SETTINGS_VIEW_TRIGGER_CLASS =
  "h-8 px-3.5 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] text-[12px] font-bold text-[#374151] hover:bg-[#E5E7EB] shadow-none inline-flex items-center justify-center transition-colors";

export function SettingsListHeader({
  title,
  subtitle = "قائمة بالقيم",
  action,
  backHref = "/home/settings",
}) {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
          aria-expanded={isSidebarOpen}
          className={cn(
            "inline-flex items-center justify-center size-[42px] rounded-full border shrink-0 transition-colors",
            "border-[#E4EBE8] bg-white text-[#4B5563] hover:bg-[#E8F5F1] hover:text-[#054D44]",
            "dark:border-white/10 dark:bg-[#0F1C16] dark:text-white/70 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
          )}
        >
          <PanelLeft className="size-[18px]" />
        </button>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280] hover:text-[#054D44] transition-colors mb-1.5"
          >
            <ChevronLeft className="size-4" />
            رجوع
          </button>
          <h1 className="text-[24px] font-bold text-[#111827] dark:text-white leading-tight">
            {title}
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#9CA3AF]">{subtitle}</p>
        </div>
      </div>

      {action}
    </div>
  );
}

export function SettingsAddTrigger({ children = "إضافة", className, ...props }) {
  return (
    <button
      type="button"
      className={cn(SETTINGS_ADD_TRIGGER_CLASS, className)}
      {...props}
    >
      <Plus className="size-4" />
      {children}
    </button>
  );
}

export function StatusBadge({ active }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold whitespace-nowrap",
        active
          ? "bg-[#E6F7EF] text-[#15803D]"
          : "bg-[#F3F4F6] text-[#6B7280]"
      )}
    >
      {active ? "مفعل" : "غير مفعل"}
    </span>
  );
}

export function SectionHeading({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[16px] font-bold text-[#054D44]">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] font-medium text-[#9CA3AF]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SettingsTable({ headers, children, minWidth = "860px" }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E6EBE9] bg-white shadow-[0_4px_12px_rgba(11,83,69,0.04)] dark:bg-[#13241C] dark:border-white/10">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr className="bg-[#F4F6F5] dark:bg-white/[0.04]">
            {headers.map((header) => {
              const label = typeof header === "string" ? header : header.label;
              const className = typeof header === "string" ? "" : header.className;
              return (
                <th
                  key={label}
                  className={cn(
                    "whitespace-nowrap px-5 py-3.5 text-right text-[13px] font-bold text-[#4B5563] dark:text-white/55",
                    className
                  )}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function SettingsTableRow({ children }) {
  return (
    <tr className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFBFA] dark:border-white/[0.06] dark:hover:bg-white/[0.03] transition-colors">
      {children}
    </tr>
  );
}

export function SettingsTd({ children, className, ...props }) {
  return (
    <td
      className={cn(
        "px-5 py-3.5 text-[13px] font-medium text-[#111827] dark:text-white align-middle",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function SettingsContentCard({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E6EBE9] bg-white p-6 shadow-[0_4px_12px_rgba(11,83,69,0.04)]",
        "dark:bg-[#13241C] dark:border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SettingsEmptyRow({ colSpan, message = "لا توجد بيانات" }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-16 text-center text-[13px] font-medium text-[#9CA3AF]"
      >
        {message}
      </td>
    </tr>
  );
}

export function SettingsPagination({ page, lastPage, onPageChange }) {
  if (!lastPage || lastPage <= 1) return null;

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

  return (
    <div className="flex items-center justify-center gap-2" dir="rtl">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="size-9 rounded-full border border-[#E6EBE9] bg-white text-[#6B7280] hover:bg-[#F4F6F5] disabled:opacity-40"
      >
        <ChevronLeft className="size-4 mx-auto" />
      </button>
      {pages.map((item, idx) =>
        item === "..." ? (
          <span key={`dots-${idx}`} className="px-1 text-[#9CA3AF]">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={cn(
              "size-9 rounded-full text-[13px] font-bold transition-colors",
              page === item
                ? "bg-[#054D44] text-white"
                : "border border-[#E6EBE9] bg-white text-[#6B7280] hover:bg-[#F4F6F5]"
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
        className="size-9 rounded-full border border-[#E6EBE9] bg-white text-[#6B7280] hover:bg-[#F4F6F5] disabled:opacity-40"
      >
        <ChevronRight className="size-4 mx-auto" />
      </button>
    </div>
  );
}

export function OutlineButton({ tone = "brand", children, className, ...props }) {
  const tones = {
    brand:
      "border-[#054D44]/30 text-[#054D44] hover:bg-[#E8F5F1]",
    danger:
      "border-[#FECACA] text-[#DC2626] hover:bg-[#FFF0F0]",
  };

  return (
    <button
      type="button"
      className={cn(
        "h-8 px-3 rounded-lg border text-[12px] font-bold transition-colors whitespace-nowrap",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "h-10 px-5 rounded-xl bg-[#054D44] text-white text-[13px] font-bold hover:bg-[#043F38] transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostAddButton({ children, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "h-9 px-4 rounded-xl border border-[#E6EBE9] bg-white text-[13px] font-bold text-[#111827] hover:border-[#054D44]/40 hover:text-[#054D44] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E6EBE9] disabled:hover:text-[#111827]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
