"use client";

import { cn } from "@/lib/utils";

export default function ReportSectionCard({ title, children, className, action }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E6EBE9] bg-white p-5 flex flex-col gap-4 min-w-0",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <h3 className="text-[14px] font-bold text-[#111827]">{title}</h3>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function ReportLineList({ items }) {
  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <div key={item.label}>
          {item.separator && index > 0 && <div className="border-t border-[#E6EBE9] my-2" />}
          <div className="flex items-center justify-between gap-4 py-1.5">
            <span
              className={cn(
                "text-[13px]",
                item.bold ? "font-bold" : "font-medium",
                item.tone === "green" && "text-[#15803D]",
                item.tone === "red" && "text-[#DC2626]",
                item.tone === "gold" && "text-[#B45309]",
                !item.tone && "text-[#374151]"
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                "text-[13px] tabular-nums shrink-0",
                item.bold ? "font-bold" : "font-semibold",
                item.tone === "green" && "text-[#15803D]",
                item.tone === "red" && "text-[#DC2626]",
                item.tone === "gold" && "text-[#B45309]",
                !item.tone && "text-[#111827]"
              )}
            >
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
