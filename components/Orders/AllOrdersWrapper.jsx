"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Ban, CheckCircle2, ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
import {
  ControllableDataTable,
  useTablePreferences,
} from "@/components/shared/controllable-table";
import RealtimeOrdersToolbar from "@/components/RealtimeOrders/RealtimeOrdersToolbar";
import WhatsAppPaymentLinkDialog from "@/components/RealtimeOrders/WhatsAppPaymentLinkDialog";
import {
  mapRealtimeTableOrder,
} from "@/components/RealtimeOrders/map-realtime-order";
import { cn } from "@/lib/utils";
import { useIsDark, useToggleTheme } from "@/src/hooks/useThemeMode";
import { useContractStatuses } from "@/src/hooks/use-contract-statuses";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  ALL_ORDERS_QUERY_KEY,
  buildAdminOrdersParams,
  buildAdminOrdersUrl,
  useRealtimeOrdersList,
} from "@/src/hooks/use-realtime-new-orders";
import { axiosInstance } from "@/src/utils/axios";
import { useChangeOrderStatus } from "@/src/hooks/use-change-order-status";
import { getAllOrdersExtraFilterStatuses } from "@/src/lib/contract-statuses";
import ReturnRequestDialog from "@/components/Orders/return-request-dialog";
import ChangeOrderStatusFieldsDialog, {
  getStatusCaseFields,
  statusRequiresExtraFields,
} from "@/components/RealtimeOrders/ChangeOrderStatusFieldsDialog";
import ManageContractStatusesDialog from "@/components/RealtimeOrders/ManageContractStatusesDialog";
import {
  canRequestOrderReturn,
  isReturnContractStatus,
  normalizeOrderForReturnRequest,
} from "@/components/analysis/returned/refund-contract-utils";
import { openDialogAfterMenuClose } from "@/src/lib/open-dialog-after-menu-close";
import {
  exportOrdersToExcel,
  extractStandardOrderPage,
} from "@/components/Orders/shared/orders-export";
import { usePaginatedExport } from "@/components/Orders/shared/use-paginated-export";
import { printOrderContract } from "@/components/Orders/single-order/print-contract";
import { buildAllOrderColumns } from "./all-orders-columns";

const TABLE_STORAGE_KEY = "all-orders-table-prefs";
const COMPLETION_FILTERS = ["authenticated", "incomplete"];
const STATUS_PILLS = ["canceled", "returned"];
const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100];
const DEFAULT_PER_PAGE = 20;

export const ALL_ORDERS_FILTER_PILLS = [
  { id: "authenticated", label: "موثق", Icon: CheckCircle2 },
  { id: "canceled", label: "ملغي", Icon: Ban },
  { id: "returned", label: "مسترجع", Icon: Undo2 },
  { id: "incomplete", label: "طلب غير مكتمل", Icon: AlertCircle },
];

const PILL_PERMISSIONS = {
  authenticated: PERMISSION_SECTIONS.request_classification,
  canceled: PERMISSION_SECTIONS.request_classification,
  returned: PERMISSION_SECTIONS.returned_request,
  incomplete: PERMISSION_SECTIONS.incomplete_request,
};

