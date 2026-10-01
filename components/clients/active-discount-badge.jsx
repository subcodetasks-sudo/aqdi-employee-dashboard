"use client";

import { Ban, Loader2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDiscountValue } from "@/src/hooks/use-client-discount";

export default function ActiveDiscountBadge({ activeCoupon, onDeactivate, isDeactivating }) {
  if (!activeCoupon) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold",
          "bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-white/50"
        )}
      >
        <Ban className="size-3.5 shrink-0" />
        لا خصم فعال
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold",
          "bg-green-100 text-green-700 dark:bg-emerald-500/20 dark:text-emerald-300"
        )}
      >
        <Tag className="size-3.5 shrink-0" />
        خصم فعال — {formatDiscountValue(activeCoupon)}
      </span>
      <button
        type="button"
        onClick={() => onDeactivate(activeCoupon.id)}
        disabled={isDeactivating}
        className={cn(
          "inline-flex items-center gap-1 h-8 px-3 rounded-full border text-xs font-bold transition-colors disabled:opacity-50",
          "border-red-200 bg-white text-red-600 hover:bg-red-50",
          "dark:border-rose-400/30 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
        )}
      >
        {isDeactivating ? <Loader2 className="size-3.5 animate-spin" /> : null}
        إلغاء الخصم
      </button>
    </div>
  );
}
