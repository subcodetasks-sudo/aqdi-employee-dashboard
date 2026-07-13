"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import greenRial from "@/public/images/greenRial.svg";
import waIcon from "@/public/images/waIcon.svg";
import {
  formatRelativeTimeAr,
  resolveRefundIdForActionAsync,
  updateRefundContract,
} from "./refund-contract-utils";

function SummaryRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EBEBEB] last:border-0">
      <span className="text-[13px] text-[#A3A3A3] shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">{children}</div>
    </div>
  );
}

export default function RefundContractReviewDialog({
  open,
  onOpenChange,
  refund,
  order,
  refundsLookup,
  refundItems = [],
  onApproved,
}) {
  const [notes, setNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  useEffect(() => {
    if (open) {
      setNotes(refund?.notes?.trim() || "تم التحويل");
      setRefundAmount(
        refund?.refundAmount != null && refund?.refundAmount !== ""
          ? String(refund.refundAmount)
          : ""
      );
    }
  }, [open, refund]);

  const isHousing =
    refund?.contractTypeKey === "housing" ||
    refund?.contractType === "سكنـي" ||
    refund?.contractType === "سكني";

  const receivedSince = formatRelativeTimeAr(refund?.updatedAt || refund?.createdAt);

  const { mutate: submitApproval, isPending } = useMutation({
    mutationFn: async () => {
      const refundId = await resolveRefundIdForActionAsync(order, refund, refundsLookup, {
        allRefunds: refundItems,
      });
      if (!refundId) {
        throw new Error("MISSING_REFUND_ID");
      }
      const amount = Number(refundAmount || refund?.refundAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("INVALID_AMOUNT");
      }
      return updateRefundContract(refundId, {
        admin_confirmed: true,
        refund_amount: amount,
        notes: notes.trim() || null,
      });
    },
    onSuccess: (res) => {
      const message =
        res?.data?.message ?? res?.message ?? "تمت موافقة الإدارة بنجاح";
      toast.success(message);
      onApproved?.({ ...refund, refundAmount: Number(refundAmount) }, notes.trim());
      onOpenChange(false);
    },
    onError: (error) => {
      if (error?.message === "MISSING_REFUND_ID") {
        toast.error("تعذر تحديد طلب الاسترجاع");
        return;
      }
      if (error?.message === "INVALID_AMOUNT") {
        toast.error("قيمة المبلغ المسترجع غير صالحة");
        return;
      }
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ الموافقة");
    },
  });

  const needsRefundAmount = refund?.refundAmount == null || refund?.refundAmount === "";

  const handleSave = () => {
    const amount = Number(refundAmount || refund?.refundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("يرجى إدخال قيمة المبلغ المسترجع");
      return;
    }
    submitApproval();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px] p-8 rounded-[32px] border-0 gap-0 max-h-[90vh] overflow-y-auto no-scrollbar"
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

        <DialogHeader className="mb-5 space-y-0">
          <DialogTitle className="text-[20px] font-bold text-black text-right border-b border-[#F0F0F0] pb-4">
            طلب إسترجاع
          </DialogTitle>
        </DialogHeader>

        {refund ? (
          <div className="flex flex-col gap-5">
            <div className="bg-[#F9F9F9] rounded-[20px] p-5 border border-[#F0F0F0]">
              <div className="flex items-start justify-between gap-3 pb-4 mb-1 border-b border-[#EBEBEB]">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[13px] text-[#A3A3A3]">رقم الطلب</span>
                  <span className="text-[15px] font-bold text-black">{refund.orderUuid}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#737373] shrink-0">
                  <Clock className="size-3.5" strokeWidth={2} />
                  <span>{receivedSince}</span>
                </div>
              </div>

              {refund.userMobile ? (
                <SummaryRow label="رقم جوال العميل">
                  <span className="text-[14px] font-bold text-black" dir="ltr">
                    {refund.userMobile}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(refund.userMobile);
                      toast.success("تم نسخ رقم الجوال");
                    }}
                    className="text-[#A3A3A3] hover:text-brand-hover transition-colors"
                  >
                    <i className="fa-regular fa-copy text-[13px]" />
                  </button>
                  <Link
                    href={`https://wa.me/${refund.userMobile}`}
                    target="_blank"
                    className="hover:scale-110 transition-transform"
                  >
                    <Image src={waIcon} alt="WhatsApp" width={20} height={20} />
                  </Link>
                </SummaryRow>
              ) : null}

              <SummaryRow label="نوع العقد">
                <span
                  className={`px-3 py-1 rounded text-[12px] font-bold whitespace-nowrap ${
                    isHousing ? "bg-[#E6F0FF] text-[#3B82F6]" : "bg-[#F0E6FF] text-[#7C3AED]"
                  }`}
                >
                  {refund.contractType}
                </span>
              </SummaryRow>

              <SummaryRow label="الدفع">
                {refund.isPaid ? (
                  <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[14px]">
                    <span>{refund.amountPayment}</span>
                    <Image src={greenRial} alt="" width={14} height={14} />
                    <span className="w-5 h-5 rounded bg-[#E6FFE6] flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  </div>
                ) : (
                  <span className="text-[14px] font-bold text-[#EF4444]">
                    {refund.paymentLabelAr || "لم يتم الدفع"}
                  </span>
                )}
              </SummaryRow>

              <SummaryRow label="مستلم منذ">
                <span className="text-[14px] font-bold text-[#D97706]">{receivedSince}</span>
              </SummaryRow>

              {refund.statusName ? (
                <SummaryRow label="حالة الطلب">
                  <span
                    className="px-3 py-1 rounded text-[12px] font-bold whitespace-nowrap text-[#212121]"
                    style={{ backgroundColor: refund.statusColor || "#E6F0FF" }}
                  >
                    {refund.statusName}
                  </span>
                </SummaryRow>
              ) : null}

              <SummaryRow label="الاستلام">
                <span className="text-[14px] font-bold text-black">{refund.employeeName}</span>
              </SummaryRow>

              {refund.draftContractNumber ? (
                <SummaryRow label="رقم مسودة العقد">
                  <span className="text-[14px] font-bold text-black">{refund.draftContractNumber}</span>
                </SummaryRow>
              ) : null}
            </div>

            {needsRefundAmount ? (
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-black text-right">
                  قيمة المبلغ المسترجع
                  <span className="text-[#FF4D4F] mr-1">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="w-full h-[52px] bg-white border border-[#EEEEEE] rounded-[16px] px-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all"
                  placeholder="أدخل قيمة المبلغ المسترجع ..."
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  disabled={isPending}
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-black text-right">
                ملاحظات تود ذكرها
              </label>
              <textarea
                className="w-full min-h-[100px] bg-white border border-[#EEEEEE] rounded-[16px] p-4 text-[14px] focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-hover/20 transition-all resize-none"
                placeholder="أكتب هنا ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="w-full h-[52px] bg-brand-hover text-white rounded-full font-bold text-[16px] hover:bg-brand-hover/90 transition-all shadow-lg shadow-brand-hover/25 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ"
              )}
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
