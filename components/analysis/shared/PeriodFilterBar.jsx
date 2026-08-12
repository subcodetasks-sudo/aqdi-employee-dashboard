"use client";

import { PERIOD_OPTIONS } from "./usePeriodFilter";

export default function PeriodFilterBar({ period, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`h-9 px-4 rounded-full text-[13px] font-bold transition-all ${
            period === option.id
              ? "bg-brand-main text-white"
              : "bg-white text-ink-body border border-surface-border hover:bg-surface-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
