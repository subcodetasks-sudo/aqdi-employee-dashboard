"use client";

import { cn } from "@/lib/utils";
import { DISCOUNT_TYPES } from "@/src/lib/client-discount";

const OPTIONS = [
  { value: DISCOUNT_TYPES.PERCENTAGE, label: "نسبة %" },
  { value: DISCOUNT_TYPES.FIXED, label: "مبلغ ثابت (ر.س)" },
];

export default function DiscountTypeToggle({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="نوع الخصم"
      className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 dark:border-white/15 dark:bg-transparent"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-8 flex-1 rounded-full px-3 text-xs font-bold whitespace-nowrap transition-colors",
              active
                ? "bg-brand-dark text-white dark:bg-emerald-500 dark:text-brand-ink"
                : "text-gray-500 hover:bg-gray-50 dark:text-white/60 dark:hover:bg-white/[0.06]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
