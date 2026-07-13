"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  buildPaymentMessagePayload,
  emptyPaymentMessageForm,
  isPaymentMessageFormValid,
  mapPaymentMessageToForm,
  PAYMENT_MESSAGES_API,
  PAYMENT_MESSAGES_QUERY_KEY,
  PAYMENT_MESSAGE_TYPE_META,
} from "@/src/lib/payment-messages";
import PaymentMessageFormFields from "./payment-message-form-fields";

export default function EditPaymentMessageDialog({ item, type, triggerVariant = "edit" }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyPaymentMessageForm);
  const queryClient = useQueryClient();
  const meta = PAYMENT_MESSAGE_TYPE_META[type];
  const isEdit = Boolean(item?.id);

  useEffect(() => {
    if (open) {
      setForm(item ? mapPaymentMessageToForm(item) : emptyPaymentMessageForm);
    }
  }, [open, item]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = buildPaymentMessagePayload(form, type);
      if (isEdit) {
        return axiosInstance.post(`${PAYMENT_MESSAGES_API}/${item.id}`, payload);
      }
      return axiosInstance.post(PAYMENT_MESSAGES_API, payload);
    },
    onSuccess: (res) => {
      toast.success(
        res?.data?.message ||
          (isEdit ? "تم تحديث رسالة الدفع بنجاح" : "تم إضافة رسالة الدفع بنجاح")
      );
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [PAYMENT_MESSAGES_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ رسالة الدفع");
    },
  });

  const handleSubmit = () => {
    if (!isPaymentMessageFormValid(form)) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    mutate();
  };

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={
          triggerVariant === "add"
            ? "h-11 rounded-full border-dashed border-[#C4C4C4] bg-white px-5 font-bold text-[#616161] hover:border-brand-main hover:text-brand-main"
            : "h-10 rounded-full border-0 bg-white/90 px-4 font-bold text-[#212121] shadow-sm hover:bg-white"
        }
      >
        {triggerVariant === "add" ? (
          <>
            <Plus className="ml-2 size-4" />
            إضافة الرسالة
          </>
        ) : (
          <>
            <Pencil className="ml-2 size-4" />
            تعديل
          </>
        )}
      </Button>

      <DialogContent closeButton={false} className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-5">
            <div className="text-right">
              <h2 className="text-xl font-black text-black">
                {isEdit ? "تعديل" : "إضافة"} {meta?.label}
              </h2>
              <p className="mt-1 text-sm text-[#737373]">{meta?.description}</p>
            </div>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>

          <PaymentMessageFormFields form={form} onChange={setForm} />

          <Button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="mx-auto mt-6 block h-12 min-w-[160px] rounded-[16px] bg-brand-hover font-bold"
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : isEdit ? (
              "حفظ التعديل"
            ) : (
              "إضافة الرسالة"
            )}
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
