"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  MessageSquarePlus,
  MoreHorizontal,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import waIcon from "@/public/images/waIcon.svg";
import { cn } from "@/lib/utils";
import { MOCK_ORDER_STATUSES } from "../order-detail-mock";
import OrderActionsMenu from "../OrderActionsMenu";
import { RT } from "../theme";

const ACTION_PILLS = [
  { id: "view_file", label: "عرض ملف" },
  { id: "property_update", label: "رفع تحديث العقار" },
  { id: "send_draft", label: "إرسال المسودة" },
  { id: "missing", label: "طلب مرفق ناقص" },
  { id: "refund", label: "رفع طلب استرجاع" },
  { id: "ejar", label: "موثق في إيجار" },
  { id: "pay_link", label: "توليد رابط دفع" },
];

export default function OrderDetailsHeader({
  order,
  onStatusChange,
  onOpenNotes,
}) {
  const stamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(",", " -");

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/home/realtime-orders"
              className="text-[13px] font-bold text-[#9CA3AF] hover:text-[#0B5345]"
            >
              الطلبات
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
              {order.user_mobile}
            </span>
            <span>المستلم: {order.employee_name}</span>

            <StatusSelect order={order} onStatusChange={onStatusChange} />
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

          <a
            href={`https://wa.me/${order.user_mobile}`}
            target="_blank"
            rel="noreferrer"
            className="size-9 rounded-full border border-[#E6EBE9] dark:border-white/10 flex items-center justify-center hover:bg-[#F3F9F6]"
          >
            <Image src={waIcon} alt="wa" width={16} height={16} />
          </a>
          <a
            href={`tel:${order.user_mobile}`}
            className="size-9 rounded-full border border-[#E6EBE9] dark:border-white/10 flex items-center justify-center text-[#0B5345] dark:text-[#6EE7B7] hover:bg-[#F3F9F6]"
          >
            <Phone className="size-4" />
          </a>

          <button
            type="button"
            onClick={onOpenNotes}
            className="h-9 px-3 rounded-full border border-[#E6EBE9] dark:border-white/10 text-[12.5px] font-bold text-[#374151] dark:text-white/80 inline-flex items-center gap-1.5 hover:border-[#0B5345]/30"
          >
            <MessageSquarePlus className="size-3.5" />
            إضافة ملاحظة
          </button>

          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-9 px-3 rounded-full border border-[#E6EBE9] dark:border-white/10 text-[12.5px] font-bold text-[#374151] dark:text-white/80 inline-flex items-center gap-1.5"
              >
                <MoreHorizontal className="size-3.5" />
                إجراءات
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl min-w-[180px]">
              <DropdownMenuItem
                className="cursor-pointer font-bold"
                onSelect={() => toast.message("واجهة تجريبية")}
              >
                إجراءات سريعة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <OrderActionsMenu order={order} onStatusChange={onStatusChange} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTION_PILLS.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => toast.message(`${pill.label} (واجهة تجريبية)`)}
            className="h-9 px-3 rounded-full border border-[#E6EBE9] dark:border-white/10 bg-white dark:bg-white/[0.03] text-[12px] font-bold text-[#374151] dark:text-white/75 hover:border-[#0B5345]/35 inline-flex items-center gap-1.5"
          >
            <FileText className="size-3.5 opacity-60" />
            {pill.label}
          </button>
        ))}
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

function StatusSelect({ order, onStatusChange }) {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-8 px-3 rounded-full border border-[#E6EBE9] dark:border-white/10 bg-white dark:bg-white/[0.04] text-[12px] font-bold text-[#374151] dark:text-white/80 inline-flex items-center gap-1.5"
        >
          {order.status_name}
          <ChevronDown className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[220px] rounded-xl p-1 border-[#E6EBE9]"
      >
        {MOCK_ORDER_STATUSES.map((status) => {
          const active =
            status.id === order.status_id || status.label === order.status_name;
          return (
            <DropdownMenuItem
              key={status.id}
              onSelect={() => {
                if (active) return;
                onStatusChange?.(order, status);
                toast.success(`تم تغيير الحالة إلى «${status.label}» (تجريبي)`);
              }}
              className={cn(
                "rounded-lg px-3 py-2.5 cursor-pointer text-[13px] font-bold justify-end",
                active
                  ? "bg-[#1D63D2] text-white focus:bg-[#1D63D2] focus:text-white"
                  : "text-[#374151]"
              )}
            >
              {status.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
