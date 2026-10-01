"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import OrderActionDialogHeader from "@/components/shared/order-action-dialog-header";
import { useDialogFormSession } from "@/src/hooks/use-dialog-form-session";
import { useContractStatuses } from "@/src/hooks/use-contract-statuses";
import { axiosInstance } from "@/src/utils/axios";
import { invalidateOrdersCaches } from "@/src/lib/invalidate-orders-caches";
import {
  SEND_CONTRACT_DRAFT_STATUS_ID,
  isSendContractDraftStatus,
  orderStatusUpdateUrl,
} from "@/src/lib/order-status-api";
import {
  getSaudiMobileError,
  sanitizeSaudiContactInput,
} from "@/src/lib/saudi-contact";
import { getOrderTenantStep } from "@/src/lib/order-detail-steps";

export default function SendDraftDialog({
  open,
  onOpenChange,
  orderData,
  queryKey,
}) {
  const [draftNumber, setDraftNumber] = useState("");
  const [contactMode, setContactMode] = useState("same");
  const [otherNumber, setOtherNumber] = useState("");

  const tenant = getOrderTenantStep(orderData);
  const registeredMobile =
    orderData?.user?.mobile ??
    tenant?.tenant_mobile ??
    orderData?.tenant_mobile ??
    "";

  const resetForm = useCallback(() => {
    setDraftNumber("");
    setContactMode("same");
    setOtherNumber("");
  }, []);

  const session = useDialogFormSession(open, resetForm);

  const queryClient = useQueryClient();
  const { activeItems: statuses } = useContractStatuses();
  const sendDraftStatus = statuses.find((status) => isSendContractDraftStatus(status));

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      const orderId = orderData?.id;
      if (orderId == null || orderId === "") {
        throw new Error("تعذر تحديد الطلب");
      }

      const statusId = sendDraftStatus?.id ?? SEND_CONTRACT_DRAFT_STATUS_ID;
      const body = {
        status_id: Number(statusId),
        ejar_contract_draft_number: draftNumber.trim(),
        contact_number_mode: contactMode,
      };
      if (contactMode === "another") {
        body.contact_number = otherNumber.trim();
      }

      return axiosInstance.post(orderStatusUpdateUrl(orderId), body);
    },
    onSuccess: (res) => {
      invalidateOrdersCaches(queryClient, {
        queryKey,
        orderId: orderData?.id,
      });
      toast.success(res?.data?.message || "تم إرسال مسودة العقد للعميل");
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "حدث خطأ أثناء الإرسال");
    },
  });

  const canSubmit =
    draftNumber.trim().length > 0 &&
    (contactMode === "same" || otherNumber.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit || isPending) return;
    if (contactMode === "another") {
      const phoneError = getSaudiMobileError(otherNumber, { required: true });
      if (phoneError) {
        toast.error(phoneError);
        return;
      }
    }
    submit();
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
          icon={Send}
          iconClassName="bg-[#B45309]"
          title="إرسال مسودة العقد للعميل"
          onClose={handleClose}
        />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-13 font-bold text-black text-right">
              رقم مسودة العقد في إيجار
              <span className="text-status-danger mr-1">*</span>
            </label>
            <input
              type="text"
              value={draftNumber}
              onChange={(e) => setDraftNumber(e.target.value)}
              placeholder="أدخل رقم المسودة (10 أرقام)"
              disabled={isPending}
              className="w-full h-13 bg-white border border-surface-border rounded-2xl px-4 text-sm focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-13 font-bold text-black text-right">
              على أي رقم تواصل معكم العميل لإرسال المسودة؟
            </label>

            <button
              type="button"
              onClick={() => setContactMode("same")}
              disabled={isPending}
              className={`w-full rounded-2xl border px-4 py-3 flex items-center gap-3 text-right transition-all ${
                contactMode === "same"
                  ? "border-brand-hover bg-brand-hover/5"
                  : "border-surface-border bg-surface-input"
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
              onClick={() => setContactMode("another")}
              disabled={isPending}
              className={`w-full rounded-2xl border px-4 py-3 flex items-center gap-3 text-right transition-all ${
                contactMode === "another"
                  ? "border-brand-hover bg-brand-hover/5"
                  : "border-surface-border bg-surface-input"
              }`}
            >
              <span
                className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  contactMode === "another" ? "border-brand-hover" : "border-[#D0D5DD]"
                }`}
              >
                {contactMode === "another" ? (
                  <span className="size-2 rounded-full bg-brand-hover" />
                ) : null}
              </span>
              <span className="text-[13.5px] font-bold text-black">تواصل معنا برقم آخر</span>
            </button>

            {contactMode === "another" ? (
              <input
                type="text"
                value={otherNumber}
                onChange={(e) =>
                  setOtherNumber(sanitizeSaudiContactInput("phone", e.target.value))
                }
                placeholder="05xxxxxxxx"
                disabled={isPending}
                dir="ltr"
                inputMode="numeric"
                maxLength={12}
                className="w-full h-13 bg-white border border-surface-border rounded-2xl px-4 text-sm focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
              />
            ) : (
              <p className="text-[11.5px] text-ink-placeholder leading-relaxed px-1">
                بعض العملاء يتواصلون برقم مختلف عن رقم الطلب – سجل الرقم الفعلي الذي راسلكم منه
                ليُقيَّد في السجل.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="flex-1 h-13 bg-[#B45309] text-white rounded-2xl font-bold text-15 hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
              onClick={handleClose}
              className="h-13 px-6 rounded-2xl border border-surface-border text-ink-subtle font-bold text-15 hover:bg-neutral-100 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
