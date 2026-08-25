"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CONTRACT_TYPES,
  EMPLOYEE_FILTERS,
  PERIOD_FILTERS,
} from "../mock-data";

export default function ReportsFilters({
  period,
  onPeriodChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  contractType,
  onContractTypeChange,
  employee,
  onEmployeeChange,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {PERIOD_FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onPeriodChange(option.id)}
            className={cn(
              "h-9 px-4 rounded-full text-13 font-bold transition-all",
              period === option.id
                ? "bg-brand-dark text-white"
                : "bg-white text-[#424242] border border-surface-border hover:bg-[#F9FAFB] dark:bg-card dark:text-white/70 dark:border-white/10 dark:hover:bg-white/5"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {period === "custom" && (
          <>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#616161] dark:text-white/60">
              من
              <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} className="h-9 rounded-lg border border-surface-border-soft bg-white px-2 text-xs dark:bg-card dark:border-white/10 dark:text-white/80" />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#616161] dark:text-white/60">
              إلى
              <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => onDateToChange(event.target.value)} className="h-9 rounded-lg border border-surface-border-soft bg-white px-2 text-xs dark:bg-card dark:border-white/10 dark:text-white/80" />
            </label>
          </>
        )}
        <Select value={contractType} onValueChange={onContractTypeChange}>
          <SelectTrigger className="h-9 w-[160px] rounded-lg border-surface-border-soft text-13 font-semibold bg-white dark:bg-card dark:border-white/10 dark:text-white/80">
            <SelectValue placeholder="نوع العقد" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {CONTRACT_TYPES.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={employee} onValueChange={onEmployeeChange}>
          <SelectTrigger className="h-9 w-[160px] rounded-lg border-surface-border-soft text-13 font-semibold bg-white dark:bg-card dark:border-white/10 dark:text-white/80">
            <SelectValue placeholder="الموظف" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {EMPLOYEE_FILTERS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
