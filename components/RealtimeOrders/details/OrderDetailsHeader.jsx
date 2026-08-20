"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  Link2,
  Loader2,
  MessageSquarePlus,
  Phone,
  Printer,
  Send,
  Undo2,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import waIcon from "@/public/images/waIcon.svg";
import { cn } from "@/lib/utils";
import OrderActionsMenu from "../OrderActionsMenu";
import { RT } from "../theme";
import { printOrderContract } from "@/components/Orders/single-order/print-contract";
import SendOrderSmsButton from "@/components/Orders/shared/send-order-sms-button";

const ACTION_PILLS = [
  { id: "view_file", label: "عرض ملف", Icon: FileText },
  { id: "pay_link", label: "توليد رابط دفع", Icon: Link2 },
  { id: "property_update", label: "رفع تحديث العقار", Icon: Upload },
  { id: "send_draft", label: "إرسال المسودة", Icon: Send },
  { id: "missing_attachment", label: "طلب مرفق ناقص", Icon: AlertTriangle },
  { id: "ejar_documentation", label: "موثق في إيجار", Icon: BadgeCheck },
  { id: "refund", label: "رفع طلب استرجاع", Icon: Undo2 },
];

export default function OrderDetailsHeader({
  order,
  orderData,
  backHref = "/home/orders",
  backLabel = "الطلبات",
  onStatusChange,
  onOpenNotes,
  onPayLink,
  onRefund,
  onPropertyUpdate,
  onSendDraft,
  onMissingAttachment,
  onEjarDocumentation,
  statuses = [],
  canChangeStatus = true,
  canAddStatus = false,
  isStatusPending = false,
}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const stamp = order.received_at
    ? new Date(order.received_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).replace(",", " -")
    : new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).replace(",", " -");

  const handlePrint = () => {
    if (!orderData) {
      toast.error("لا توجد بيانات للطباعة");
      return;
    }
    setIsPrinting(true);
    try {
      const opened = printOrderContract(orderData);
      if (!opened) toast.error("تعذر فتح نافذة الطباعة");
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePill = (id) => {
    if (id === "view_file") {
      handlePrint();
      return;
    }
    if (id === "pay_link") {
      onPayLink?.();
      return;
    }
    if (id === "refund") {
      onRefund?.();
      return;
    }
    if (id === "property_update") {
      onPropertyUpdate?.();
      return;
    }
    if (id === "send_draft") {
      onSendDraft?.();
      return;
    }
    if (id === "missing_attachment") {
      onMissingAttachment?.();
      return;
    }
    if (id === "ejar_documentation") {
      onEjarDocumentation?.();
    }
  };

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={backHref}
              className="text-[13px] font-bold text-[#9CA3AF] hover:text-[#0B5345]"
            >
              {backLabel}
            </Link>
            <span className="text-[#D1D5DB]">›</span>
            <span className="text-[15px] font-black text-[#0B5345] dark:text-[#6EE7B7]">
              #{order.uuid}
            </span>
            <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold">
              <CheckDot />
              عقد {order.contract_type} : {order.instrument_type}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[12px] text-[#6B7280] dark:text-white/50">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {stamp}
            </span>
            <span className="tabular-nums" dir="ltr">
              {order.user_mobile || "—"}
            </span>
            <span>المستلم: {order.employee_name || "—"}</span>

            <StatusSelect
              order={order}
              statuses={statuses}
              onStatusChange={onStatusChange}
              disabled={!canChangeStatus || isStatusPending}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "h-9 px-3 rounded-full border-2 text-[12.5px] font-black flex items-center",
              order.is_paid
                ? "border-[#15803D] text-[#15803D]"
                : "border-[#DC2626] text-[#DC2626]"
            )}
          >
            {order.is_paid ? "مدفوع" : "غير مدفوع"}
          </span>

          <span className="h-9 px-3 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-[12.5px] font-bold inline-flex items-center gap-1.5">
            <Building2 className="size-3.5" />
            {order.contract_type}
          </span>

          {order.user_mobile ? (
            <a
              href={`https://wa.me/${String(order.user_mobile).replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="size-9 rounded-full border border-[#E6EBE9] dark:border-white/10 flex items-center justify-center hover:bg-[#F3F9F6]"
            >
              <Image src={waIcon} alt="wa" width={16} height={16} />
            </a>
          ) : null}
          {order.user_mobile ? (
            <a
              href={`tel:${order.user_mobile}`}
              className="size-9 rounded-full border border-[#E6EBE9] dark:border-white/10 flex items-center justify-center text-[#0B5345] dark:text-[#6EE7B7] hover:bg-[#F3F9F6]"
            >
              <Phone className="size-4" />
            </a>
          ) : null}

          <button
            type="button"
            onClick={onOpenNotes}
            className="h-9 px-3 rounded-full border border-[#E6EBE9] dark:border-white/10 text-[12.5px] font-bold text-[#374151] dark:text-white/80 inline-flex items-center gap-1.5 hover:border-[#0B5345]/30"
          >
            <MessageSquarePlus className="size-3.5" />
            إضافة ملاحظة
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className="h-9 px-3 rounded-full border border-[#E6EBE9] dark:border-white/10 text-[12.5px] font-bold text-[#374151] dark:text-white/80 inline-flex items-center gap-1.5 hover:border-[#0B5345]/30"
          >
            {isPrinting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Printer className="size-3.5" />
            )}
            طباعة
          </button>

          {orderData ? (
            <SendOrderSmsButton
              order={orderData}
              label="رسالة"
              className="!h-9 !py-0 !px-3 !rounded-full !bg-white border border-[#E6EBE9] !text-[#374151] hover:!bg-[#F3F9F6] hover:!text-[#0B5345] dark:border-white/10 dark:!bg-transparent dark:!text-white/80"
            />
          ) : null}

          <OrderActionsMenu
            order={order}
            onStatusChange={onStatusChange}
            statuses={statuses}
            isStatusPending={isStatusPending}
            canChangeStatus={canChangeStatus}
            canAddStatus={canAddStatus}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTION_PILLS.map((pill) => {
          const Icon = pill.Icon;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => handlePill(pill.id)}
              className="h-9 px-3 rounded-full border border-[#E6EBE9] dark:border-white/10 bg-white dark:bg-white/[0.03] text-[12px] font-bold text-[#374151] dark:text-white/75 hover:border-[#0B5345]/35 inline-flex items-center gap-1.5"
            >
              <Icon className="size-3.5 opacity-60" />
              {pill.label}
            </button>
          );
        })}
      </div>

      {order.banner ? (
        <div className="rounded-xl bg-[#FBF3E0] text-[#92400E] text-[12.5px] font-bold px-4 py-2.5">
          {order.banner}
        </div>
      ) : null}
    </div>
  );
}

function CheckDot() {
  return (
    <span
      className="size-3.5 rounded-full flex items-center justify-center text-white text-[9px]"
      style={{ backgroundColor: RT.brand }}
    >
      ✓
    </span>
  );
}

function StatusSelect({ order, statuses = [], onStatusChange, disabled }) {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="h-8 px-3 rounded-full border border-[#E6EBE9] dark:border-white/10 bg-white dark:bg-white/[0.04] text-[12px] font-bold text-[#374151] dark:text-white/80 inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          {order.status_name}
          <ChevronDown className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[220px] rounded-xl p-1 border-[#E6EBE9] max-h-[280px] overflow-y-auto"
      >
        {statuses.length === 0 ? (
          <p className="px-3 py-2 text-[12px] text-[#9CA3AF]">لا توجد حالات</p>
        ) : (
          statuses.map((status) => {
            const label = status.name ?? status.label;
            const active =
              String(status.id) === String(order.status_id) ||
              label === order.status_name;
            return (
              <DropdownMenuItem
                key={status.id}
                disabled={disabled || active}
                onSelect={() => {
                  if (active) return;
                  onStatusChange?.(order, status);
                }}
                className={cn(
                  "rounded-lg px-3 py-2.5 cursor-pointer text-[13px] font-bold justify-end",
                  active
                    ? "bg-[#1D63D2] text-white focus:bg-[#1D63D2] focus:text-white"
                    : "text-[#374151]"
                )}
              >
                {label}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
