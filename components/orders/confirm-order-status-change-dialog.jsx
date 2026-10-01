"use client";

import { Loader2 } from "lucide-react";
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

export default function ConfirmOrderStatusChangeDialog({
  open,
  onOpenChange,
  statusName,
  orderLabel,
  isPending = false,
  onConfirm,
  title = "تأكيد تغيير الحالة",
  confirmLabel = "تأكيد التغيير",
}) {
  const statusText = statusName || "الحالة المحددة";
  const orderText = orderLabel ? `#${orderLabel}` : "هذا الطلب";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        onOpenChange?.(next);
      }}
    >
      <AlertDialogContent dir="rtl" className="rounded-20 max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-black text-right dark:text-white">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-neutral-500 text-right dark:text-white/55">
            هل أنت متأكد من تغيير حالة الطلب{" "}
            <span className="font-bold text-black dark:text-white">{orderText}</span> إلى{" "}
            <span className="font-bold text-black dark:text-white">«{statusText}»</span>؟
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
              onConfirm?.();
            }}
            className="rounded-full bg-brand-main hover:bg-brand-main/90 text-white"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
