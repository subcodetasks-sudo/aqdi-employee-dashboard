"use client";

export default function GroupedBarChart({ items, height = 220 }) {
  const peak = Math.max(...items.flatMap((item) => [item.spend, item.revenue]), 1);
  const barMax = height - 28;

  return (
    <div>
      <div className="flex items-end justify-between gap-4 sm:gap-6" style={{ height }}>
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="flex items-end gap-1.5" style={{ height: barMax }}>
              <div
                className="w-4 sm:w-6 rounded-t-sm bg-[#A7C7BE] transition-all duration-500"
                style={{ height: Math.max((item.spend / peak) * barMax, 4) }}
                title={`الصرف: ${item.spend.toLocaleString("en-US")}`}
              />
              <div
                className="w-4 sm:w-6 rounded-t-sm bg-brand-dark transition-all duration-500"
                style={{ height: Math.max((item.revenue / peak) * barMax, 4) }}
                title={`الإيراد: ${item.revenue.toLocaleString("en-US")}`}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-5 mt-4 pt-3 border-t border-[#F0F2F1]">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
          <span className="size-2.5 rounded-sm bg-brand-dark" />
          الإيراد
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
          <span className="size-2.5 rounded-sm bg-[#A7C7BE]" />
          الصرف
        </span>
      </div>
    </div>
  );
}