function AllOrdersPagination({
  pagination,
  currentPage,
  onPageChange,
  perPage,
  onPerPageChange,
  dark,
}) {
  const total = pagination?.total ?? 0;
  const lastPage = Math.max(1, pagination?.last_page ?? 1);
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const btnClass = (active) =>
    cn(
      "size-9 rounded-full flex items-center justify-center text-[13px] font-medium transition-all",
      active
        ? "bg-[#0B5345] text-white"
        : dark
          ? "border border-white/10 text-white/55 hover:bg-white/10"
          : "border border-[#E4E4E4] text-[#A3A3A3] hover:bg-[#f5f5f5]"
    );

  return (
    <div
      className="flex items-center justify-between gap-3 flex-wrap mt-1"
      dir="rtl"
    >
      <p
        className={cn(
          "text-[13px] font-medium",
          dark ? "text-white/45" : "text-[#6B7280]"
        )}
      >
        عرض{" "}
        <span className="tabular-nums font-bold text-[#0B5345] dark:text-[#6EE7B7]">
          {from}-{to}
        </span>{" "}
        من{" "}
        <span className="tabular-nums font-bold">{total}</span> طلب
      </p>

      <div className="flex items-center gap-3">
        <label
          className={cn(
            "flex items-center gap-2 text-[12.5px] font-bold",
            dark ? "text-white/55" : "text-[#6B7280]"
          )}
        >
          صفوف/صفحة
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className={cn(
              "h-9 rounded-full border px-3 text-[13px] font-bold bg-transparent",
              dark
                ? "border-white/10 text-white"
                : "border-[#E4E4E4] text-[#111827]"
            )}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={btnClass(false)}
            aria-label="السابق"
          >
            <ChevronRight className="size-4" />
          </button>
          <span
            className={cn(
              "min-w-[52px] text-center text-[13px] font-bold tabular-nums",
              dark ? "text-white/80" : "text-[#111827]"
            )}
          >
            {currentPage} / {lastPage}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
            disabled={currentPage >= lastPage}
            className={btnClass(false)}
            aria-label="التالي"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllOrdersWrapper() {
  const router = useRouter();
  const isDark = useIsDark();
  const { toggleTheme } = useToggleTheme();
  const { can, isAdmin } = usePermissions();

  const canChangeStatus =
    isAdmin ||
    can(PERMISSION_SECTIONS.request_classification, "edit") ||
    can(PERMISSION_SECTIONS.all_requests, "edit");
  const canAddStatus =
    isAdmin || can(PERMISSION_SECTIONS.request_classification, "create");
  const canEditStatus =
    isAdmin || can(PERMISSION_SECTIONS.request_classification, "edit");
  const canManageStatuses = canAddStatus || canEditStatus;
  const canExport =
    isAdmin ||
    can(PERMISSION_SECTIONS.all_requests, "view") ||
    can(PERMISSION_SECTIONS.completed_request, "view") ||
    can(PERMISSION_SECTIONS.incomplete_request, "view") ||
    can(PERMISSION_SECTIONS.request_classification, "view") ||
    can(PERMISSION_SECTIONS.returned_request, "view");
  const canReturn =
    isAdmin ||
    can(PERMISSION_SECTIONS.returned_request, "create") ||
    can(PERMISSION_SECTIONS.returned_request, "edit");

  const visiblePills = ALL_ORDERS_FILTER_PILLS.filter((pill) => {
    const section = PILL_PERMISSIONS[pill.id];
    if (!section) return true;
    return isAdmin || can(section, "view");
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [extraStatusId, setExtraStatusId] = useState(null);
  const [contractType, setContractType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);
  const [paymentLinkOpen, setPaymentLinkOpen] = useState(false);
  const [statusFieldsOpen, setStatusFieldsOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [manageStatusesOpen, setManageStatusesOpen] = useState(false);

  const {
    activeItems: statusItems,
    returnedStatusId,
    canceledStatusId,
  } = useContractStatuses();

  const extraStatuses = useMemo(
    () => getAllOrdersExtraFilterStatuses(statusItems),
    [statusItems]
  );

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeFilters, extraStatusId, contractType, perPage]);

  const listParams = useMemo(() => {
    const hasAuthenticated = activeFilters.includes("authenticated");
    const hasIncomplete = activeFilters.includes("incomplete");
    const hasReturned = activeFilters.includes("returned");
    const hasCanceled = activeFilters.includes("canceled");
    const hasExtraStatus = extraStatusId != null && extraStatusId !== "";

    return buildAdminOrdersParams({
      page: currentPage,
      perPage,
      search: debouncedSearch,
      isCompleted: hasAuthenticated ? 1 : hasIncomplete ? 0 : undefined,
      statusId: hasExtraStatus
        ? extraStatusId
        : hasCanceled
          ? canceledStatusId
          : hasReturned
            ? returnedStatusId
            : undefined,
      contractType: contractType || undefined,
    });
  }, [
    activeFilters,
    canceledStatusId,
    contractType,
    currentPage,
    debouncedSearch,
    extraStatusId,
    perPage,
    returnedStatusId,
  ]);

  const {
    items: tableItems,
    pagination,
    isLoading: tableLoading,
  } = useRealtimeOrdersList({
    params: listParams,
    queryKey: ALL_ORDERS_QUERY_KEY,
  });

  const tableOrders = useMemo(
    () => tableItems.map(mapRealtimeTableOrder),
    [tableItems]
  );

  const goToDetails = (row) => {
    router.push(`/home/orders/${row.id ?? row.uuid}`);
  };

  const {
    mutate: changeStatus,
    isPending: isChangingStatus,
    variables: changingStatusId,
  } = useChangeOrderStatus({
    queryKey: [ALL_ORDERS_QUERY_KEY],
    onSuccess: () => {
      setStatusFieldsOpen(false);
      setPendingStatusChange(null);
    },
  });

  const handleStatusChange = (row, status) => {
    const menuStatus = {
      id: status.id,
      name: status.name ?? status.label,
      label: status.label ?? status.name,
      color: status.color,
      status_case: status.status_case ?? null,
    };

    if (isReturnContractStatus(menuStatus)) {
      if (!canReturn) {
        toast.error("ليست لديك صلاحية طلب الاسترجاع");
        return;
      }
      const normalized = normalizeOrderForReturnRequest(row, row?.id);
      if (!canRequestOrderReturn(normalized)) {
        toast.info("يوجد طلب استرجاع مسبقاً لهذا الطلب");
        return;
      }
      setReturnOrder(normalized);
      openDialogAfterMenuClose(() => setReturnDialogOpen(true));
      return;
    }

    if (statusRequiresExtraFields(menuStatus)) {
      setPendingStatusChange({ order: row, status: menuStatus });
      openDialogAfterMenuClose(() => setStatusFieldsOpen(true));
      return;
    }

    changeStatus({ orderId: row.id, statusId: status.id });
  };

  const handlePrint = async (row) => {
    if (!row?.id) {
      toast.error("لا توجد بيانات للطباعة");
      return;
    }
    try {
      const res = await axiosInstance.get(`/admin/orders/${row.id}`);
      const orderData = res?.data?.data ?? res?.data;
      const opened = printOrderContract(orderData);
      if (!opened) toast.error("تعذر فتح نافذة الطباعة");
    } catch (error) {
      toast.error(error?.response?.data?.message || "تعذر تحميل بيانات الطباعة");
    }
  };

  const handleToggleFilter = (id) => {
    setActiveFilters((prev) => {
      const isOn = prev.includes(id);
      if (isOn) return prev.filter((item) => item !== id);

      if (STATUS_PILLS.includes(id)) setExtraStatusId(null);

      let next = prev;
      if (COMPLETION_FILTERS.includes(id)) {
        next = next.filter((item) => !COMPLETION_FILTERS.includes(item));
      }
      if (STATUS_PILLS.includes(id)) {
        next = next.filter((item) => !STATUS_PILLS.includes(item));
      }
      return [...next, id];
    });
  };

  const handleExtraStatusChange = (statusId) => {
    setExtraStatusId(statusId);
    if (statusId != null) {
      setActiveFilters((prev) =>
        prev.filter((item) => !STATUS_PILLS.includes(item))
      );
    }
  };

  const exportParams = useMemo(() => {
    const params = { ...listParams };
    delete params.page;
    delete params.per_page;
    return params;
  }, [listParams]);

  const { handleExport, isExporting } = usePaginatedExport({
    buildUrl: (page) => buildAdminOrdersUrl({ ...exportParams, page }),
    extractPage: extractStandardOrderPage,
    onExport: (rows) =>
      exportOrdersToExcel(rows, {
        filename: "جميع-الطلبات",
        showStatusColumn: true,
      }),
  });

  const columns = useMemo(
    () =>
      buildAllOrderColumns({
        dark: isDark,
        onView: goToDetails,
        onStatusChange: handleStatusChange,
        onPrint: handlePrint,
        statuses: statusItems,
        changingOrderId: isChangingStatus ? changingStatusId?.orderId : null,
        canChangeStatus,
        canAddStatus,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDark, statusItems, isChangingStatus, changingStatusId, canChangeStatus, canAddStatus]
  );

  const {
    density,
    setDensity,
    visibleColumns,
    toggleColumn,
    isColumnVisible,
  } = useTablePreferences({
    storageKey: TABLE_STORAGE_KEY,
    columns,
  });

  return (
    <div
      className="flex flex-col gap-4 min-h-full transition-colors -m-[45px] p-[45px] max-[1700px]:-m-[30px] max-[1700px]:p-[30px] bg-[#F4F6F5] dark:bg-[#0B1411]"
      dir="rtl"
    >
      <RealtimeOrdersToolbar
        title="جميع الطلبات"
        searchPlaceholder="بحث: رقم الطلب / الجوال / الاسم..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        filterPills={visiblePills}
        extraStatuses={extraStatuses}
        extraStatusId={extraStatusId}
        onExtraStatusChange={handleExtraStatusChange}
        contractType={contractType}
        onContractTypeChange={setContractType}
        columns={columns}
        density={density}
        onDensityChange={setDensity}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onExport={handleExport}
        isExporting={isExporting}
        canExport={canExport}
        dark={isDark}
        onToggleTheme={toggleTheme}
        onOpenPaymentLink={() => setPaymentLinkOpen(true)}
        canManageStatuses={canManageStatuses}
        onManageStatuses={() => setManageStatusesOpen(true)}
      />

      <ControllableDataTable
        columns={columns}
        data={tableOrders}
        density={density}
        isColumnVisible={isColumnVisible}
        isLoading={tableLoading}
        emptyMessage="لا توجد طلبات مطابقة للبحث"
        onRowClick={goToDetails}
      />

      <AllOrdersPagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        perPage={perPage}
        onPerPageChange={setPerPage}
        dark={isDark}
      />

      <ReturnRequestDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        order={returnOrder}
        orderId={returnOrder?.id}
        queryKey={[ALL_ORDERS_QUERY_KEY]}
      />

      <WhatsAppPaymentLinkDialog
        open={paymentLinkOpen}
        onOpenChange={setPaymentLinkOpen}
      />

      <ChangeOrderStatusFieldsDialog
        open={statusFieldsOpen}
        onOpenChange={(next) => {
          setStatusFieldsOpen(next);
          if (!next) setPendingStatusChange(null);
        }}
        status={pendingStatusChange?.status}
        isPending={isChangingStatus}
        onSubmit={(extraValues) => {
          if (!pendingStatusChange) return;
          changeStatus({
            orderId: pendingStatusChange.order.id,
            statusId: pendingStatusChange.status.id,
            extraValues,
            fields: getStatusCaseFields(pendingStatusChange.status),
          });
        }}
      />

      <ManageContractStatusesDialog
        open={manageStatusesOpen}
        onOpenChange={setManageStatusesOpen}
        canCreate={canAddStatus}
        canEdit={canEditStatus}
      />
    </div>
  );
}
