"use client";

import greenRial from "@/public/images/greenRial.svg";
import waIcon from "@/public/images/waIcon.svg";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import ChangeStatusDialog from "../change-status-dialog";
import ChangeDraftStatusDialog from "../change-draft-status-dialog";
import {
  getContractTypeBadgeClass,
  getDocumentTypeBadgeClass,
  getOrderStatusBadgeStyle,
} from "./orders-status-utils";
import {
  getDraftOrderStatusColor,
  getDraftOrderStatusLabel,
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
      <div className="flex items-center gap-1.5 text-[#10B981] font-bold text-[13px]">
        <i className="fa-solid fa-circle-check text-[12px]" />
        <span>{row?.payment_label_ar || "لم يتم الدفع"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[13px]">
      <i className="fa-solid fa-circle-check text-[12px]" />
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
    <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4] shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-[#FAFAFA]">
          <tr>
            {selectable && (
              <th className="p-[15px_20px] border-b border-[#E4E4E4] w-[52px]">
                <Checkbox
                  checked={
                    pageSelectionState.some
                      ? "indeterminate"
                      : pageSelectionState.all
                  }
                  onCheckedChange={(checked) => onTogglePage?.(orders, checked === true)}
                  aria-label="تحديد كل الطلبات في الصفحة"
                  className="border-[#C4C4C4] data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]"
                />
              </th>
            )}
            {tableHeaders.slice(selectable ? 1 : 0).map((header, index) => (
              <th
                key={index}
                className="text-right p-[15px_20px] text-[#A3A3A3] text-[13px] font-medium border-b border-[#E4E4E4] whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={tableHeaders.length} className="text-center p-8 text-[#A3A3A3] text-sm">
                لا توجد طلبات متوفرة حالياً
              </td>
            </tr>
          ) : (
            orders.map((row) => {
              const statusName =
                statusMode === "draft"
                  ? getDraftOrderStatusLabel(row)
                  : row?.status?.name || row?.contract_status_name || "قيد المعالجة";
              const statusStyle = getOrderStatusBadgeStyle(
                statusName,
                statusMode === "draft" ? getDraftOrderStatusColor(row) : row?.status?.color
              );

              const rowSelected = selectable && isSelected?.(row.id);

              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all cursor-pointer ${
                    rowSelected ? "bg-[#F0FDF4]" : ""
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
                        className="border-[#C4C4C4] data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]"
                      />
                    </td>
                  )}
                  <td className="p-[15px_20px]">
                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#f9f9f9] rounded-lg w-fit mx-auto border border-[#eee]">
                      <span className="text-black text-[12px] font-bold">{row?.uuid}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(row?.uuid);
                          toast.success("تم نسخ رقم الطلب");
                        }}
                        className="text-[#A3A3A3] hover:text-brand-main"
                      >
                        <i className="fa-regular fa-copy text-[11px]" />
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
                      <span className="text-black text-[13px]" dir="ltr">
                        {row?.user_mobile}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(row?.user_mobile);
                          toast.success("تم نسخ رقم الجوال");
                        }}
                        className="text-[#A3A3A3] hover:text-brand-main"
                      >
                        <i className="fa-regular fa-copy text-[11px]" />
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
                  <td className="p-[15px_20px] text-[13px] text-black font-medium whitespace-nowrap">
                    {formatRelativeTime(row?.updated_at)}
                  </td>
                  {showStatusColumn && (
                    <td className="p-[15px_20px]">
                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                        style={statusStyle}
                      >
                        {statusName}
                      </span>
                    </td>
                  )}
                  <td className="p-[15px_20px]">
                    <span className="text-[13px] text-[#4D4D4D] font-medium">
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
                      <button
                        type="button"
                        onClick={() => onRowClick?.(row)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5] text-[18px] leading-none hover:bg-brand-main hover:scale-105 transition-all"
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
