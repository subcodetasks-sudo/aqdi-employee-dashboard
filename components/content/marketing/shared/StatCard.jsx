"use client";

import { cn } from "@/lib/utils";

export default function StatCard({ value, label, trend, tone, className }) {
  const toneClass = tone === "green" ? "g" : tone === "red" ? "r" : tone === "amber" ? "y" : tone || "";
  const trendUp = trend?.direction === "up";

  return (
    <div className={cn("ckpi", toneClass, className)}>
      <div className="ckpi-v">{value}</div>
      <div className="ckpi-l">{label}</div>
      {trend ? (
        <div className={cn("ckpi-sub", !trendUp && "down")}>
          {trendUp ? "▲" : "▼"} {trend.value}
        </div>
      ) : null}
    </div>
  );
}

export function StatCardRow({ items, className }) {
  return (
    <div className={cn("cust-kcards", className)}>
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
