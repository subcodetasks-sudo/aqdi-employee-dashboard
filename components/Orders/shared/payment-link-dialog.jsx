"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function DetailRow({ label, value, dir }) {
  if (value == null || value === "") return null;

  return (
    <div className="space-y-1.5 text-right">
      <p className="text-[12px] font-bold text-[#007C13]/70">{label}</p>
      <p
        className="break-all rounded-xl bg-white/80 px-3 py-2.5 text-[13px] font-medium leading-relaxed text-[#007C13]"
        dir={dir}
      >
        {value}
      </p>
    </div>
  );
}

export default function PaymentLinkDialog({
  open,
  onOpenChange,
  paymentUrl,
  cartAmount,
  notes,
}) {
  const amountText =
    cartAmount != null && cartAmount !== "" ? String(cartAmount) : "";
  const notesText = notes?.trim() || "";

  const buildCopyPayload = () => {
    const lines = [];
    if (paymentUrl) lines.push(`رابط الدفع: ${paymentUrl}`);
    if (amountText) lines.push(`المبلغ: ${amountText} ر.س`);
    if (notesText) lines.push(`الملاحظات: ${notesText}`);
    return lines.join("\n");
  };

  const handleCopyAll = async () => {
    const payload = buildCopyPayload();
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    toast.success("تم نسخ رابط الدفع والمبلغ والملاحظات");
  };

  const handleOpen = () => {
    if (!paymentUrl) return;
    window.open(paymentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] rounded-[28px] border border-[#B8E6C1] bg-[#E6FFE6] p-6 sm:p-8"
        dir="rtl"
        closeButton={false}
      >
        <div className="flex w-full flex-col items-center text-center">
          <div className="mb-4 flex size-[60px] items-center justify-center rounded-full bg-[#10B981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]">
            <Check className="size-7 stroke-[3]" />
          </div>

          <h2 className="mb-2 text-[18px] font-bold leading-snug text-[#007C13]">
            تم إنشاء رابط الدفع بنجاح
          </h2>

          <p className="mb-5 text-[13px] text-[#007C13]/80">
            يمكنك نسخ الرابط والمبلغ والملاحظات بزر واحد، أو فتح صفحة الدفع
          </p>

          <div className="mb-6 w-full space-y-3 rounded-2xl border border-[#B8E6C1] bg-white/50 p-4">
            <DetailRow label="رابط الدفع" value={paymentUrl} dir="ltr" />
            <DetailRow
              label="المبلغ"
              value={amountText ? `${amountText} ر.س` : null}
            />
            <DetailRow label="الملاحظات" value={notesText || null} />
          </div>

          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-black text-[14px] font-bold text-white transition-colors hover:bg-neutral-800"
            >
              <Copy className="size-4" />
              نسخ الكل
            </button>
            <button
              type="button"
              onClick={handleOpen}
              className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-[#10B981] bg-white text-[14px] font-bold text-[#007C13] transition-colors hover:bg-[#10B981]/10"
            >
              <ExternalLink className="size-4" />
              فتح
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
