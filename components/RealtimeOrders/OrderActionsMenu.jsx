"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Loader2,
  MoreVertical,
  Plus,
  Printer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import waIcon from "@/public/images/waIcon.svg";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/src/utils/axios";
import { printOrderContract } from "@/components/Orders/single-order/print-contract";
import { MOCK_ORDER_STATUSES } from "./order-detail-mock";
import AddContractStatusDialog from "./AddContractStatusDialog";
import { openDialogAfterMenuClose } from "@/src/lib/open-dialog-after-menu-close";

function toMenuStatus(status) {
  if (!status) return null;
  return {
    id: status.id,
    label: status.label ?? status.name,
    name: status.name ?? status.label,
    color: status.color,
  };
}

export default function OrderActionsMenu({
  order,
  onStatusChange,
  statuses,
  isStatusPending = false,
  canChangeStatus = true,
  canAddStatus = false,
  triggerClassName,
}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const statusItems = (Array.isArray(statuses) ? statuses : MOCK_ORDER_STATUSES)
    .map(toMenuStatus)
    .filter(Boolean);
  const currentLabel =
    order?.status_name ||
    order?.status?.name ||
    order?.contract_status_name;
  const currentId =
    order?.status_id ??
    order?.status?.id ??
    order?.contract_status_id ??
    statusItems.find((s) => s.label === currentLabel)?.id;

  const copyUuid = () => {
    navigator.clipboard.writeText(String(order?.uuid ?? ""));
    toast.success("تم نسخ رقم الطلب");
  };

  const openWhatsApp = () => {
    const mobile = String(order?.user_mobile ?? "").replace(/\D/g, "");
    if (!mobile) {
      toast.error("لا يوجد رقم جوال للعميل");
      return;
    }
    window.open(`https://wa.me/${mobile}`, "_blank", "noopener,noreferrer");
  };

  const printOrder = async () => {
    if (!order?.id) {
      toast.error("لا توجد بيانات للطباعة");
      return;
    }
    setIsPrinting(true);
    try {
      const res = await axiosInstance.get(`/admin/orders/${order.id}`);
      const orderData = res?.data?.data ?? res?.data;
      const opened = printOrderContract(orderData);
      if (!opened) toast.error("تعذر فتح نافذة الطباعة");
    } catch (error) {
      toast.error(error?.response?.data?.message || "تعذر تحميل بيانات الطباعة");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
    <DropdownMenu dir="rtl" modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="المزيد"
          className={cn(
            "size-8 rounded-lg border flex items-center justify-center transition-colors",
            "border-[#E6EBE9] text-[#6B7280] hover:text-[#0B5345] hover:border-[#0B5345]/30",
            "dark:border-white/10 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white",
            triggerClassName
          )}
        >
          {isStatusPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MoreVertical className="size-4" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(
          "w-[260px] rounded-2xl border p-0 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.12)]",
          "border-[#E8EEEC] bg-white dark:border-white/10 dark:bg-[#13241C]"
        )}
      >
        <div className="px-3.5 pt-3 pb-1.5">
          <DropdownMenuLabel className="p-0 text-[12px] font-bold text-[#9CA3AF] dark:text-white/45">
            تغيير حالة الطلب
          </DropdownMenuLabel>
        </div>

        <div className="px-1.5 pb-1.5 max-h-[280px] overflow-y-auto">
          {!canChangeStatus ? (
            <p className="px-3 py-2 text-[12px] text-[#9CA3AF]">
              ليست لديك صلاحية تغيير الحالة
            </p>
          ) : statusItems.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-[#9CA3AF]">لا توجد حالات</p>
          ) : (
            statusItems.map((status) => {
              const active =
                (currentId != null && String(status.id) === String(currentId)) ||
                status.label === currentLabel;
              return (
                <DropdownMenuItem
                  key={status.id}
                  disabled={isStatusPending}
                  onSelect={() => {
                    if (active || isStatusPending) return;
                    onStatusChange?.(order, status);
                  }}
                  className={cn(
                    "rounded-xl px-3 py-2.5 cursor-pointer gap-2.5",
                    "focus:bg-[#F3F9F6] dark:focus:bg-white/[0.06]",
                    active && "bg-[#F8FAF9] dark:bg-white/[0.04]"
                  )}
                >
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="flex-1 text-[13px] font-bold text-[#111827] dark:text-white/90 text-right">
                    {status.label}
                  </span>
                  {active ? (
                    <Check className="size-3.5 text-[#0B5345] dark:text-[#6EE7B7] shrink-0" />
                  ) : null}
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        {canAddStatus ? (
          <>
            <DropdownMenuSeparator className="bg-[#EEEEEE] dark:bg-white/10 my-0" />
            <div className="px-1.5 py-1.5">
              <DropdownMenuItem
                onSelect={() => {
                  openDialogAfterMenuClose(() => setIsAddOpen(true));
                }}
                className="rounded-xl px-3 py-2.5 cursor-pointer gap-2.5 focus:bg-[#F3F9F6] dark:focus:bg-white/[0.06]"
              >
                <Plus className="size-4 text-[#0B5345] dark:text-[#6EE7B7] shrink-0" />
                <span className="flex-1 text-[13px] font-bold text-[#111827] dark:text-white/90 text-right">
                  إضافة حالة جديدة
                </span>
              </DropdownMenuItem>
            </div>
          </>
        ) : null}

        <DropdownMenuSeparator className="bg-[#EEEEEE] dark:bg-white/10 my-0" />

        <div className="p-1.5">
          <DropdownMenuItem
            onSelect={copyUuid}
            className="rounded-xl px-3 py-2.5 cursor-pointer gap-2.5 focus:bg-[#F3F9F6] dark:focus:bg-white/[0.06]"
          >
            <Copy className="size-4 text-[#6B7280] dark:text-white/50 shrink-0" />
            <span className="flex-1 text-[13px] font-bold text-[#111827] dark:text-white/90 text-right">
              نسخ رقم الطلب
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={openWhatsApp}
            className="rounded-xl px-3 py-2.5 cursor-pointer gap-2.5 focus:bg-[#F3F9F6] dark:focus:bg-white/[0.06]"
          >
            <Image src={waIcon} alt="" width={16} height={16} className="shrink-0" />
            <span className="flex-1 text-[13px] font-bold text-[#111827] dark:text-white/90 text-right">
              تواصل واتساب مع العميل
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={isPrinting}
            onSelect={(event) => {
              event.preventDefault();
              printOrder();
            }}
            className="rounded-xl px-3 py-2.5 cursor-pointer gap-2.5 focus:bg-[#F3F9F6] dark:focus:bg-white/[0.06]"
          >
            {isPrinting ? (
              <Loader2 className="size-4 animate-spin text-[#6B7280] dark:text-white/50 shrink-0" />
            ) : (
              <Printer className="size-4 text-[#6B7280] dark:text-white/50 shrink-0" />
            )}
            <span className="flex-1 text-[13px] font-bold text-[#111827] dark:text-white/90 text-right">
              طباعة الطلب
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <AddContractStatusDialog
      open={isAddOpen}
      onOpenChange={setIsAddOpen}
      onCreated={(status) => onStatusChange?.(order, status)}
    />
    </>
  );
}
