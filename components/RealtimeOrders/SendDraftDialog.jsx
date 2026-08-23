"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateOrder } from "@/src/hooks/use-update-order";

export default function SendDraftDialog({
  open,
  onOpenChange,
  orderData,
  queryKey,
}) {
  const [draftNumber, setDraftNumber] = useState("");
  const [contactMode, setContactMode] = useState("same");
  const [otherNumber, setOtherNumber] = useState("");

  const registeredMobile =
    orderData?.user?.mobile ??
    orderData?.step3?.tenant_mobile ??
    orderData?.tenant_mobile ??
    "";

  useEffect(() => {
    if (!open) return;
    setDraftNumber("");
    setContactMode("same");
    setOtherNumber("");
  }, [open]);

  const { mutate: submit, isPending } = useUpdateOrder({
    queryKey,
    successMessage: "تم إرسال المسودة للعميل",
    onSuccess: () => onOpenChange(false),
  });

  const canSubmit =
    draftNumber.trim().length > 0 &&
    (contactMode === "same" || otherNumber.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit || isPending) return;
    submit({
      orderId: orderData?.id,
      body: {
        ejar_contract_draft_number: draftNumber.trim(),
        draft_contact_number_mode: contactMode,
        draft_contact_number:
          contactMode === "same" ? registeredMobile || null : otherNumber.trim(),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px] p-8 rounded-[32px] border-0 gap-0"
        dir="rtl"
        closeButton={false}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute left-6 top-6 w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#A3A3A3] hover:bg-[#FFEBEB] hover:text-[#E24444] transition-all z-10"
          aria-label="إغلاق"
        >
          <i className="fa-solid fa-xmark text-[14px]" />
        </button>

        <DialogHeader className="mb-6 space-y-0">
          <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4 pl-12">
            <span className="w-10 h-10 rounded-full bg-[#B45309] text-white flex items-center justify-center shrink-0">
              <Send className="size-[18px]" />
            </span>
            <DialogTitle className="text-[18px] font-bold text-black text-right">
              إرسال مسودة العقد للعميل
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-black text-right">
              رقم مسودة العقد في إيجار
              <span className="text-[#FF4D4F] mr-1">*</span>
            </label>
            <input
              type="text"
              value={draftNumber}
              onChange={(e) => setDraftNumber(e.target.value)}
              placeholder="أدخل رقم المسودة (10 أرقام)"
              disabled={isPending}
              className="w-full h-[52px] bg-white border border-[#EEEEEE] rounded-[16px] px-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-black text-right">
              على أي رقم تواصل معكم العميل لإرسال المسودة؟
            </label>

            <button
              type="button"
              onClick={() => setContactMode("same")}
              disabled={isPending}
              className={`w-full rounded-[16px] border px-4 py-3 flex items-center gap-3 text-right transition-all ${
                contactMode === "same"
                  ? "border-brand-hover bg-brand-hover/5"
                  : "border-[#EEEEEE] bg-[#F9F9F9]"
              }`}
            >
              <span
                className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  contactMode === "same" ? "border-brand-hover" : "border-[#D0D5DD]"
                }`}
              >
                {contactMode === "same" ? (
                  <span className="size-2 rounded-full bg-brand-hover" />
                ) : null}
              </span>
              <span className="text-[13.5px] font-bold text-black">
                نفس رقم الطلب المسجل {registeredMobile ? `(${registeredMobile})` : ""}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setContactMode("other")}
              disabled={isPending}
              className={`w-full rounded-[16px] border px-4 py-3 flex items-center gap-3 text-right transition-all ${
                contactMode === "other"
                  ? "border-brand-hover bg-brand-hover/5"
                  : "border-[#EEEEEE] bg-[#F9F9F9]"
              }`}
            >
              <span
                className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  contactMode === "other" ? "border-brand-hover" : "border-[#D0D5DD]"
                }`}
              >
                {contactMode === "other" ? (
                  <span className="size-2 rounded-full bg-brand-hover" />
                ) : null}
              </span>
              <span className="text-[13.5px] font-bold text-black">تواصل معنا برقم آخر</span>
            </button>

            {contactMode === "other" ? (
              <input
                type="text"
                value={otherNumber}
                onChange={(e) => setOtherNumber(e.target.value)}
                placeholder="أدخل رقم التواصل الفعلي"
                disabled={isPending}
                dir="ltr"
                className="w-full h-[52px] bg-white border border-[#EEEEEE] rounded-[16px] px-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
              />
            ) : (
              <p className="text-[11.5px] text-[#A3A3A3] leading-relaxed px-1">
                بعض العملاء يتواصلون برقم مختلف عن رقم الطلب – سجل الرقم الفعلي الذي راسلكم منه ليُقيَّد في السجل.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="flex-1 h-[52px] bg-[#B45309] text-white rounded-[16px] font-bold text-[15px] hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Send className="size-4" />
                  إرسال المسودة
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="h-[52px] px-6 rounded-[16px] border border-[#EEEEEE] text-[#4D4D4D] font-bold text-[15px] hover:bg-[#F5F5F5] transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
