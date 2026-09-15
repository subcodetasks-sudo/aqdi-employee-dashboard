"use client";

import { useMemo } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  buildWhatsAppUrl,
  composeSendErrorMessage,
  getOrderPhoneForContext,
  getSendErrorTitle,
  getWhatsAppRecipientLabel,
} from "./order-send-error-utils";

function WhatsAppIcon({ className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 0 0 .914.914l4.458-1.495A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.358-.213-2.642.886.886-2.575-.233-.375A9.818 9.818 0 1 1 12 21.818z" />
    </svg>
  );
}

export default function OrderSectionErrorDialog({
  open,
  onOpenChange,
  orderData,
  context,
}) {
  const messageText = useMemo(
    () => composeSendErrorMessage(orderData, context),
    [orderData, context]
  );
  const phone = getOrderPhoneForContext(orderData, context);
  const title = getSendErrorTitle(context);
  const recipientLabel = getWhatsAppRecipientLabel(context);

  const copyMessage = async () => {
    if (!messageText.trim()) {
      toast.error("لا يوجد نص للنسخ");
      return;
    }
    try {
      await navigator.clipboard.writeText(messageText);
      toast.success("تم نسخ الرسالة");
    } catch {
      toast.error("تعذر نسخ الرسالة");
    }
  };

  const copyPhone = async () => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(String(phone));
      toast.success("تم نسخ رقم الجوال");
    } catch {
      toast.error("تعذر نسخ الرقم");
    }
  };

  const openWhatsApp = () => {
    if (!phone) {
      toast.error(
        context === "agent"
          ? "لا يوجد رقم جوال للوكيل"
          : "لا يوجد رقم جوال للعميل"
      );
      return false;
    }
    const url = buildWhatsAppUrl(phone, messageText);
    if (!url) {
      toast.error("رقم الجوال غير صالح");
      return false;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  };

  const handleConfirm = () => {
    if (!messageText.trim()) {
      toast.error("لا يوجد نص للرسالة");
      return;
    }
    if (openWhatsApp()) {
      onOpenChange(false);
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
          <h2 className="text-[20px] font-bold text-black text-right">{title}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-neutral-500 hover:text-black transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <div className="bg-neutral-100 rounded-20 p-5 sm:p-6 mb-6 max-h-[min(50vh,360px)] overflow-y-auto">
          <p className="text-sm leading-[1.9] text-[#1A1A1A] whitespace-pre-wrap text-right">
            {messageText || "—"}
          </p>
        </div>

        {phone ? (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-[#F3F3F3] px-4 py-2.5">
              <button
                type="button"
                onClick={() => {
                  if (openWhatsApp()) onOpenChange(false);
                }}
                className="text-[#25D366] hover:opacity-80 transition-opacity"
                aria-label={`إرسال واتساب لـ${recipientLabel}`}
              >
                <WhatsAppIcon className="size-[22px]" />
              </button>
              <button
                type="button"
                onClick={copyPhone}
                className="text-neutral-500 hover:text-black transition-colors"
                aria-label="نسخ رقم الجوال"
              >
                <Copy className="size-4" />
              </button>
              <span className="text-15 font-semibold text-[#1A1A1A]" dir="ltr">
                {phone}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-13 text-[#E24444] mb-6">
            {context === "agent"
              ? "لا يوجد رقم جوال مسجل للوكيل"
              : "لا يوجد رقم جوال مسجل للعميل"}
          </p>
        )}

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!phone || !messageText.trim()}
            className="flex items-center justify-center gap-2 h-12 min-w-[140px] px-8 rounded-14 bg-[#1D4ED8] text-white text-15 font-bold hover:bg-[#1e40af] transition-colors shadow-[0_8px_20px_rgba(29,78,216,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <WhatsAppIcon className="size-[18px] shrink-0" />
            موافق
          </button>
          <button
            type="button"
            onClick={copyMessage}
            className="flex items-center justify-center gap-2 text-sm font-semibold text-neutral-500 hover:text-black transition-colors"
          >
            <Copy className="size-4 shrink-0" />
            نسخ الرسالة
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
