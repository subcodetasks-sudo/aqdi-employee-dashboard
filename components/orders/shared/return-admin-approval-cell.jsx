"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import RefundContractReviewDialog from "@/components/analysis/returned/refund-contract-review-dialog";
import {
  canShowReturnOrderApproval,
  ensureReturnOrderRefund,
  getOrderAdminApprovalStatus,
  isAdminRefundApproved,
  resolveRefundIdForAction,
  resolveRefundIdForActionAsync,
  updateRefundContract,
} from "@/components/analysis/returned/refund-contract-utils";
import { invalidateRefundCaches } from "@/src/lib/invalidate-orders-caches";

function getApprovalMeta(row) {
  const status = getOrderAdminApprovalStatus(row);
  // Customer refund (is_refunded) is a separate signal from admin approval.
  const customerRefunded =
    row?.is_refunded === true ||
    row?.is_refunded === 1 ||
    row?.customer_refunded === true ||
    row?.refunded === true;

  if (status === true || status === 1) {
    return {
      key: "approved",
      label: customerRefunded ? "تم الاسترجاع" : "تمت الموافقة",
      className: "bg-[#E6FFE6] text-[#047857] dark:bg-emerald-500/15 dark:text-emerald-300",
    };
  }
  if (status === false || status === 0) {
    return { key: "rejected", label: "مرفوض", className: "bg-[#FFE6E6] text-[#DC2626] dark:bg-red-500/15 dark:text-red-300" };
  }
  // admin_confirmed / management_approval.approved === null → pending
  return { key: "pending", label: "بانتظار", className: "bg-[#FFF7E6] text-[#D97706] dark:bg-amber-500/15 dark:text-amber-300" };
}

export default function ReturnAdminApprovalCell({
  row,
  refundsLookup,
  refundItems = [],
  exportQueryKey,
  onApprovedSuccess,
  dark = false,
}) {
  const queryClient = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const refund = useMemo(
    () => ensureReturnOrderRefund(row, refundsLookup),
    [row, refundsLookup]
  );

  const refundId = useMemo(
    () => resolveRefundIdForAction(row, refund, refundsLookup),
    [row, refund, refundsLookup]
  );

  const approval = getApprovalMeta(row);
  const canAct = canShowReturnOrderApproval(row, refund) && approval.key === "pending";

  const amount = row?.refund_amount ?? refund?.refundAmount;

  const { mutate: rejectRefund, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      const id =
        refundId ||
        (await resolveRefundIdForActionAsync(row, refund, refundsLookup, {
          allRefunds: refundItems,
        }));
      if (!id) throw new Error("MISSING_REFUND_ID");

      const refundAmount = Number(amount);
      return updateRefundContract(
        id,
        {
          admin_confirmed: false,
          refund_amount: Number.isFinite(refundAmount) && refundAmount > 0 ? refundAmount : 0,
          notes: "لم تتم الموافقة من الإدارة",
        },
        { order: row, refund }
      );
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تسجيل عدم الموافقة");
      setRejectOpen(false);
      invalidateRefundCaches(queryClient, { queryKey: exportQueryKey });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تنفيذ الإجراء");
    },
  });

  if (!refund && row?.admin_confirmed == null && !row?.refund_amount) {
    return <span className={dark ? "text-white/35" : "text-gray-400"}>—</span>;
  }

  return (
    <>
      <div className="flex flex-col items-start gap-1.5 min-w-[150px]">
        {amount != null && amount !== "" ? (
          <span className={cn("text-xs font-bold tabular-nums", dark ? "text-amber-300" : "text-[#EA580C]")}>
            استرجاع {amount} ريال
          </span>
        ) : null}

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap", approval.className)}>
            {approval.label}
          </span>

          {canAct ? (
            <span className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReviewOpen(true);
                }}
                title="اعتماد الاسترجاع"
                className="size-7 rounded-lg bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0] dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30 inline-flex items-center justify-center transition-colors"
              >
                <Check className="size-3.5" strokeWidth={2.75} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRejectOpen(true);
                }}
                title="رفض"
                className="size-7 rounded-lg bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30 inline-flex items-center justify-center transition-colors"
              >
                <X className="size-3.5" strokeWidth={2.75} />
              </button>
            </span>
          ) : isAdminRefundApproved(getOrderAdminApprovalStatus(row)) ? (
            <Check className="size-3.5 text-[#15803D] dark:text-emerald-400" strokeWidth={2.75} />
          ) : null}
        </div>
      </div>

      {refund ? (
        <RefundContractReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          refund={refund}
          order={row}
          refundsLookup={refundsLookup}
          refundItems={refundItems}
          onApproved={(approvedRefund) => {
            onApprovedSuccess?.(approvedRefund);
          }}
        />
      ) : null}

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent dir="rtl" className="rounded-20 max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-black text-right dark:text-white">
              رفض طلب الاسترجاع
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-neutral-500 text-right dark:text-white/55">
              هل أنت متأكد من رفض استرجاع الطلب{" "}
              <span className="font-bold text-black dark:text-white">#{row?.uuid}</span>؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isRejecting} className="rounded-full mt-0">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRejecting}
              onClick={(e) => {
                e.preventDefault();
                rejectRefund();
              }}
              className="rounded-full bg-[#E24444] hover:bg-[#d63c3c] text-white"
            >
              {isRejecting ? <Loader2 className="size-4 animate-spin" /> : "تأكيد الرفض"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
