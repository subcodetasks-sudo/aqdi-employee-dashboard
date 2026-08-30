"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Check, Clock, Copy, FileText, Phone, X } from "lucide-react";
import greenRial from "@/public/images/greenRial.svg";
import waIcon from "@/public/images/waIcon.svg";
import { cn } from "@/lib/utils";
import { RT } from "@/components/RealtimeOrders/theme";
import OrderActionsMenu from "@/components/RealtimeOrders/OrderActionsMenu";
import SendOrderSmsButton from "@/components/Orders/shared/send-order-sms-button";
import ReturnAdminApprovalCell from "@/components/Orders/shared/return-admin-approval-cell";

function formatRelativeShort(dateString) {
  if (!dateString) return null;
  const diffMs = Date.now() - new Date(dateString).getTime();
  if (!Number.isFinite(diffMs)) return null;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `${days} يوم`;
}

function StatusDot({ row, dark }) {
  const color = row?.status_color || "#F59E0B";
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
      title={row?.status_name}
    />
  );
}

export function buildReturnOrderColumns({
  onView,
  onStatusChange,
  onPrint,
  statuses,
  changingOrderId,
  canChangeStatus = true,
  canAddStatus = false,
  refundsLookup,
  refundItems = [],
  exportQueryKey,
  onApprovedSuccess,
  onRetractSuccess,
  dark = false,
} = {}) {
  return [
    {
      id: "orderNumber",
      label: "رقم الطلب",
      hideable: false,
      sticky: "start",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <StatusDot row={row} dark={dark} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(String(row?.uuid ?? ""));
              toast.success("تم نسخ رقم الطلب");
            }}
            className="inline-flex items-center gap-1.5 group"
          >
            <span
              className="font-black tabular-nums"
              style={{ color: dark ? "#6EE7B7" : RT.brand }}
            >
              #{row?.uuid}
            </span>
            <Copy
              className={cn(
                "size-3.5 transition-colors",
                dark
                  ? "text-white/30 group-hover:text-white/70"
                  : "text-gray-400 group-hover:text-brand-dark"
              )}
            />
          </button>
        </div>
      ),
    },
    {
      id: "customerMobile",
      label: "جوال العميل",
      hideable: true,
      cell: (row) => {
        const mobile = row?.user_mobile;
        const digits = mobile ? String(mobile).replace(/\D/g, "") : "";
        if (!mobile) {
          return <span className={dark ? "text-white/35" : "text-gray-400"}>—</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(digits || String(mobile));
                toast.success("تم نسخ رقم الجوال");
              }}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-bold tabular-nums",
                dark ? "text-white/75" : "text-gray-700"
              )}
              dir="ltr"
            >
              <Phone className="size-3.5 opacity-60" />
              {mobile}
            </button>
            {digits ? (
              <a
                href={`https://wa.me/${digits}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="size-7 rounded-full bg-[#25D366]/15 flex items-center justify-center hover:bg-[#25D366]/25"
              >
                <Image src={waIcon} alt="" width={14} height={14} />
              </a>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "contractType",
      label: "نوع العقد",
      hideable: true,
      cell: (row) => (
        <span className={cn("font-bold", dark ? "text-white/85" : "text-gray-700")}>
          {row?.contract_type || "---"}
        </span>
      ),
    },
    {
      id: "instrumentType",
      label: "نوع الوثيقة",
      hideable: true,
      cell: (row) => (
        <span className={cn("text-xs font-medium", dark ? "text-white/65" : "text-[#4B5563]")}>
          {row?.instrument_type || "—"}
        </span>
      ),
    },
    {
      id: "payment",
      label: "الدفع",
      hideable: true,
      cell: (row) => {
        const paid = row?.is_paid === true || row?.is_paid === 1;
        const amount = row?.amount_payment;
        const showAmount = paid && amount != null && amount !== "";
        return (
          <div className="flex flex-col items-start gap-1">
            {showAmount ? (
              <span className="inline-flex items-center gap-1 font-bold text-xs tabular-nums text-[#007C13]">
                {amount}
                <Image src={greenRial} alt="rial" width={11} height={11} />
              </span>
            ) : null}
            {paid ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-11 font-bold"
                style={{ backgroundColor: RT.successBg, color: RT.success }}
              >
                <Check className="size-3" strokeWidth={2.75} />
                مدفوع
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-11 font-bold"
                style={{ backgroundColor: RT.dangerBg, color: RT.danger }}
              >
                <X className="size-3" strokeWidth={2.75} />
                غير مدفوع
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "receivedSince",
      label: "مستلم منذ",
      hideable: true,
      sortable: true,
      defaultSortDir: "asc",
      getSortValue: (row) => {
        const t = new Date(row?.received_at).getTime();
        return Number.isFinite(t) ? t : null;
      },
      cell: (row) => {
        const label = row?.received_since || formatRelativeShort(row?.received_at);
        if (!label) {
          return <span className={dark ? "text-white/35" : "text-gray-400"}>—</span>;
        }
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap",
              "bg-[#FEE2E2] text-[#B91C1C] dark:bg-red-500/15 dark:text-red-300"
            )}
          >
            <Clock className="size-3" />
            {label}
          </span>
        );
      },
    },
    {
      id: "orderStatus",
      label: "حالة الطلب",
      hideable: true,
      cell: (row) => (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap"
          style={
            dark
              ? { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }
              : { backgroundColor: "#F3F4F6", color: "#374151" }
          }
        >
          <span className="size-1.5 rounded-full bg-current opacity-70" />
          {row?.status_name || "—"}
        </span>
      ),
    },
    {
      id: "receivedBy",
      label: "مستلم من",
      hideable: true,
      cell: (row) => (
        <span className={cn("font-medium", dark ? "text-white/70" : "text-[#4B5563]")}>
          {row?.employee_name || "—"}
        </span>
      ),
    },
    {
      id: "adminApproval",
      label: "موافقة الإدارة",
      hideable: true,
      stopRowClick: true,
      cell: (row) => (
        <ReturnAdminApprovalCell
          row={row}
          refundsLookup={refundsLookup}
          refundItems={refundItems}
          exportQueryKey={exportQueryKey}
          onApprovedSuccess={onApprovedSuccess}
          dark={dark}
        />
      ),
    },
    {
      id: "actions",
      label: "الإجراءات",
      hideable: false,
      sticky: "end",
      stopRowClick: true,
      cell: (row) => {
        const canPrint = Boolean(row?.is_paid === true || row?.is_paid === 1);
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onView?.(row)}
              className="h-8 px-3 rounded-lg text-xs font-bold transition-colors"
              style={{
                backgroundColor: dark ? "rgba(16,185,129,0.12)" : RT.viewBtnBg,
                color: dark ? "#6EE7B7" : RT.viewBtnText,
              }}
            >
              عرض
            </button>
            <OrderActionsMenu
              order={row}
              onStatusChange={onStatusChange}
              statuses={statuses}
              isStatusPending={changingOrderId != null && changingOrderId === row.id}
              canChangeStatus={canChangeStatus}
              canAddStatus={canAddStatus}
            />
            <SendOrderSmsButton order={row} />
            {canPrint ? (
              <button
                type="button"
                onClick={() => onPrint?.(row)}
                aria-label="طباعة العقد"
                title="طباعة العقد"
                className={cn(
                  "size-8 rounded-lg border flex items-center justify-center transition-colors",
                  "border-surface-border-soft text-status-neutral hover:text-brand-dark hover:border-brand-dark/30",
                  "dark:border-white/10 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
                )}
              >
                <FileText className="size-4" />
              </button>
            ) : null}
          </div>
        );
      },
    },
  ];
}
