"use client";

export default function FunnelBars({ steps }) {
  const peak = Math.max(...steps.map((step) => step.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((step, index) => {
        const width = Math.max((step.value / peak) * 100, 6);
        return (
          <div key={step.label} className="flex items-center gap-3">
            {index > 0 ? (
              <span className="text-11 font-bold text-red-600 w-12 shrink-0 text-left tabular-nums">
                {step.dropPct}
              </span>
            ) : (
              <span className="w-12 shrink-0" />
            )}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="flex-1 h-8 bg-status-neutral-bg rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md bg-brand-dark transition-all duration-500 flex items-center px-3"
                  style={{ width: `${width}%` }}
                >
                  <span className="text-xs font-bold text-white tabular-nums whitespace-nowrap">
                    {step.value.toLocaleString("en-US")}
                  </span>
                </div>
              </div>
              <span className="text-13 text-gray-700 shrink-0 min-w-[70px] text-right">
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
