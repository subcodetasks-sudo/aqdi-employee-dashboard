"use client";

import { cn } from "@/lib/utils";

function formatDisplay(value, suffix) {
  const formatted = typeof value === "number" ? value.toLocaleString("en-US") : value;
  return suffix ? `${formatted} ${suffix}` : formatted;
}

export default function HorizontalBarChart({
  items,
  className,
  showValue = true,
  valuePosition = "start",
  maxValue,
}) {
  const peak = maxValue ?? Math.max(...items.map((item) => Number(item.value) || 0), 1);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => {
        const val = Number(item.value) || 0;
        const width = peak > 0 ? Math.max((val / peak) * 100, val > 0 ? 4 : 0) : 0;

        return (
          <div key={item.label} className="flex items-center gap-3 min-w-0">
            {showValue && valuePosition === "start" && (
              <span className="text-13 font-semibold text-gray-900 w-14 shrink-0 text-left tabular-nums dark:text-white">
                {formatDisplay(item.value, item.suffix)}
              </span>
            )}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div className="flex-1 h-7 bg-status-neutral-bg rounded-md overflow-hidden dark:bg-white/10">
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{ width: `${width}%`, backgroundColor: item.color ?? "#0B5345" }}
                />
              </div>
              <span className="text-13 text-gray-700 shrink-0 min-w-[80px] text-right truncate dark:text-white/70">
                {item.label}
              </span>
            </div>
            {showValue && valuePosition === "end" && (
              <span className="text-13 font-semibold text-gray-900 w-20 shrink-0 text-left tabular-nums dark:text-white">
                {formatDisplay(item.value, item.suffix)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function VerticalBarChart({ items, className, height = 160 }) {
  const peak = Math.max(...items.map((item) => Number(item.value) || 0), 1);

  return (
    <div className={cn("flex items-end justify-between gap-2", className)} style={{ height }}>
      {items.map((item) => {
        const val = Number(item.value) || 0;
        const barHeight = peak > 0 ? Math.max((val / peak) * (height - 24), val > 0 ? 8 : 0) : 0;

        return (
          <div key={item.date ?? item.label} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div
              className="w-full max-w-[40px] rounded-t-md bg-[#0D9488] transition-all duration-500"
              style={{ height: barHeight }}
              title={`${item.date ?? item.label}: ${val.toLocaleString("en-US")}`}
            />
            <span className="text-10 text-gray-400 truncate w-full text-center dark:text-white/50">
              {item.date ?? item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
