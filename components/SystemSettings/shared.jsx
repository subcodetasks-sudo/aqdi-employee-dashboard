"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import "./settings-design.css";

export const SETTINGS_ADD_TRIGGER_CLASS = "xbtn";

export const SETTINGS_EDIT_TRIGGER_CLASS = "mk-mini";

export const SETTINGS_DELETE_TRIGGER_CLASS = "mk-mini hr-del";

export const SETTINGS_VIEW_TRIGGER_CLASS = "mk-mini";

export function SettingsPageShell({ children, className }) {
  return (
    <div
      className={cn(
        "set-page flex flex-col gap-4 min-h-full -m-[45px] p-[45px] max-[1700px]:-m-[30px] max-[1700px]:p-[30px] bg-[#F4F6F5] dark:bg-[#0B1411]",
        className
      )}
      dir="rtl"
    >
      {children}
    </div>
  );
}

export function SettingsListHeader({
  title,
  subtitle = "قائمة بالقيم",
  action,
  backHref = "/home/settings",
}) {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  return (
    <div className="radm-head">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
        aria-expanded={isSidebarOpen}
        className={cn(
          "inline-flex items-center justify-center size-[42px] rounded-2xl border shrink-0 transition-colors",
          "border-[#E4EBE8] bg-white text-[#4B5563] hover:bg-[#E8F5F1] hover:text-brand-dark",
          "dark:border-white/10 dark:bg-[#0F1C16] dark:text-white/70 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
        )}
      >
        <PanelLeft className="size-[18px]" />
      </button>

      <button type="button" className="mkt-back" onClick={() => router.push(backHref)}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
        رجوع
      </button>

      <div className="radm-ttl">
        <b>{title}</b>
        {subtitle ? <small>{subtitle}</small> : null}
      </div>

      <div className="radm-kpis">{action}</div>
    </div>
  );
}

export function SettingsAddTrigger({ children = "+ إضافة", className, ...props }) {
  const label = children === "إضافة" ? "+ إضافة" : children;
  return (
    <button type="button" className={cn(SETTINGS_ADD_TRIGGER_CLASS, className)} {...props}>
      {label}
    </button>
  );
}

export function StatusBadge({ active }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap",
        active ? "bg-[#dcf5e8] text-[#0B7A4C] dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-[#eef0ef] text-[#6b7c76] dark:bg-white/10 dark:text-white/50"
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
        <div className="cpf-sec-t" style={{ marginBottom: description ? 4 : 0 }}>
          {title}
        </div>
        {description ? (
          <p className="text-[12px] font-medium text-[#8a978f] dark:text-white/45">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SettingsTable({ headers, children, minWidth = "640px" }) {
  return (
    <div className="cpf-sec" style={{ padding: 0, overflow: "hidden" }}>
      <div className="tblwrap" style={{ border: 0, borderRadius: 16, boxShadow: "none" }}>
        <table className="mkt-tbl" style={{ minWidth }}>
          <thead>
            <tr>
              {headers.map((header) => {
                const label = typeof header === "string" ? header : header.label;
                const className = typeof header === "string" ? "" : header.className;
                return (
                  <th key={label} className={className}>
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function SettingsTableRow({ children }) {
  return <tr>{children}</tr>;
}

export function SettingsTd({ children, className, ...props }) {
  return (
    <td className={cn(className)} {...props}>
      {children}
    </td>
  );
}

export function SettingsContentCard({ children, className }) {
  return <div className={cn("cpf-sec", className)}>{children}</div>;
}

export function SettingsEmptyRow({ colSpan, message = "لا عناصر بعد — أضف عنصرًا." }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-center text-xs font-bold py-7 px-4 text-[#98A39E] dark:text-white/45"
      >
        {message}
      </td>
    </tr>
  );
}

export function SettingsLoadingRows({ colSpan = 3, rows = 6 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <tr key={`settings-skel-${rowIndex}`}>
      {Array.from({ length: colSpan }).map((__, colIndex) => (
        <td key={`settings-skel-${rowIndex}-${colIndex}`}>
          <div
            className="h-3.5 rounded-md bg-[#EEF1F0] dark:bg-white/[0.06] animate-pulse"
            style={{
              width: `${50 + ((rowIndex + colIndex) % 5) * 8}%`,
              opacity: 1 - rowIndex * 0.08,
              marginInline: colIndex === 0 ? 0 : "auto",
            }}
          />
        </td>
      ))}
    </tr>
  ));
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
        className="mk-mini disabled:opacity-40"
      >
        <ChevronLeft className="size-3.5" />
      </button>
      {pages.map((item, idx) =>
        item === "..." ? (
          <span key={`dots-${idx}`} className="px-1 text-[#8a978f]">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={cn(page === item ? "xbtn" : "mk-mini")}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(lastPage, page + 1))}
        disabled={page === lastPage}
        className="mk-mini disabled:opacity-40"
      >
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

export function OutlineButton({ tone = "brand", children, className, ...props }) {
  const tones = {
    brand: "mk-mini",
    danger: "mk-mini hr-del",
  };

  return (
    <button type="button" className={cn(tones[tone], className)} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButton({ children, className, ...props }) {
  return (
    <button type="button" className={cn("xbtn", className)} {...props}>
      {children}
    </button>
  );
}

export function GhostAddButton({ children, className, ...props }) {
  return (
    <button type="button" className={cn("mk-mini", className)} {...props}>
      {children}
    </button>
  );
}

export function SettingsActions({ children }) {
  return <span className="hr-acts">{children}</span>;
}
