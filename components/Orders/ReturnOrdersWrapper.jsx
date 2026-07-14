"use client";

import React, { useEffect, useMemo, useState } from "react";
import greenRial from "@/public/images/greenRial.svg";
import orangerial from "@/public/images/orangerial.svg";
import Image from "next/image";
import waIcon from "@/public/images/waIcon.svg";
import Link from "next/link";
import Header from "../home/Header";
import { toast } from "sonner";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "../home/loader";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import RefundContractActionsMenu from "@/components/analysis/returned/refund-contract-actions-menu";
import {
  buildRefundsLookup,
  enrichReturnOrderRow,
  ensureReturnOrderRefund,
  fetchAllRefundContracts,
  findRefundInLookup,
  getOrderAdminApprovalStatus,
  hasExistingReturnRequest,
  isAdminRefundApproved,
} from "@/components/analysis/returned/refund-contract-utils";
import OrdersToolbar from "./shared/orders-toolbar";
import OrdersPagination from "./shared/orders-pagination";
import { exportReturnOrdersToExcel } from "./shared/orders-export";
import { useOrdersSelection } from "./shared/use-orders-selection";
import {
  applyAdvancedFilters,
  emptyAdvancedFilters,
} from "./shared/orders-filter-utils";
import {
  SelectableTableHeaderCheckbox,
  SelectableTableRowCheckbox,
} from "./shared/selectable-table-checkbox";

