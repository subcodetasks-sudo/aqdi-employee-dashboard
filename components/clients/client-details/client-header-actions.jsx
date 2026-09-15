"use client";

import { Ban, Loader2, ShieldCheck, Tag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientHeaderActions({
  client,
  isBlocking,
  isDeleting,
  onBlock,
  onDelete,
  onDiscount,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBlock}
          disabled={isBlocking}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-bold transition-colors disabled:opacity-50",
            client.blocked
              ? "border-emerald-200 bg-white text-brand-dark hover:bg-emerald-50 dark:border-emerald-400/30 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-500/10"
              : "border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-rose-400/30 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
          )}
        >
          {isBlocking ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin" />
          ) : client.blocked ? (
            <ShieldCheck className="size-3.5 shrink-0" />
          ) : (
            <Ban className="size-3.5 shrink-0" />
          )}
          {client.blocked ? "إلغاء حظر العميل" : "حظر العميل"}
        </button>
        <button
          type="button"
          onClick={onDiscount}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-bold transition-colors",
            "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F9FAFB]",
            "dark:border-white/15 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/[0.04]"
          )}
        >
          <Tag className="size-3.5 shrink-0" />
          خصم/إعفاء مخصص
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-bold transition-colors disabled:opacity-50",
            "border-red-200 bg-white text-red-600 hover:bg-red-50",
            "dark:border-rose-400/30 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
          )}
        >
          {isDeleting ? <Loader2 className="size-3.5 shrink-0 animate-spin" /> : <Trash2 className="size-3.5 shrink-0" />}
          حذف العميل
        </button>
      </div>
    </div>
  );
}
