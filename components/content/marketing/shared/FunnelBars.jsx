"use client";

export default function FunnelBars({ steps }) {
  const peak = Math.max(...steps.map((step) => step.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((step, index) => {
        const width = Math.max((step.value / peak) * 100, 4);
        return (
          <div key={step.label} className="flex items-center gap-3">
            {index > 0 ? (
              <span className="text-[11px] font-extrabold text-[#c0392b] w-11 shrink-0 text-left tabular-nums">
                {step.dropPct}
              </span>
            ) : (
              <span className="w-11 shrink-0" />
            )}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="flex-1 h-[30px] bg-[#eef2f0] rounded-[8px] overflow-hidden dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-[8px] bg-[#0E5F4E] transition-all duration-500 flex items-center px-3"
                  style={{ width: `${width}%` }}
                >
                  <span className="text-[11.5px] font-extrabold text-white tabular-nums whitespace-nowrap">
                    {step.value.toLocaleString("en-US")}
                  </span>
                </div>
              </div>
              <span className="text-[13px] font-bold text-[#2c3a34] shrink-0 min-w-[72px] text-right dark:text-white/75">
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