function CustomerRefundBadge({ refunded }) {
  if (refunded === true || refunded === 1) {
    return (
      <span className="px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap bg-[#E6FFE6] text-[#10B981]">
        ✅ تم المــوافقة
      </span>
    );
  }
  if (refunded === false || refunded === 0) {
    return (
      <span className="px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap bg-[#FFE6E6] text-[#EF4444]">
        ❌ لم تتم المــوافقة
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap bg-[#FFF7E6] text-[#D97706]">
      ⏳ بانتظار الاسترجاع
    </span>
  );
}

function AdminApprovalCell({ row }) {
  if (!hasExistingReturnRequest(row)) {
    return <span className="text-[13px] text-[#A3A3A3]">—</span>;
  }

  const approved = isAdminRefundApproved(getOrderAdminApprovalStatus(row));

  if (approved) {
    return (
      <span className="px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap bg-[#E6FFE6] text-[#10B981]">
        ✅ تم المــوافقة
      </span>
    );
  }

  return (
    <span className="px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap bg-[#FFE6E6] text-[#EF4444]">
      ❌ لم تتم المــوافقة
    </span>
  );
}

export default function ReturnOrdersWrapper({ searchParams }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [resolvedParams, setResolvedParams] = useState(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(emptyAdvancedFilters);
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    selectedOrders,
    selectedCount,
    isSelected,
    toggle,
    togglePage,
    clear,
    getPageSelectionState,
  } = useOrdersSelection();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchParams) {
      setIsResolved(true);
      return;
    }
    if (searchParams instanceof Promise) {
      searchParams.then((res) => {
        setResolvedParams(res);
        setIsResolved(true);
      });
    } else {
      setResolvedParams(searchParams);
      setIsResolved(true);
    }
  }, [searchParams]);

  const createdAtParam = resolvedParams?.created_at || null;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, createdAtParam, advancedFilters]);

  useEffect(() => {
    clear();
  }, [debouncedSearchQuery, createdAtParam, advancedFilters, clear]);

  function getReturnOrders(page = 1) {
    let url = `/admin/orders/return?page=${page}`;
    if (createdAtParam) {
      const createAt =
        createdAtParam === "total"
          ? "all"
          : createdAtParam === "day"
            ? "today"
            : createdAtParam;
      url += `&created_at=${createAt}`;
    }
    if (debouncedSearchQuery) {
      url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
    }
    return axiosInstance.get(url).then((res) => res.data);
  }

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["returnOrders", currentPage, createdAtParam, debouncedSearchQuery],
    queryFn: () => getReturnOrders(currentPage),
    enabled: isResolved,
  });

  const { data: refundsResponse } = useQuery({
    queryKey: ["refundContractsLookup"],
    queryFn: fetchAllRefundContracts,
    enabled: isResolved,
  });

  const rawData = responseData?.data;
  const items = rawData?.items ?? [];
  console.log(items);
  const pagination = rawData?.pagination;
  const returnOrdersQueryKey = [
    "returnOrders",
    currentPage,
    createdAtParam,
    debouncedSearchQuery,
  ];

  const refundsLookup = useMemo(() => {
    const refundItems = Array.isArray(refundsResponse) ? refundsResponse : [];
    const lookup = buildRefundsLookup(refundItems);

    for (const row of items) {
      const found = findRefundInLookup(row, lookup);
      if (!found?.refundId) continue;
      lookup.set(row.id, found);
      lookup.set(String(row.id), found);
      if (row.uuid) {
        lookup.set(row.uuid, found);
        lookup.set(String(row.uuid), found);
      }
    }

    return lookup;
  }, [refundsResponse, items]);

  const refundItems = Array.isArray(refundsResponse) ? refundsResponse : [];

  const enrichedItems = useMemo(
    () => items.map((row) => enrichReturnOrderRow(row, refundItems, refundsLookup)),
    [items, refundItems, refundsLookup]
  );

  const filteredItems = useMemo(
    () => applyAdvancedFilters(enrichedItems, advancedFilters, { showStatusColumn: false }),
    [enrichedItems, advancedFilters]
  );

  const pageSelectionState = getPageSelectionState(filteredItems);

  const exportConfig = useMemo(
    () => ({
      getSelectedOrders: () => selectedOrders,
      onExport: (rows) =>
        exportReturnOrdersToExcel(rows, { filename: "الطلبات-المسترجعة" }),
    }),
    [selectedOrders]
  );

  const getPageTitle = () => {
    if (!createdAtParam) return "الطلبات المسترجعة";
    switch (createdAtParam) {
      case "day":
        return "الطلبات المسترجعة / اليــوم";
      case "week":
        return "الطلبات المسترجعة / الأسبوع";
      case "month":
        return "الطلبات المسترجعة / الشهر";
      case "year":
        return "الطلبات المسترجعة / السنة";
      case "total":
        return "إجمالي الطلبات المسترجعة";
      default:
        return "الطلبات المسترجعة";
    }
  };

  const handleResetAll = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setAdvancedFilters(emptyAdvancedFilters);
    setShowMoreFilters(false);
    setCurrentPage(1);
    clear();
    queryClient.invalidateQueries({ queryKey: ["returnOrders"] });
    queryClient.invalidateQueries({ queryKey: ["refundContractsLookup"] });
  };

  const tableHeaders = [
    "رقــم الطلب",
    "رقــم جوال العميل",
    "نــوع العقــد",
    "الدفـــع",
    "المبــلغ المطالــب اســترجاعه",
    "تم الاستــرجــاع",
    "رافــع الطلب",
    "مــوافقة الادارة",
    "عرض العقــد",
  ];

  if (isLoading || !isResolved) return <Loader />;
  if (isError) {
    return (
      <div className="text-center p-8 text-[#FA5252] text-[15px]">
        حدث خطأ أثناء تحميل بيانات طلبات الاسترجاع
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
      <Header
        page="welcome"
        title={getPageTitle()}
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="الطلبات المسترجعة"
        secondURL="/home/return-orders"
      />

      <div className="flex flex-col gap-6 mt-4 relative z-10">
        <OrdersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          queryKeys={["returnOrders", "refundContractsLookup"]}
          showMoreFilters={showMoreFilters}
          onToggleMoreFilters={() => setShowMoreFilters((prev) => !prev)}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
          onResetAll={handleResetAll}
          showStatusField={false}
          exportConfig={exportConfig}
          selectedCount={selectedCount}
          onClearSelection={clear}
        />
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4] shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-[#FAFAFA]">
            <tr>
              <SelectableTableHeaderCheckbox
                pageSelectionState={pageSelectionState}
                onTogglePage={togglePage}
                items={filteredItems}
              />
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="text-right p-[15px_20px] text-[#A3A3A3] text-[13px] font-medium border-b border-[#E4E4E4] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((row) => {
                const isHousing =
                  row.contract_type_key === "housing" ||
                  row.contract_type === "سكنـي" ||
                  row.contract_type === "سكني";
                const refund = ensureReturnOrderRefund(row, refundsLookup);
                const customerRefunded =
                  row.customer_refunded ?? row.is_refunded ?? row.refunded;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all"
                  >
                    <SelectableTableRowCheckbox
                      row={row}
                      isSelected={isSelected}
                      onToggleRow={toggle}
                    />
                    <td className="p-[15px_20px]">
                      <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#f9f9f9] rounded-lg w-fit mx-auto border border-[#eee]">
                        <span className="text-black text-[12px] font-bold">{row?.uuid}</span>
                        <button
                          type="button"
                          onClick={() => {
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
                        <span className="text-black text-[13px]" dir="ltr">
                          {row?.user_mobile || "—"}
                        </span>
                        {row?.user_mobile ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(row.user_mobile);
                                toast.success("تم نسخ رقم الجوال");
                              }}
                              className="text-[#A3A3A3] hover:text-brand-main"
                            >
                              <i className="fa-regular fa-copy text-[11px]" />
                            </button>
                            <Link
                              href={`https://wa.me/${row.user_mobile}`}
                              target="_blank"
                              className="hover:scale-110 transition-all"
                            >
                              <Image src={waIcon} alt="wa" width={16} height={16} />
                            </Link>
                          </>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-[15px_20px]">
                      <span
                        className={`px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap ${isHousing ? "bg-[#F0E6FF] text-[#7C3AED]" : "bg-[#FFE6F0] text-[#EC4899]"}`}
                      >
                        {row?.contract_type}
                      </span>
                    </td>
                    <td className="p-[15px_20px]">
                      {row?.is_paid ? (
                        <div className="flex items-center gap-1.5 text-[#007C13] font-bold text-[13px]">
                          <span>{row?.amount_payment}</span>
                          <Image src={greenRial} alt="rial" width={14} height={14} />
                          <i className="fa-solid fa-circle-check text-[12px]" />
                        </div>
                      ) : (
                        <span className="text-[13px] font-bold text-[#EF4444]">
                          {row?.payment_label_ar || "لم يتم الدفع"}
                        </span>
                      )}
                    </td>
                    <td className="p-[15px_20px]">
                      <div className="flex items-center gap-1.5 text-brand-main font-bold text-[13px]">
                        <span>
                          {row?.refund_amount != null && row?.refund_amount !== ""
                            ? row.refund_amount
                            : "—"}
                        </span>
                        {row?.refund_amount != null && row?.refund_amount !== "" ? (
                          <Image src={orangerial} alt="rial" width={14} height={14} />
                        ) : null}
                      </div>
                    </td>
                    <td className="p-[15px_20px]">
                      <CustomerRefundBadge refunded={customerRefunded} />
                    </td>
                    <td className="p-[15px_20px]">
                      <span className="px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap bg-[#F0E6FF] text-[#7C3AED]">
                        {row?.employee_name || row?.accept_retrun_contract_employee?.name || "—"}
                      </span>
                    </td>
                    <td className="p-[15px_20px]">
                      <AdminApprovalCell row={row} />
                    </td>
                    <td className="p-[15px_20px]">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >

                          <RefundContractActionsMenu
                            refund={refund}
                            order={row}
                            refundsLookup={refundsLookup}
                            refundItems={refundItems}
                            queryKey={returnOrdersQueryKey}
                            forceShow
                          />
                        <button
                          type="button"
                          onClick={() => router.push(`/home/orders/${row.id}`)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#4D4D4D] hover:bg-brand-main hover:text-white transition-all "
                          aria-label="عرض العقد"
                        >
                          <Eye className="size-4" />
                        
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={tableHeaders.length + 1}
                  className="text-center p-8 text-[#A3A3A3] text-sm"
                >
                  لا توجد طلبات مسترجعة متوفرة حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrdersPagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
