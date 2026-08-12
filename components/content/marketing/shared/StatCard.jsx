"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({ value, label, trend, tone, className }) {
  const trendUp = trend?.direction === "up";
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E6EBE9] bg-white px-4 py-3.5 flex flex-col gap-1.5 min-w-0",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "text-[19px] font-bold leading-tight truncate",
            tone === "green" && "text-[#15803D]",
            tone === "red" && "text-[#DC2626]",
            tone === "amber" && "text-[#B45309]",
            !tone && "text-[#111827]"
          )}
        >
          {value}
        </span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-bold rounded-full px-1.5 py-0.5 shrink-0",
              trendUp ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"
            )}
          >
            {trendUp ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="text-[12px] text-[#9CA3AF] leading-snug truncate">{label}</p>
    </div>
  );
}

export function StatCardRow({ items, className }) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", className)}>
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
