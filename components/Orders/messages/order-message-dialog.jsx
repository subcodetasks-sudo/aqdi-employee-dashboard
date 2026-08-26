"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function OrderMessageDialog({ open, onOpenChange, messageAlert }) {
  const title =
    messageAlert?.section?.name_ar ||
    messageAlert?.section?.name_en ||
    "رسالة توضيحية";
  const body = messageAlert?.message || "";

  const handleCopy = async () => {
    if (!body.trim()) {
      toast.error("لا يوجد نص للنسخ");
      return;
    }
    try {
      await navigator.clipboard.writeText(body);
      toast.success("تم نسخ الرسالة");
    } catch {
      toast.error("تعذر نسخ الرسالة");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeButton={false}
        dir="rtl"
        className="sm:max-w-[560px] p-8 sm:p-10 rounded-[28px] border-0 shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-neutral-500 hover:text-black transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="إغلاق"
          >
            ✕
          </button>
          <h2 className="text-22 font-bold text-black">{title}</h2>
        </div>

        <div className="bg-neutral-100 rounded-20 p-5 sm:p-6 mb-8 max-h-[min(60vh,420px)] overflow-y-auto">
          <p className="text-sm leading-[1.9] text-[#1A1A1A] whitespace-pre-wrap text-right">
            <span className="ml-1.5" aria-hidden>
              ✅
            </span>
            {body || "—"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="mx-auto flex items-center justify-center gap-2 h-12 min-w-[140px] px-8 rounded-14 bg-[#1D4ED8] text-white text-15 font-bold hover:bg-[#1e40af] transition-colors shadow-[0_8px_20px_rgba(29,78,216,0.35)]"
        >
          <Copy className="size-4 shrink-0" strokeWidth={2.5} />
          نسخ
        </button>
      </DialogContent>
    </Dialog>
  );
}
