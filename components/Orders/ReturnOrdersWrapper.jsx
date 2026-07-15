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
import SendOrderSmsButton from "@/components/Orders/shared/send-order-sms-button";
import {
  RefundApprovedSuccessDialog,
  RefundRetractSuccessDialog,
} from "@/components/analysis/returned/refund-contract-success-dialog";
import {
  REFUNDS_CONTRACTS_API,
  buildRefundsLookup,
  ensureReturnOrderRefund,
  extractRefundsContractsPayload,
  getOrderAdminApprovalStatus,
  hasExistingReturnRequest,
  isAdminRefundApproved,
  mapAnalyticsRefundContractToOrderRow,
  mapCreatedAtFilter,
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
import OrdersStatusCards from "./shared/orders-status-cards";

const APPROVAL_TABS = [
  {
    id: "not_approved",
    name: "لم تتم الموافقة",
    color: "#F59E0B",
    color_text: "#FFFFFF",
  },
  {
    id: "approved",
    name: "تمت الموافقة",
    color: "#10B981",
    color_text: "#FFFFFF",
  },
];

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
  if (!hasExistingReturnRequest(row) && row?.admin_confirmed == null) {
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

function resolveCreatedAt(param) {
  if (!param) return "today";
  if (param === "total") return "all";
  if (param === "day") return "today";
  return mapCreatedAtFilter(param);
}

export default function ReturnOrdersWrapper({ searchParams }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [resolvedParams, setResolvedParams] = useState(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(emptyAdvancedFilters);
  const [successDialog, setSuccessDialog] = useState(null);
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
  }, [debouncedSearchQuery, createdAtParam, advancedFilters, approvalFilter]);

  useEffect(() => {
    clear();
  }, [debouncedSearchQuery, createdAtParam, advancedFilters, approvalFilter, clear]);

  function getReturnOrders(page = 1) {
    const createdAt = resolveCreatedAt(createdAtParam);
    const params = new URLSearchParams({
      created_at: createdAt,
      page: String(page),
    });

    // Backend filter aliases (whichever the API supports)
    if (approvalFilter === "approved") {
      params.set("admin_confirmed", "1");
      params.set("management_approval", "approved");
    } else if (approvalFilter === "not_approved") {
      params.set("admin_confirmed", "0");
      params.set("management_approval", "not_approved");
    }

    if (debouncedSearchQuery) {
      params.set("search", debouncedSearchQuery);
    }

    return axiosInstance
      .get(`${REFUNDS_CONTRACTS_API}?${params.toString()}`)
      .then((res) => res.data);
  }

  const returnOrdersQueryKey = [
    "returnOrders",
    currentPage,
    createdAtParam,
    debouncedSearchQuery,
    approvalFilter,
  ];

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: returnOrdersQueryKey,
    queryFn: () => getReturnOrders(currentPage),
    enabled: isResolved,
  });

  const payload = useMemo(
    () => extractRefundsContractsPayload(responseData),
    [responseData]
  );

  const items = useMemo(() => {
    const rows = (payload.contracts || [])
      .map(mapAnalyticsRefundContractToOrderRow)
      .filter(Boolean);

    if (!approvalFilter) return rows;

    // Always filter client-side — API may ignore approval query params
    return rows.filter((row) => {
      const approved = isAdminRefundApproved(getOrderAdminApprovalStatus(row));
      if (approvalFilter === "approved") return approved;
      if (approvalFilter === "not_approved") return !approved;
      return true;
    });
  }, [payload.contracts, approvalFilter]);

  const pagination = useMemo(() => {
    const apiPagination = payload.pagination;
    const approval = payload.managementApproval ?? {};
    const filteredTotal =
      approvalFilter === "approved"
        ? (approval?.approved?.count ?? items.length)
        : approvalFilter === "not_approved"
          ? (approval?.not_approved?.count ?? items.length)
          : (approval?.total ?? apiPagination?.total ?? items.length);

    if (!apiPagination) {
      return {
        current_page: currentPage,
        last_page: 1,
        per_page: items.length || 20,
        total: filteredTotal,
      };
    }

    return {
      ...apiPagination,
      total: filteredTotal,
    };
  }, [
    payload.pagination,
    payload.managementApproval,
    approvalFilter,
    items.length,
    currentPage,
  ]);

  const approvalCounts = useMemo(() => {
    const approval = payload.managementApproval ?? {};
    return {
      not_approved: approval?.not_approved?.count ?? 0,
      approved: approval?.approved?.count ?? 0,
    };
  }, [payload.managementApproval]);

  const allApprovalTotal = useMemo(() => {
    const approval = payload.managementApproval ?? {};
    if (approval?.total != null) return approval.total;
    return (
      Number(approval?.approved?.count ?? 0) +
      Number(approval?.not_approved?.count ?? 0)
    );
  }, [payload.managementApproval]);

  const refundsLookup = useMemo(
    () => buildRefundsLookup(payload.contracts || []),
    [payload.contracts]
  );

  const filteredItems = useMemo(
    () => applyAdvancedFilters(items, advancedFilters, { showStatusColumn: false }),
    [items, advancedFilters]
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
    if (payload.labelAr) return payload.labelAr;
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
    setApprovalFilter("");
    setAdvancedFilters(emptyAdvancedFilters);
    setShowMoreFilters(false);
    setCurrentPage(1);
    clear();
    queryClient.invalidateQueries({ queryKey: ["returnOrders"] });
    queryClient.invalidateQueries({ queryKey: ["refundContractsLookup"] });
  };

  const invalidateAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["returnOrders"] });
    queryClient.invalidateQueries({ queryKey: ["refundContractsLookup"] });
    queryClient.invalidateQueries({ queryKey: ["refundContracts"] });
  };

  const handleSuccessDialogClose = (open) => {
    if (open) return;
    setSuccessDialog(null);
    invalidateAfterSuccess();
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
        <OrdersStatusCards
          statusItems={APPROVAL_TABS}
          activeFilter={approvalFilter}
          onFilterChange={setApprovalFilter}
          countsById={approvalCounts}
          showAllCard
          allTotal={allApprovalTotal}
          gridClassName="flex flex-wrap gap-3"
        />
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
                    key={row.refund_id ?? `${row.uuid}-${row.id}`}
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
                            navigator.clipboard.writeText(String(row?.uuid ?? ""));
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
                        {row?.employee_name || "—"}
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
                          refundItems={payload.contracts || []}
                          queryKey={returnOrdersQueryKey}
                          forceShow
                          onApprovedSuccess={(approvedRefund) =>
                            setSuccessDialog({ type: "approved", refund: approvedRefund })
                          }
                          onRetractSuccess={(retractRefund) =>
                            setSuccessDialog({ type: "retract", refund: retractRefund })
                          }
                        />
                        <SendOrderSmsButton order={row} />
                        <button
                          type="button"
                          onClick={() => {
                            const targetId = row.contract_id ?? row.id;
                            if (!targetId) {
                              toast.error("تعذر فتح العقد");
                              return;
                            }
                            router.push(`/home/orders/${targetId}`);
                          }}
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

      <RefundApprovedSuccessDialog
        open={successDialog?.type === "approved"}
        onOpenChange={handleSuccessDialogClose}
        refund={successDialog?.type === "approved" ? successDialog.refund : null}
      />
      <RefundRetractSuccessDialog
        open={successDialog?.type === "retract"}
        onOpenChange={handleSuccessDialogClose}
        refund={successDialog?.type === "retract" ? successDialog.refund : null}
      />
    </div>
  );
}
