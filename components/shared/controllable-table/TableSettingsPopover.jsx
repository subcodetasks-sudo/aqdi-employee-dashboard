"use client";

import { Settings2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TABLE_DENSITIES } from "./density";

/**
 * Gear popover: table density + column visibility toggles.
 * Follows global html.dark via Tailwind dark: classes.
 */
export default function TableSettingsPopover({
  columns = [],
  density,
  onDensityChange,
  visibleColumns = {},
  onToggleColumn,
  triggerClassName,
  align = "start",
  TriggerIcon = Settings2,
}) {
  const hideableColumns = columns.filter((col) => col.hideable !== false);
  const Icon = TriggerIcon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="إعدادات الجدول"
          title="إعدادات الجدول"
          className={cn(
            "size-[40px] rounded-xl border flex items-center justify-center transition-all shrink-0",
            "border-surface-border-soft bg-white text-[#4B5563] hover:border-brand-dark/35 hover:text-brand-dark",
            "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75 dark:hover:bg-white/[0.08]",
            triggerClassName
          )}
        >
          <Icon className="size-[17px]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={8}
        dir="rtl"
        className={cn(
          "w-[268px] rounded-2xl border p-0 shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
          "border-[#E8E8E8] bg-white text-[#212121]",
          "dark:border-white/10 dark:bg-card dark:text-white"
        )}
      >
        <div className="p-4 space-y-2.5">
          <p className="text-[12.5px] font-bold text-right text-status-neutral dark:text-white/55">
            كثافة الجدول
          </p>
          <div className="flex rounded-lg border overflow-hidden border-[#E5E7EB] dark:border-white/12">
            {TABLE_DENSITIES.map((option) => {
              const selected = density === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onDensityChange?.(option.id)}
                  className={cn(
                    "flex-1 py-[7px] text-xs font-bold transition-colors",
                    selected
                      ? "bg-brand-dark text-white"
                      : "bg-white text-gray-700 hover:bg-[#F9FAFB] dark:bg-transparent dark:text-white/75 dark:hover:bg-white/5"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-4 border-t border-surface-border dark:border-white/10" />

        <div className="p-4 space-y-2.5">
          <p className="text-[12.5px] font-bold text-right text-status-neutral dark:text-white/55">
            الأعمدة الظاهرة
          </p>
          <ul className="space-y-2.5">
            {hideableColumns.map((col) => {
              const checked = visibleColumns?.[col.id] !== false;
              return (
                <li key={col.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`col-vis-${col.id}`}
                    checked={checked}
                    onCheckedChange={() => onToggleColumn?.(col.id)}
                    className={cn(
                      "size-[16px] rounded-[3px] shadow-none",
                      "border-[#C4C4C4] data-[state=checked]:bg-[#1890FF] data-[state=checked]:border-[#1890FF] data-[state=checked]:text-white"
                    )}
                  />
                  <label
                    htmlFor={`col-vis-${col.id}`}
                    className="text-13 font-medium cursor-pointer select-none flex-1 text-right text-gray-900 dark:text-white/90"
                  >
                    {col.label}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
