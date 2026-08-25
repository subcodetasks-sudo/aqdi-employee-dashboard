"use client";

import greenRial from "@/public/images/greenRial.svg";
import waIcon from "@/public/images/waIcon.svg";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import ChangeStatusDialog from "../change-status-dialog";
import ChangeDraftStatusDialog from "../change-draft-status-dialog";
import SendOrderSmsButton from "./send-order-sms-button";
import {
  getContractTypeBadgeClass,
  getDocumentTypeBadgeClass,
  getOrderStatusBadgeStyle,
} from "./orders-status-utils";
import {
  getDraftOrderStatusColor,
  getDraftOrderStatusLabel,
  getDraftRowHighlightStyle,
  isDraftOrderRow,
} from "@/src/lib/draft-contract-statuses";

function formatRelativeTime(dateString) {
  if (!dateString) return "---";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes}د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} ي`;
}

function PaymentCell({ row }) {
  const isPaid =
    row?.is_paid === true ||
    row?.is_paid === 1 ||
    (row?.amount_payment && row?.is_paid !== false && row?.is_paid !== 0);

  if (!isPaid) {
    return (
      <div className="flex items-center gap-1.5 text-brand-accent font-bold text-13">
        <i className="fa-solid fa-circle-check text-xs" />
        <span>{row?.payment_label_ar || "لم يتم الدفع"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-13">
      <i className="fa-solid fa-circle-check text-xs" />
      <span>{row?.amount_payment}</span>
      <Image src={greenRial} alt="rial" width={14} height={14} />
    </div>
  );
}

export default function OrdersTable({
  orders = [],
  showStatusColumn = true,
  showChangeStatus = true,
  statusMode = "contract",
  queryKey = ["orders"],
  onRowClick,
  selectable = false,
  isSelected,
  onToggleRow,
  onTogglePage,
  pageSelectionState = { all: false, some: false },
  highlightDraftRows = true,
}) {
  const tableHeaders = [
    ...(selectable ? [""] : []),
    "رقــم الطلب",
    "رقــم جوال العميل",
    "نــوع العقــد",
    "نـوع الوثيقة",
    "الدفـــع",
    "مستلم منذ",
    ...(showStatusColumn ? ["حــالة الطلب"] : []),
    "الاسـتلام",
    "الاجـــراءات",
  ];

  return (
    <div className="w-full overflow-x-auto bg-white rounded-3xl border border-neutral-200 shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-neutral-50">
          <tr>
            {selectable && (
              <th className="p-[15px_20px] border-b border-neutral-200 w-13">
                <Checkbox
                  checked={
                    pageSelectionState.some
                      ? "indeterminate"
                      : pageSelectionState.all
                  }
                  onCheckedChange={(checked) => onTogglePage?.(orders, checked === true)}
                  aria-label="تحديد كل الطلبات في الصفحة"
                  className="border-[#C4C4C4] data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent"
                />
              </th>
            )}
            {tableHeaders.slice(selectable ? 1 : 0).map((header, index) => (
              <th
                key={index}
                className="text-right p-[15px_20px] text-ink-placeholder text-13 font-medium border-b border-neutral-200 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={tableHeaders.length} className="text-center p-8 text-ink-placeholder text-sm">
                لا توجد طلبات متوفرة حالياً
              </td>
            </tr>
          ) : (
            orders.map((row) => {
              const statusName =
                statusMode === "draft"
                  ? getDraftOrderStatusLabel(row)
                  : row?.status?.name || row?.contract_status_name || "قيد المعالجة";
              const draftStatusColor = getDraftOrderStatusColor(row);
              const statusStyle = getOrderStatusBadgeStyle(
                statusName,
                statusMode === "draft" ? draftStatusColor : row?.status?.color
              );

              const rowSelected = selectable && isSelected?.(row.id);
              const isKnownDraft = isDraftOrderRow(row);
              const showDraftBadge =
                highlightDraftRows && isKnownDraft && statusMode !== "draft";
              const tintDraftRow =
                !rowSelected &&
                (statusMode === "draft" ||
                  (highlightDraftRows && isKnownDraft));
              const draftHighlightStyle = tintDraftRow
                ? getDraftRowHighlightStyle(
                    statusMode === "draft" ? draftStatusColor : "#F59E0B"
                  )
                : undefined;

              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  style={draftHighlightStyle}
                  className={`border-b border-neutral-100 last:border-0 transition-all cursor-pointer ${
                    rowSelected
                      ? "bg-[#F0FDF4]"
                      : tintDraftRow
                        ? "hover:brightness-[0.98]"
                        : "hover:bg-neutral-50"
                  }`}
                >
                  {selectable && (
                    <td
                      className="p-[15px_20px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={rowSelected}
                        onCheckedChange={() => onToggleRow?.(row)}
                        aria-label={`تحديد الطلب ${row?.uuid}`}
                        className="border-[#C4C4C4] data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent"
                      />
                    </td>
                  )}
                  <td className="relative p-[15px_20px]">
                    {showDraftBadge ? (
                      <span className="absolute top-2 left-2 z-10 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[9px] font-bold text-[#B45309] ring-1 ring-[#F59E0B]/40 shadow-sm">
                        مسودة
                      </span>
                    ) : null}
                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-surface-input rounded-lg w-fit mx-auto border border-[#eee]">
                      <span className="text-black text-xs font-bold">{row?.uuid}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(row?.uuid);
                          toast.success("تم نسخ رقم الطلب");
                        }}
                        className="text-ink-placeholder hover:text-brand-main"
                      >
                        <i className="fa-regular fa-copy text-11" />
                      </button>
                    </div>
                  </td>
                  <td className="p-[15px_20px]">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`https://wa.me/${row?.user_mobile}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:scale-110 transition-all"
                      >
                        <Image src={waIcon} alt="wa" width={16} height={16} />
                      </Link>
                      <span className="text-black text-13" dir="ltr">
                        {row?.user_mobile}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(row?.user_mobile);
                          toast.success("تم نسخ رقم الجوال");
                        }}
                        className="text-ink-placeholder hover:text-brand-main"
                      >
                        <i className="fa-regular fa-copy text-11" />
                      </button>
                    </div>
                  </td>
                  <td className="p-[15px_20px]">
                    <span className={getContractTypeBadgeClass(row)}>
                      {row?.contract_type || "---"}
                    </span>
                  </td>
                  <td className="p-[15px_20px]">
                    <span className={getDocumentTypeBadgeClass()}>
                      {row?.instrument_type ?? "---"}
                    </span>
                  </td>
                  <td className="p-[15px_20px]">
                    <PaymentCell row={row} />
                  </td>
                  <td className="p-[15px_20px] text-13 text-black font-medium whitespace-nowrap">
                    {formatRelativeTime(row?.updated_at)}
                  </td>
                  {showStatusColumn && (
                    <td className="p-[15px_20px]">
                      <span
                        className="px-3 py-1 rounded-full text-11 font-bold whitespace-nowrap"
                        style={statusStyle}
                      >
                        {statusName}
                      </span>
                    </td>
                  )}
                  <td className="p-[15px_20px]">
                    <span className="text-13 text-ink-subtle font-medium">
                      {row?.employee_name || "---"}
                    </span>
                  </td>
                  <td className="p-[15px_20px]">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {showChangeStatus &&
                        (statusMode === "draft" ? (
                          <ChangeDraftStatusDialog orderId={row?.id} queryKey={queryKey} />
                        ) : (
                          <ChangeStatusDialog
                            orderId={row?.id}
                            order={row}
                            queryKey={queryKey}
                          />
                        ))}
                      <SendOrderSmsButton order={row} />
                      <button
                        type="button"
                        onClick={() => onRowClick?.(row)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 text-lg leading-none hover:bg-brand-main hover:scale-105 transition-all"
                        aria-label="عرض التفاصيل"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
