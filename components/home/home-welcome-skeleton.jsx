import { cn } from "@/lib/utils";

function Bone({ className, style }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#E3E8E6] dark:bg-white/10",
        className
      )}
      style={style}
    />
  );
}

/**
 * Skeleton shaped like the /home welcome dashboard (hero + KPIs + panels).
 * Content-area only — never covers the sidebar.
 */
export default function HomeWelcomeSkeleton({ className }) {
  return (
    <div
      className={cn("flex flex-col gap-5", className)}
      aria-busy="true"
      aria-label="جاري التحميل"
      role="status"
    >
      <Bone className="h-10 w-48 rounded-xl" />

      <section className="overflow-hidden rounded-[28px] border border-[#E8EEEC] bg-white dark:border-white/[0.08] dark:bg-[#0F1C16]">
        <div className="grid gap-10 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div className="flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <Bone className="size-9 rounded-xl" />
              <Bone className="h-3.5 w-36" />
            </div>
            <Bone className="h-9 w-full max-w-md" />
            <Bone className="h-9 w-[85%] max-w-sm" />
            <div className="mt-2 flex flex-col gap-2 ps-5">
              <Bone className="h-3.5 w-full max-w-xl" />
              <Bone className="h-3.5 w-[92%] max-w-lg" />
              <Bone className="h-3.5 w-[70%] max-w-md" />
            </div>
          </div>

          <aside className="rounded-3xl border border-[#E8EEEC] bg-[#F7FAF9]/80 p-7 dark:border-white/[0.08] dark:bg-[#0B1411]/70">
            <div className="mb-7 flex items-start gap-4">
              <Bone className="size-[72px] rounded-full" />
              <div className="flex flex-1 flex-col gap-2 pt-2">
                <Bone className="h-3 w-20" />
                <Bone className="h-6 w-44" />
                <Bone className="h-3.5 w-28" />
              </div>
            </div>
            <div className="mb-7 grid grid-cols-2 gap-3">
              <Bone className="h-[72px] rounded-2xl" />
              <Bone className="h-[72px] rounded-2xl" />
            </div>
            <Bone className="h-14 w-full rounded-2xl" />
          </aside>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`home-kpi-${index}`}
            className="rounded-2xl border border-[#E8EEEC] bg-white px-4 py-3.5 dark:border-white/[0.06] dark:bg-[#0F1C16]"
          >
            <div className="mb-3 flex items-center justify-between">
              <Bone className="h-3 w-16" />
              <Bone className="size-7 rounded-lg" />
            </div>
            <Bone className="h-6 w-14" />
          </div>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-[24px] border border-[#E8EEEC] bg-white p-5 dark:border-white/[0.08] dark:bg-[#0F1C16] sm:p-6">
          <Bone className="mb-4 h-5 w-32" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Bone
                key={`home-action-${index}`}
                className="h-[96px] rounded-2xl"
                style={{ opacity: 1 - index * 0.05 }}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#E8EEEC] bg-white p-5 dark:border-white/[0.08] dark:bg-[#0F1C16] sm:p-6">
          <Bone className="mb-4 h-5 w-28" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`home-activity-${index}`}
                className="flex items-start gap-3 rounded-2xl px-3 py-3"
              >
                <Bone className="size-9 shrink-0 rounded-xl" />
                <div className="flex flex-1 flex-col gap-2">
                  <Bone className="h-3.5 w-[70%]" />
                  <Bone className="h-3 w-[45%]" />
                </div>
                <Bone className="h-3 w-12 shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
