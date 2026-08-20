"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateOrder } from "@/src/hooks/use-update-order";

function Tile({ label, value, className = "" }) {
  return (
    <div className={`rounded-[16px] bg-[#F9F9F9] px-4 py-3 ${className}`}>
      <p className="text-[11.5px] text-[#A3A3A3] mb-1">{label}</p>
      <p className="text-[14px] font-bold text-black truncate">{value ?? "—"}</p>
    </div>
  );
}

export default function EjarDocumentationDialog({
  open,
  onOpenChange,
  orderData,
  queryKey,
}) {
  const [ejarNumber, setEjarNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setEjarNumber(orderData?.ejar_contract_number ?? "");
    setNotes("");
  }, [open, orderData]);

  const { mutate: submit, isPending } = useUpdateOrder({
    queryKey,
    successMessage: "تم توثيق الطلب في إيجار بنجاح",
    onSuccess: () => onOpenChange(false),
  });

  const canSubmit = ejarNumber.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || isPending) return;
    submit({
      orderId: orderData?.id,
      body: {
        ejar_contract_number: ejarNumber.trim(),
        ejar_status_notes: notes.trim() || null,
      },
    });
  };

  const employeeName = orderData?.received_contract?.employee?.name ?? orderData?.employee_name;

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
            <span className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
              <BadgeCheck className="size-[18px]" />
            </span>
            <DialogTitle className="text-[18px] font-bold text-black text-right">
              توثيق الطلب في إيجار
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Tile label="نوع العقد" value={orderData?.contract_type_trans} />
            <Tile label="رقم الطلب" value={orderData?.uuid ? `#${orderData.uuid}` : null} />
            <Tile label="تاريخ إنشاء الطلب" value={orderData?.created_at_label} />
            <Tile label="المبلغ المدفوع" value={orderData?.amount_payment} />
            <Tile label="الموظف المستلم" value={employeeName} className="col-span-2" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-black text-right">
              رقم العقد في إيجار
              <span className="text-[#FF4D4F] mr-1">*</span>
            </label>
            <input
              type="text"
              value={ejarNumber}
              onChange={(e) => setEjarNumber(e.target.value)}
              placeholder="أدخل العقد الموثّق في منصة إيجار (10 أرقام)"
              disabled={isPending}
              className="w-full h-[52px] bg-white border border-[#EEEEEE] rounded-[16px] px-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-black text-right">
              ملاحظات تود ذكرها
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا (اختياري)..."
              disabled={isPending}
              rows={3}
              className="w-full min-h-[100px] bg-white border border-[#EEEEEE] rounded-[16px] p-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="flex-1 h-[52px] bg-[#16A34A] text-white rounded-[16px] font-bold text-[15px] hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "تأكيد التوثيق في إيجار"
              )}
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
