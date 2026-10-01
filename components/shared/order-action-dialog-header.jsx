"use client";

import { X } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function OrderActionDialogHeader({
  icon: Icon,
  iconClassName,
  iconStyle,
  title,
  onClose,
  className,
}) {
  return (
    <DialogHeader className={cn("mb-6 space-y-0", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F0] dark:border-white/10 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          {Icon ? (
            <span
              className={cn(
                "w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0",
                iconClassName
              )}
              style={iconStyle}
            >
              <Icon className="size-[18px]" />
            </span>
          ) : null}
          <DialogTitle className="text-lg font-bold text-black dark:text-white text-right truncate">
            {title}
          </DialogTitle>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-ink-placeholder transition-colors hover:bg-[#FFEBEB] hover:text-[#E24444] dark:bg-white/10 dark:hover:bg-red-500/15"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>
      </div>
    </DialogHeader>
  );
}
