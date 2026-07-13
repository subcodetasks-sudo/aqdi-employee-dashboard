"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  canManageAdminRefund,
  isCustomerRefundPending,
  resolveRefundIdForAction,
  resolveRefundIdForActionAsync,
  updateRefundContract,
} from "./refund-contract-utils";
import RefundContractReviewDialog from "./refund-contract-review-dialog";
import {
  RefundApprovedSuccessDialog,
  RefundRetractSuccessDialog,
} from "./refund-contract-success-dialog";

const menuContentClass =
  "w-[min(320px,calc(100vw-32px))] rounded-[18px] border border-[#E8E8E8] bg-white p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]";

const itemBaseClass =
  "flex items-center gap-3 w-full rounded-[14px] px-3 py-3.5 cursor-pointer outline-none";

export default function RefundContractActionsMenu({
  refund,
  order,
  refundsLookup,
  refundItems = [],
  queryKey,
  forceShow = false,
}) {
  const queryClient = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [retractOpen, setRetractOpen] = useState(false);
  const [approvedSuccessOpen, setApprovedSuccessOpen] = useState(false);
  const [retractSuccessOpen, setRetractSuccessOpen] = useState(false);
  const [successRefund, setSuccessRefund] = useState(null);

  const refundId = useMemo(
    () => resolveRefundIdForAction(order, refund, refundsLookup),
    [order, refund, refundsLookup]
  );

  const enrichedRefund = useMemo(
    () => (refund ? { ...refund, refundId: refundId ?? refund.refundId } : null),
    [refund, refundId]
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["returnOrders"] });
    queryClient.invalidateQueries({ queryKey: ["refundContractsLookup"] });
    queryClient.invalidateQueries({ queryKey: ["refundContracts"] });
  };

  const { mutate: updateRefund, isPending } = useMutation({
    mutationFn: ({ refundId: id, body }) => updateRefundContract(id, body),
    onSuccess: (res, variables) => {
      invalidate();
      if (variables.action === "reject") {
        toast.success(res?.data?.message || "تم تسجيل عدم الموافقة");
        setRejectOpen(false);
        return;
      }
      if (variables.action === "retract") {
        setRetractOpen(false);
        setSuccessRefund(enrichedRefund);
        setRetractSuccessOpen(true);
        return;
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تنفيذ الإجراء");
    },
  });

  const requireRefundId = async () => {
    const syncId = resolveRefundIdForAction(order, enrichedRefund, refundsLookup);
    if (syncId) return syncId;

    const id = await resolveRefundIdForActionAsync(order, enrichedRefund, refundsLookup, {
      allRefunds: refundItems,
    });
    if (!id) {
      toast.error("تعذر تحديد طلب الاسترجاع");
      return null;
    }
    return id;
  };

  const getRefundAmount = () => {
    const amount = Number(enrichedRefund?.refundAmount ?? order?.refund_amount);
    if (Number.isFinite(amount) && amount > 0) return amount;
    return 0;
  };

  const handleReject = async () => {
    const id = await requireRefundId();
    if (!id) return;

    updateRefund({
      refundId: id,
      action: "reject",
      body: {
        admin_confirmed: false,
        refund_amount: getRefundAmount(),
        notes: "لم تتم الموافقة من الإدارة",
      },
    });
  };

  const handleRetract = async () => {
    const id = await requireRefundId();
    if (!id) return;

    updateRefund({
      refundId: id,
      action: "retract",
      body: {
        admin_confirmed: false,
        refund_amount: getRefundAmount(),
        notes: "التراجع عن الاسترجاع وتصنيف الطلب كطلب مكتمل",
      },
    });
  };

  const handleApproved = (approvedRefund) => {
    setSuccessRefund(approvedRefund);
    setApprovedSuccessOpen(true);
    invalidate();
  };

  const shouldShow = forceShow
    ? isCustomerRefundPending(order ?? enrichedRefund?.raw)
    : canManageAdminRefund(enrichedRefund) && Boolean(refundId);

  if (!shouldShow || !enrichedRefund) {
    return null;
  }

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            disabled={isPending}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5] text-[#4D4D4D] hover:bg-[#EBEBEB] transition-all disabled:opacity-50 shrink-0"
            aria-label="إجراءات موافقة الإدارة"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <i className="fa-solid fa-ellipsis-vertical text-[14px]" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className={menuContentClass}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            className={`${itemBaseClass} hover:bg-[#F0FFF8] focus:bg-[#F0FFF8]`}
            onClick={(e) => {
              e.stopPropagation();
              setReviewOpen(true);
            }}
          >
            <span className="text-[16px] shrink-0" aria-hidden>
              ✅
            </span>
            <span className="flex-1 text-center text-[14px] font-medium text-black">
              الموافقة على الإرجاع
            </span>
            <ChevronLeft className="size-3.5 shrink-0 text-[#0c6055]" strokeWidth={2.5} />
          </DropdownMenuItem>

          <DropdownMenuItem
            className={`${itemBaseClass} hover:bg-[#FFF5F5] focus:bg-[#FFF5F5]`}
            onClick={(e) => {
              e.stopPropagation();
              setRejectOpen(true);
            }}
          >
            <span className="text-[16px] shrink-0" aria-hidden>
              ❌
            </span>
            <span className="flex-1 text-center text-[14px] font-medium text-[#E24444]">
              لم تتم الموافقة
            </span>
            <ChevronLeft className="size-3.5 shrink-0 text-[#E24444]" strokeWidth={2.5} />
          </DropdownMenuItem>

          <DropdownMenuItem
            className={`${itemBaseClass} hover:bg-[#F9F9F9] focus:bg-[#F9F9F9]`}
            onClick={(e) => {
              e.stopPropagation();
              setRetractOpen(true);
            }}
          >
            <span className="text-[18px] shrink-0" aria-hidden>
              🧐
            </span>
            <span className="flex-1 text-center text-[13px] font-medium text-black leading-snug">
              التراجع وتصنيف الطلب إلى أخرى
            </span>
            <ChevronLeft className="size-3.5 shrink-0 text-[#737373]" strokeWidth={2.5} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RefundContractReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        refund={enrichedRefund}
        order={order}
        refundsLookup={refundsLookup}
        refundItems={refundItems}
        onApproved={handleApproved}
      />

      <RefundApprovedSuccessDialog
        open={approvedSuccessOpen}
        onOpenChange={setApprovedSuccessOpen}
        refund={successRefund}
      />

      <RefundRetractSuccessDialog
        open={retractSuccessOpen}
        onOpenChange={setRetractSuccessOpen}
        refund={successRefund}
      />

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent dir="rtl" className="rounded-[20px] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[18px] font-bold text-black text-right">
              لم تتم الموافقة
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-[#737373] text-right">
              هل أنت متأكد من تسجيل عدم الموافقة على استرجاع الطلب{" "}
              <span className="font-bold text-black">{enrichedRefund?.orderUuid}</span>؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isPending} className="rounded-full mt-0">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                handleReject();
              }}
              className="rounded-full bg-[#E24444] hover:bg-[#d63c3c] text-white"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "تأكيد"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={retractOpen} onOpenChange={setRetractOpen}>
        <AlertDialogContent dir="rtl" className="rounded-[20px] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[18px] font-bold text-black text-right">
              التراجع عن الاسترجاع
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-[#737373] text-right">
              سيتم إلغاء استرجاع الطلب{" "}
              <span className="font-bold text-black">{enrichedRefund?.orderUuid}</span> وتصنيفه في قسم
              الطلبات المكتملة. هل تريد المتابعة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isPending} className="rounded-full mt-0">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                handleRetract();
              }}
              className="rounded-full bg-brand-hover hover:bg-brand-hover/90 text-white"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "تأكيد"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
