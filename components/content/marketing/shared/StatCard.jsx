"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({ value, label, trend, tone, className }) {
  const trendUp = trend?.direction === "up";
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-border-soft bg-white px-4 py-3.5 flex flex-col gap-1.5 min-w-0",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "text-[19px] font-bold leading-tight truncate",
            tone === "green" && "text-green-700",
            tone === "red" && "text-red-600",
            tone === "amber" && "text-[#B45309]",
            !tone && "text-gray-900"
          )}
        >
          {value}
        </span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-11 font-bold rounded-full px-1.5 py-0.5 shrink-0",
              trendUp ? "bg-[#DCFCE7] text-green-700" : "bg-[#FEE2E2] text-red-600"
            )}
          >
            {trendUp ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-gray-400 leading-snug truncate">{label}</p>
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
