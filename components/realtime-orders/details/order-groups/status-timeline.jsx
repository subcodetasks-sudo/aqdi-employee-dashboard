"use client";

import { History } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTimelineDate(value) {
  if (!value) return null;
  try {
    return new Date(value)
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", " -");
  } catch {
    return value;
  }
}

export default function StatusTimeline({ timeline = [] }) {
  if (!timeline.length) return null;

  return (
    <section
      className="rounded-2xl border border-dashed border-[#D7E3DE] dark:border-white/10 bg-white dark:bg-[#0F1C16] p-4 sm:p-5"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="size-8 rounded-xl bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center shrink-0">
          <History className="size-4" />
        </span>
        <h3 className="text-13 font-black text-brand-dark dark:text-[#6EE7B7]">
          مسار الحالة
        </h3>
      </div>

      <ol className="relative space-y-0 pe-1">
        {timeline.map((entry, index) => {
          const isLast = index === timeline.length - 1;
          const isCurrent = entry.state === "current";
          return (
            <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast ? (
                <span className="absolute top-3 end-[11px] w-px h-[calc(100%-4px)] bg-[#E5E7EB] dark:bg-white/10" />
              ) : null}
              <span
                className={cn(
                  "relative z-[1] size-6 rounded-full border-2 shrink-0 mt-0.5",
                  isCurrent
                    ? "border-transparent ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0F1C16]"
                    : "border-white dark:border-[#0F1C16]"
                )}
                style={{
                  backgroundColor: entry.color || "#9CA3AF",
                  ...(isCurrent ? { boxShadow: `0 0 0 2px ${entry.color || "#9CA3AF"}` } : null),
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: entry.color || "#6B7280" }}
                  >
                    {entry.label}
                  </span>
                  {isCurrent ? (
                    <span className="text-[10.5px] font-bold text-[#6D28D9]">الحالية</span>
                  ) : null}
                  {entry.created_at ? (
                    <span className="text-[10.5px] font-medium text-gray-400 tabular-nums">
                      {formatTimelineDate(entry.created_at)}
                    </span>
                  ) : null}
                </div>
                {entry.description ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-white/55 font-medium">
                    {entry.description}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
