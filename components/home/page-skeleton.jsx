import { cn } from "@/lib/utils";

/**
 * Inline content-area skeleton. Must stay relative (never fixed/fullscreen)
 * so the home sidebar and utility panel remain visible while a page loads.
 */
export default function PageSkeleton({ className, rows = 8 }) {
  return (
    <div
      className={cn("flex w-full flex-col gap-4", className)}
      aria-busy="true"
      aria-label="جاري التحميل"
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-44 rounded-lg bg-[#E3E8E6] dark:bg-white/10 animate-pulse" />
          <div className="h-3.5 w-64 max-w-full rounded-md bg-[#E8EEEC] dark:bg-white/[0.06] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-lg bg-[#E3E8E6] dark:bg-white/10 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-[#E3E8E6] dark:bg-white/10 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="h-10 min-w-[12rem] flex-1 rounded-xl bg-[#E3E8E6] dark:bg-white/10 animate-pulse" />
        <div className="h-10 w-28 rounded-xl bg-[#E3E8E6] dark:bg-white/10 animate-pulse" />
        <div className="h-10 w-28 rounded-xl bg-[#E3E8E6] dark:bg-white/10 animate-pulse" />
      </div>

      <div
        className={cn(
          "rounded-2xl border p-4 flex flex-col gap-3",
          "bg-white border-[#E8EEEC]",
          "dark:bg-[#13241C] dark:border-white/[0.08]"
        )}
      >
        <div className="flex gap-3 pb-2 border-b border-[#EEF1F0] dark:border-white/[0.06]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`skel-head-${index}`}
              className="h-3.5 flex-1 rounded-md bg-[#F0F2F1] dark:bg-white/[0.06] animate-pulse"
            />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`skel-row-${index}`}
            className="h-12 rounded-xl bg-[#F4F6F5] dark:bg-white/[0.05] animate-pulse"
            style={{ opacity: 1 - index * 0.06 }}
          />
        ))}
      </div>
    </div>
  );
}
