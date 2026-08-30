"use client";

import { useCallback, useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import OrderActionDialogHeader from "@/components/shared/OrderActionDialogHeader";
import { useUpdateOrder } from "@/src/hooks/use-update-order";
import { useDialogFormSession } from "@/src/hooks/use-dialog-form-session";

function Tile({ label, value, className = "" }) {
  return (
    <div className={`rounded-2xl bg-surface-input px-4 py-3 ${className}`}>
      <p className="text-[11.5px] text-ink-placeholder mb-1">{label}</p>
      <p className="text-sm font-bold text-black truncate">{value ?? "—"}</p>
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

  const resetForm = useCallback(() => {
    setEjarNumber(orderData?.ejar_contract_number ?? "");
    setNotes("");
  }, [orderData]);

  const session = useDialogFormSession(open, resetForm);

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

  const handleClose = () => {
    if (isPending) return;
    onOpenChange(false);
  };

  const employeeName = orderData?.received_contract?.employee?.name ?? orderData?.employee_name;

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent
        key={session}
        className="sm:max-w-[520px] p-8 rounded-32 border-0 gap-0"
        dir="rtl"
        closeButton={false}
      >
        <OrderActionDialogHeader
          icon={BadgeCheck}
          iconClassName="bg-[#16A34A]"
          title="توثيق الطلب في إيجار"
          onClose={handleClose}
        />

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Tile label="نوع العقد" value={orderData?.contract_type_trans} />
            <Tile label="رقم الطلب" value={orderData?.uuid ? `#${orderData.uuid}` : null} />
            <Tile label="تاريخ إنشاء الطلب" value={orderData?.created_at_label} />
            <Tile label="المبلغ المدفوع" value={orderData?.amount_payment} />
            <Tile label="الموظف المستلم" value={employeeName} className="col-span-2" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-13 font-bold text-black text-right">
              رقم العقد في إيجار
              <span className="text-status-danger mr-1">*</span>
            </label>
            <input
              type="text"
              value={ejarNumber}
              onChange={(e) => setEjarNumber(e.target.value)}
              placeholder="أدخل العقد الموثّق في منصة إيجار (10 أرقام)"
              disabled={isPending}
              className="w-full h-13 bg-white border border-surface-border rounded-2xl px-4 text-sm focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-13 font-bold text-black text-right">
              ملاحظات تود ذكرها
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا (اختياري)..."
              disabled={isPending}
              rows={3}
              className="w-full min-h-[100px] bg-white border border-surface-border rounded-2xl p-4 text-sm focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="flex-1 h-13 bg-[#16A34A] text-white rounded-2xl font-bold text-15 hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
