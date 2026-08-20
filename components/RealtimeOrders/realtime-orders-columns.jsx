"use client";

import Image from "next/image";
import { toast } from "sonner";
import {
  Check,
  Clock,
  Copy,
  X,
} from "lucide-react";
import greenRial from "@/public/images/greenRial.svg";
import { cn } from "@/lib/utils";
import { RT } from "./theme";
import OrderActionsMenu from "./OrderActionsMenu";

function formatRelativeShort(dateString) {
  if (!dateString) return "---";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `${days} يوم`;
}

function getReceivedUrgency(dateString) {
  const hours = (Date.now() - new Date(dateString).getTime()) / 3_600_000;
  if (hours >= 24) return "critical";
  if (hours >= 3) return "warn";
  return "ok";
}

// Fallback badge colors when the API doesn't supply status.color — mirrors
// design.html's .schip status-dot palette (.s-received/.s-draftrev/.s-raised/...)
function statusBadgeStyle(name = "", apiColor, apiTextColor) {
  if (apiColor) {
    return {
      backgroundColor: `${apiColor}26`,
      color: apiTextColor || apiColor,
    };
  }
  const dotColor = name.includes("مستلم")
    ? RT.statusDot.received
    : name.includes("مسودة")
      ? RT.statusDot.draftrev
      : name.includes("تحديث") || name.includes("مرفوع")
        ? RT.statusDot.raised
        : name.includes("ملغ")
          ? RT.statusDot.cancelled
          : name.includes("مسترجع") || name.includes("استرجاع")
            ? RT.statusDot.refunded
            : name.includes("موثق") || name.includes("مكتمل")
              ? RT.statusDot.done
              : "#4B5563";
  return { backgroundColor: "#F1F3F2", color: dotColor };
}

/**
 * Column definitions for the realtime orders controllable table.
 */
export function buildRealtimeOrderColumns({
  onView,
  onStatusChange,
  statuses,
  changingOrderId,
  canChangeStatus = true,
  canAddStatus = false,
  dark = false,
} = {}) {
  return [
    {
      id: "contractType",
      label: "نوع العقد",
      hideable: false,
      cell: (row) => (
        <span
          className={cn(
            "font-bold",
            dark ? "text-white/85" : "text-[#374151]"
          )}
        >
          {row?.contract_type || "---"}
        </span>
      ),
    },
    {
      id: "orderNumber",
      label: "رقم الطلب",
      hideable: false,
      cell: (row) => (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className="font-black tabular-nums"
              style={{ color: dark ? "#6EE7B7" : RT.brand }}
            >
              #{row?.uuid}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(String(row?.uuid ?? ""));
                toast.success("تم نسخ رقم الطلب");
              }}
              className={cn(
                "transition-colors",
                dark
                  ? "text-white/30 hover:text-white/70"
                  : "text-[#9CA3AF] hover:text-[#0B5345]"
              )}
              aria-label="نسخ"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
          {row?.is_draft ? (
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold"
              style={{ backgroundColor: RT.draftBg, color: RT.draftText }}
            >
              طلب مسودة
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "payment",
      label: "الدفع",
      hideable: true,
      cell: (row) => {
        const paid = row?.is_paid === true || row?.is_paid === 1;
        if (paid) {
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: RT.successBg, color: RT.success }}
              >
                <Check className="size-3" strokeWidth={2.75} />
                مدفوع
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-[12px] text-[#007C13]">
                {row?.amount_payment}
                <Image src={greenRial} alt="rial" width={11} height={11} />
              </span>
            </div>
          );
        }
        return (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: RT.dangerBg, color: RT.danger }}
          >
            <X className="size-3" strokeWidth={2.75} />
            غير مدفوع
          </span>
        );
      },
    },
    {
      id: "receivedSince",
      label: "مستلم منذ",
      hideable: true,
      cell: (row) => {
        const label = row?.received_since || formatRelativeShort(row?.received_at);
        const urgency = getReceivedUrgency(row?.received_at);
        const styles =
          urgency === "critical"
            ? { bg: RT.dangerBg, color: RT.danger }
            : urgency === "warn"
              ? { bg: RT.amberBadgeBg, color: RT.amberBadgeText }
              : {
                  bg: dark ? "rgba(255,255,255,0.06)" : "#F3F4F6",
                  color: dark ? "rgba(255,255,255,0.65)" : "#4B5563",
                };
        return (
          <span
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: styles.bg, color: styles.color }}
          >
            <Clock className="size-3" strokeWidth={2.5} />
            {label}
          </span>
        );
      },
    },
    {
      id: "orderStatus",
      label: "حالة الطلب",
      hideable: true,
      cell: (row) => {
        const name = row?.status_name || "---";
        const style = statusBadgeStyle(
          name,
          row?.status_color || row?.status?.color,
          row?.status_color_text || row?.status?.color_text
        );
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
            style={style}
          >
            <span
              className="size-1.5 rounded-full shrink-0"
              style={{ backgroundColor: style.color }}
            />
            {name}
          </span>
        );
      },
    },
    {
      id: "receivedBy",
      label: "مستلم من",
      hideable: true,
      cell: (row) => (
        <span
          className={cn(
            "font-medium",
            dark ? "text-white/70" : "text-[#4B5563]"
          )}
        >
          {row?.employee_name || "---"}
        </span>
      ),
    },
    {
      id: "actions",
      label: "الإجراءات",
      hideable: false,
      stopRowClick: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onView?.(row)}
            className="h-8 px-3 rounded-lg text-[12px] font-bold transition-colors"
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
        </div>
      ),
    },
  ];
}
