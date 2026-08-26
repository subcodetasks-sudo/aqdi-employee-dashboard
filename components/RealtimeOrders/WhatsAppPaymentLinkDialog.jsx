"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/src/utils/axios";
import { useContractPeriodsForType } from "@/src/hooks/use-contract-periods";
import { usePaymentTypes } from "@/src/hooks/use-payment-types";
import {
  getContractPeriodLabel,
} from "@/src/lib/contract-period-utils";
import {
  CONTRACT_PAID_API,
  CONTRACT_PAID_QUERY_KEY,
  extractPaymentFromResponse,
} from "@/components/Orders/contract-paid/contract-paid-utils";
import PaymentLinkDialog from "@/components/Orders/shared/payment-link-dialog";
import { invalidateOrdersCaches } from "@/src/lib/invalidate-orders-caches";
import { cn } from "@/lib/utils";
import { RT } from "./theme";

const fieldClass =
  "h-12 rounded-xl border-surface-border-soft bg-[#F5F8F7] px-4 text-13 font-medium shadow-none focus-visible:ring-0 focus-visible:border-brand-dark";

export default function WhatsAppPaymentLinkDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [contractType, setContractType] = useState("housing");
  const [periodId, setPeriodId] = useState("");
  const [extraFeeId, setExtraFeeId] = useState("none");
  const [notes, setNotes] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState({
    paymentUrl: "",
    cartAmount: null,
    notes: "",
    alreadyPaid: false,
    message: null,
    payment: null,
  });

  const { items: periods, isLoading: periodsLoading } =
    useContractPeriodsForType(contractType, { enabled: open });
  const { items: feeItems } = usePaymentTypes(contractType, open);

  const selectedPeriod = useMemo(
    () => periods.find((item) => String(item.id) === String(periodId)),
    [periods, periodId]
  );
  const selectedFee = useMemo(
    () => feeItems.find((item) => String(item.id) === String(extraFeeId)),
    [feeItems, extraFeeId]
  );

  const referencePrice = selectedPeriod?.price ?? null;

  useEffect(() => {
    if (!open) return;
    if (!periods.length) {
      setPeriodId("");
      return;
    }
    setPeriodId((current) =>
      periods.some((period) => String(period.id) === String(current))
        ? current
        : String(periods[0].id)
    );
  }, [open, contractType, periods]);

  const resetForm = () => {
    setMobile("");
    setAmount("");
    setContractType("housing");
    setPeriodId("");
    setExtraFeeId("none");
    setNotes("");
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const parsedAmount = Number(amount);
      const extraAmount = Number(selectedFee?.price ?? selectedFee?.amount ?? 0) || 0;
      return axiosInstance.post(CONTRACT_PAID_API, {
        customer_mobile: mobile.trim(),
        contract_type: contractType,
        contract_period_id: Number(periodId),
        amount: parsedAmount + extraAmount,
        notes: notes.trim() || undefined,
        payment_type_id:
          extraFeeId !== "none" && extraFeeId ? Number(extraFeeId) : undefined,
      });
    },
    onSuccess: (res) => {
      const extracted = extractPaymentFromResponse(res.data);
      if (!extracted.paymentUrl && !extracted.alreadyPaid) {
        toast.error(res?.data?.message || "لم يتم إرجاع رابط الدفع");
        return;
      }

      toast.success(
        extracted.alreadyPaid
          ? extracted.message || "تم دفع هذا العقد بالفعل"
          : res?.data?.message || "تم توليد رابط الدفع"
      );
      onOpenChange?.(false);
      resetForm();
      setPaymentLink({
        paymentUrl: extracted.paymentUrl || "",
        cartAmount: extracted.cartAmount ?? Number(amount) ?? null,
        notes: notes.trim(),
        alreadyPaid: Boolean(extracted.alreadyPaid),
        message: extracted.message,
        payment: extracted.payment,
      });
      setResultOpen(true);
      invalidateOrdersCaches(queryClient, {
        queryKey: [CONTRACT_PAID_QUERY_KEY],
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.gateway_error ||
          error?.response?.data?.message ||
          "تعذر توليد رابط الدفع"
      );
    },
  });

  const handleSubmit = () => {
    if (!mobile.trim()) {
      toast.error("رقم جوال العميل مطلوب");
      return;
    }
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    if (!periodId) {
      toast.error("يرجى اختيار عدد سنوات العقد");
      return;
    }
    mutate();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange?.(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent
          closeButton={false}
          dir="rtl"
          className="max-w-[720px] rounded-[28px] border-0 p-0 overflow-hidden gap-0"
        >
          <DialogTitle className="sr-only">توليد رابط دفع – طلب واتساب</DialogTitle>
          <DialogDescription className="sr-only">
            إنشاء رابط دفع لطلب واتساب
          </DialogDescription>

          <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#EEF1F0]">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="size-10 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: RT.brand }}
              >
                <Link2 className="size-4" />
              </span>
              <h2 className="text-lg font-black text-brand-dark truncate">
                توليد رابط دفع – طلب واتساب
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange?.(false)}
              aria-label="إغلاق"
              className="size-9 rounded-full bg-status-neutral-bg text-status-neutral flex items-center justify-center hover:bg-[#E5E7EB]"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-13 font-bold">
                  رقم جوال العميل <span className="text-red-500">*</span>
                </span>
                <input
                  dir="ltr"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className={cn(fieldClass, "w-full")}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-13 font-bold">
                  المبلغ المطلوب (ريال) <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="مثال: 349"
                  className={cn(fieldClass, "w-full")}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="space-y-1.5">
                <span className="text-13 font-bold">نوع العقد</span>
                <Select dir="rtl" value={contractType} onValueChange={setContractType}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="housing">سكني</SelectItem>
                    <SelectItem value="commercial">تجاري</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <label className="space-y-1.5">
                <span className="text-13 font-bold">عدد سنوات العقد</span>
                <Select
                  dir="rtl"
                  value={periodId}
                  onValueChange={setPeriodId}
                  disabled={periodsLoading || periods.length === 0}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder={periodsLoading ? "جاري التحميل..." : "اختر المدة"} />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={String(period.id)}>
                        {getContractPeriodLabel(period)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="space-y-1.5">
                <span className="text-13 font-bold">رسوم إضافية (اختياري)</span>
                <Select dir="rtl" value={extraFeeId} onValueChange={setExtraFeeId}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="none">بدون</SelectItem>
                    {feeItems.map((fee) => (
                      <SelectItem key={fee.id} value={String(fee.id)}>
                        {fee.name_trans || fee.name_ar || fee.name || fee.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>

            {referencePrice != null && referencePrice !== "" ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5F1] px-3.5 py-1.5 text-[12.5px] font-bold text-brand-dark">
                <span className="size-4 rounded-full border-2 border-brand-dark flex items-center justify-center">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                سعر العقد المرجعي: {referencePrice} ريال
              </div>
            ) : null}

            <label className="space-y-1.5 block">
              <span className="text-13 font-bold">ملاحظات تود ذكرها</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="إذا كانت رسوم العقد أكثر أو أقل من المعتاد، يرجى توضيح السبب..."
                className="w-full min-h-[110px] rounded-xl border border-surface-border-soft bg-[#F5F8F7] px-4 py-3 text-13 font-medium resize-none focus:outline-none focus:border-brand-dark"
              />
            </label>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-t border-[#EEF1F0]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: RT.brand }}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Link2 className="size-4" />
              )}
              توليد رابط الدفع
            </button>
            <button
              type="button"
              onClick={() => onOpenChange?.(false)}
              className="h-12 px-6 rounded-xl bg-status-neutral-bg text-[#4B5563] font-bold text-sm hover:bg-[#E5E7EB]"
            >
              إغلاق
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentLinkDialog
        open={resultOpen}
        onOpenChange={setResultOpen}
        paymentUrl={paymentLink.paymentUrl}
        cartAmount={paymentLink.cartAmount}
        notes={paymentLink.notes}
        alreadyPaid={paymentLink.alreadyPaid}
        message={paymentLink.message}
        payment={paymentLink.payment}
      />
    </>
  );
}
