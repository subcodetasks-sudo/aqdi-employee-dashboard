"use client";

import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RT } from "./theme";

export const CONTRACT_TYPE_OPTIONS = [
  { id: "housing", label: "سكني", value: "housing" },
  { id: "commercial", label: "تجاري", value: "commercial" },
];

function Chip({ active, onClick, children, color }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-full text-[12px] font-bold border transition-all",
        active
          ? "text-white border-transparent"
          : "border-[#E6EBE9] bg-[#F5F8F7] text-[#374151] hover:border-[#0B5345]/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75 dark:hover:bg-white/[0.08]"
      )}
      style={active ? { backgroundColor: color || RT.brand } : undefined}
    >
      {children}
    </button>
  );
}

export default function MoreFiltersPopover({
  statuses = [],
  extraStatusId,
  onExtraStatusChange,
  contractType,
  onContractTypeChange,
  triggerClassName,
  dark = false,
}) {
  const hasActive = extraStatusId != null || Boolean(contractType);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="فلترة إضافية"
          title="فلترة إضافية"
          className={cn(
            triggerClassName,
            hasActive && "!bg-[#0B5345] !text-white !border-[#0B5345]"
          )}
        >
          <Filter className="size-[17px]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        dir="rtl"
        className={cn(
          "w-[300px] rounded-2xl border p-0 shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
          "border-[#E8E8E8] bg-white text-[#212121]",
          "dark:border-white/10 dark:bg-[#13241C] dark:text-white"
        )}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-black">فلاتر إضافية</p>
            {hasActive ? (
              <button
                type="button"
                onClick={() => {
                  onExtraStatusChange?.(null);
                  onContractTypeChange?.(null);
                }}
                className="text-[11.5px] font-bold text-[#0B5345] dark:text-[#6EE7B7]"
              >
                مسح
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-bold text-[#6B7280] dark:text-white/55">
              نوع العقد
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CONTRACT_TYPE_OPTIONS.map((option) => (
                <Chip
                  key={option.id}
                  active={contractType === option.value}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onContractTypeChange?.(
                      contractType === option.value ? null : option.value
                    );
                  }}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-bold text-[#6B7280] dark:text-white/55">
              حالات أخرى
            </p>
            {statuses.length === 0 ? (
              <p className="text-[12px] text-[#9CA3AF] dark:text-white/40">
                لا توجد حالات إضافية
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto">
                {statuses.map((status) => {
                  const active = String(extraStatusId) === String(status.id);
                  return (
                    <Chip
                      key={status.id}
                      active={active}
                      color={status.color}
                      onClick={() =>
                        onExtraStatusChange?.(active ? null : status.id)
                      }
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: active
                              ? "#fff"
                              : status.color || RT.brand,
                          }}
                        />
                        {status.name}
                      </span>
                    </Chip>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
