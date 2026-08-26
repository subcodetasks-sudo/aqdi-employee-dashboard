"use client";

import { cn } from "@/lib/utils";

export default function NewRequestStatCard({
  value,
  total,
  label,
  hint,
  barColor,
  valueColor,
  dark,
}) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col gap-2.5 min-w-0",
        dark
          ? "bg-card border-white/[0.08]"
          : "bg-white border-[#E8EEEC] shadow-[0_1px_3px_rgba(11,83,69,0.05)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-right min-w-0">
          <p
            className={cn(
              "text-13 font-bold",
              dark ? "text-white/70" : "text-gray-700"
            )}
          >
            {label}
          </p>
        </div>
        <span
          className="text-[30px] font-black leading-none tabular-nums shrink-0"
          style={{ color: valueColor }}
        >
          {value}
        </span>
      </div>

      <div
        className={cn(
          "h-[6px] rounded-full overflow-hidden",
          dark ? "bg-white/10" : "bg-[#F0F2F1]"
        )}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, percent))}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      <p
        className={cn(
          "text-11 font-medium",
          dark ? "text-white/40" : "text-gray-400"
        )}
      >
        {hint}
      </p>
    </div>
  );
}
