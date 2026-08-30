"use client";

import { useCallback, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import OrderActionDialogHeader from "@/components/shared/OrderActionDialogHeader";
import { useUpdateOrder } from "@/src/hooks/use-update-order";
import { useDialogFormSession } from "@/src/hooks/use-dialog-form-session";

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

  const resetForm = useCallback(() => {
    setMethod("");
    setDeedNumber(orderData?.instrument_number ?? orderData?.deed_number ?? "");
  }, [orderData]);

  const session = useDialogFormSession(open, resetForm);

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

  const handleClose = () => {
    if (isPending) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent
        key={session}
        className="sm:max-w-[520px] p-8 rounded-32 border-0 gap-0"
        dir="rtl"
        closeButton={false}
      >
        <OrderActionDialogHeader
          icon={Upload}
          iconClassName="bg-[#2563EB]"
          title="رفع تحديث بيانات العقار"
          onClose={handleClose}
        />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-13 font-bold text-black text-right">
              الرجاء تحديد طريقة الإضافة
              <span className="text-status-danger mr-1">*</span>
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
                    className={`h-[64px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-13 font-bold transition-all ${
                      active
                        ? "border-[#2563EB] bg-[#EFF4FF] text-[#2563EB]"
                        : "border-surface-border bg-surface-input text-ink-subtle hover:border-[#D0D5DD]"
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
            <label className="text-13 font-bold text-black text-right">
              الرجاء إدخال رقم الصك
              <span className="text-status-danger mr-1">*</span>
            </label>
            <input
              type="text"
              value={deedNumber}
              onChange={(e) => setDeedNumber(e.target.value)}
              placeholder="رقم الصك"
              disabled={isPending}
              className="w-full h-13 bg-white border border-surface-border rounded-2xl px-4 text-sm focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="flex-1 h-13 bg-[#2563EB] text-white rounded-2xl font-bold text-15 hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "تأكيد رفع العقار ✓"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleClose}
              className="h-13 px-6 rounded-2xl border border-surface-border text-ink-subtle font-bold text-15 hover:bg-neutral-100 transition-all"
            >
              تراجع
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
