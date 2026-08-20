"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateOrder } from "@/src/hooks/use-update-order";

const METHODS = [
  { value: "electronic", label: "إلكتروني" },
  { value: "paper", label: "ورقي" },
  { value: "other", label: "أخرى" },
];

export default function PropertyUpdateDialog({
  open,
  onOpenChange,
  orderData,
  queryKey,
}) {
  const [method, setMethod] = useState("");
  const [deedNumber, setDeedNumber] = useState("");

  useEffect(() => {
    if (!open) return;
    setMethod("");
    setDeedNumber(orderData?.instrument_number ?? orderData?.deed_number ?? "");
  }, [open, orderData]);

  const { mutate: submit, isPending } = useUpdateOrder({
    queryKey,
    successMessage: "تم رفع تحديث العقار بنجاح",
    onSuccess: () => onOpenChange(false),
  });

  const canSubmit = Boolean(method) && deedNumber.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || isPending) return;
    submit({
      orderId: orderData?.id,
      body: {
        deed_addition_method: method,
        deed_number: deedNumber.trim(),
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
          <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F0] pb-4">
            <span className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              <Upload className="size-[18px]" />
            </span>
            <DialogTitle className="text-[18px] font-bold text-black text-right">
              رفع تحديث بيانات العقار
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-black text-right">
              الرجاء تحديد طريقة الإضافة
              <span className="text-[#FF4D4F] mr-1">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((option) => {
                const active = method === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMethod(option.value)}
                    disabled={isPending}
                    className={`h-[64px] rounded-[16px] border flex flex-col items-center justify-center gap-1.5 text-[13px] font-bold transition-all ${
                      active
                        ? "border-[#2563EB] bg-[#EFF4FF] text-[#2563EB]"
                        : "border-[#EEEEEE] bg-[#F9F9F9] text-[#4D4D4D] hover:border-[#D0D5DD]"
                    }`}
                  >
                    <span
                      className={`size-4 rounded-full border-2 flex items-center justify-center ${
                        active ? "border-[#2563EB]" : "border-[#D0D5DD]"
                      }`}
                    >
                      {active ? <span className="size-2 rounded-full bg-[#2563EB]" /> : null}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-black text-right">
              الرجاء إدخال رقم الصك
              <span className="text-[#FF4D4F] mr-1">*</span>
            </label>
            <input
              type="text"
              value={deedNumber}
              onChange={(e) => setDeedNumber(e.target.value)}
              placeholder="رقم الصك"
              disabled={isPending}
              className="w-full h-[52px] bg-white border border-[#EEEEEE] rounded-[16px] px-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="flex-1 h-[52px] bg-[#2563EB] text-white rounded-[16px] font-bold text-[15px] hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "تأكيد رفع العقار ✓"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="h-[52px] px-6 rounded-[16px] border border-[#EEEEEE] text-[#4D4D4D] font-bold text-[15px] hover:bg-[#F5F5F5] transition-all"
            >
              تراجع
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
