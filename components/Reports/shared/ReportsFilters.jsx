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
              "h-9 px-4 rounded-full text-[13px] font-bold transition-all",
              period === option.id
                ? "bg-[#0B5345] text-white"
                : "bg-white text-[#424242] border border-[#EEEEEE] hover:bg-[#F9FAFB]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={contractType} onValueChange={onContractTypeChange}>
          <SelectTrigger className="h-9 w-[160px] rounded-lg border-[#E6EBE9] text-[13px] font-semibold bg-white">
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
          <SelectTrigger className="h-9 w-[160px] rounded-lg border-[#E6EBE9] text-[13px] font-semibold bg-white">
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
