"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ControllableDataTable,
  useTablePreferences,
} from "@/components/shared/controllable-table";
import NewRequestsSection from "./NewRequestsSection";
import RealtimeOrdersToolbar from "./RealtimeOrdersToolbar";
import { buildRealtimeOrderColumns } from "./realtime-orders-columns";
import {
  mapRealtimeNewOrder,
  mapRealtimeTableOrder,
} from "./map-realtime-order";
import { cn } from "@/lib/utils";
import { useIsDark, useToggleTheme } from "@/src/hooks/useThemeMode";
import { useContractStatuses } from "@/src/hooks/use-contract-statuses";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  REALTIME_ORDERS_QUERY_KEY,
  buildAdminOrdersParams,
  buildAdminOrdersUrl,
  useRealtimeNewOrders,
  useRealtimeOrdersList,
} from "@/src/hooks/use-realtime-new-orders";
import { useChangeOrderStatus } from "@/src/hooks/use-change-order-status";
import { getRealtimeExtraFilterStatuses } from "@/src/lib/contract-statuses";
import { useReceiveContract } from "@/src/hooks/use-receive-contract";
import { STATUS_FILTER_PILLS } from "./mock-data";
import ChangeOrderStatusFieldsDialog, {
  getStatusCaseFields,
  statusRequiresExtraFields,
} from "./ChangeOrderStatusFieldsDialog";
import ManageContractStatusesDialog from "./ManageContractStatusesDialog";
import { useUserStore } from "@/src/stores/user-store";
import ReturnRequestDialog from "@/components/Orders/return-request-dialog";
import WhatsAppPaymentLinkDialog from "./WhatsAppPaymentLinkDialog";
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

const TABLE_STORAGE_KEY = "realtime-orders-table-prefs";
const COMPLETION_FILTERS = ["authenticated", "incomplete"];

const PILL_PERMISSIONS = {
  authenticated: PERMISSION_SECTIONS.request_classification,
  returned: PERMISSION_SECTIONS.returned_request,
  incomplete: PERMISSION_SECTIONS.incomplete_request,
  myFiles: [
    PERMISSION_SECTIONS.all_requests,
    PERMISSION_SECTIONS.completed_request,
  ],
};

function TablePagination({ pagination, currentPage, onPageChange, dark }) {
  if (!pagination || pagination.last_page <= 1) return null;

  const lastPage = pagination.last_page;
  const pages = [];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(lastPage, currentPage + 1);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < lastPage) {
    if (end < lastPage - 1) pages.push("...");
    pages.push(lastPage);
  }

  const btnClass = (active) =>
    cn(
      "size-9 rounded-full flex items-center justify-center text-13 font-medium transition-all",
      active
        ? "bg-brand-dark text-white"
        : dark
          ? "border border-white/10 text-white/55 hover:bg-white/10"
          : "border border-neutral-200 text-ink-placeholder hover:bg-neutral-100"
    );

  return (
    <div className="flex items-center justify-center gap-2.5 mt-1" dir="rtl">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={btnClass(false)}
      >
        <ChevronRight className="size-4" />
      </button>
      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className={dark ? "text-white/35 px-1" : "text-ink-placeholder px-1"}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={btnClass(currentPage === page)}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
        disabled={currentPage === lastPage}
        className={btnClass(false)}
      >
        <ChevronLeft className="size-4" />
      </button>
    </div>
  );
}

export default function RealtimeOrdersWrapper() {
  const router = useRouter();
  const isDark = useIsDark();
  const { toggleTheme } = useToggleTheme();
  const { can, isAdmin } = usePermissions();
  const user = useUserStore((state) => state.user);
  const employeeId = user?.id ?? user?.employee_id ?? null;

  const canViewReceivedQueue =
    isAdmin ||
    can(PERMISSION_SECTIONS.all_requests, "view") ||
    can(PERMISSION_SECTIONS.completed_request, "view");
  const canViewNewRequests = isAdmin || can(PERMISSION_SECTIONS.all_requests, "view");
  const canReceive =
    isAdmin ||
    can(PERMISSION_SECTIONS.all_requests, "edit") ||
    can(PERMISSION_SECTIONS.all_requests, "retrieve") ||
    can(PERMISSION_SECTIONS.completed_request, "edit");
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

  const visiblePills = STATUS_FILTER_PILLS.filter((pill) => {
    const section = PILL_PERMISSIONS[pill.id];
    if (!section) return true;
    return isAdmin || can(section, "view");
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [extraStatusId, setExtraStatusId] = useState(null);
  const [contractType, setContractType] = useState(null);
  const [expandedNew, setExpandedNew] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);
  const [paymentLinkOpen, setPaymentLinkOpen] = useState(false);
  const [statusFieldsOpen, setStatusFieldsOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [manageStatusesOpen, setManageStatusesOpen] = useState(false);

  const {
    activeItems: statusItems,
    receivedStatusId,
    newStatusId,
    returnedStatusId,
  } = useContractStatuses();

  const extraStatuses = useMemo(
    () => getRealtimeExtraFilterStatuses(statusItems),
    [statusItems]
  );

  const {
    items: newOrderItems,
    total: newOrdersTotal,
    summary: newOrdersSummary,
    isLoading: newOrdersLoading,
  } = useRealtimeNewOrders({
    statusId: newStatusId,
    autoRefresh,
    enabled: canViewNewRequests,
  });

  const newRequests = useMemo(
    () => newOrderItems.map(mapRealtimeNewOrder),
    [newOrderItems]
  );

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeFilters, extraStatusId, contractType]);

  const listParams = useMemo(() => {
    const hasAuthenticated = activeFilters.includes("authenticated");
    const hasIncomplete = activeFilters.includes("incomplete");
    const hasReturned = activeFilters.includes("returned");
    const hasMyFiles = activeFilters.includes("myFiles");
    const hasCompletionFilter = hasAuthenticated || hasIncomplete;

    const hasExtraStatus = extraStatusId != null && extraStatusId !== "";
    const statusId = hasExtraStatus
      ? extraStatusId
      : hasReturned
        ? returnedStatusId
        : hasCompletionFilter || !canViewReceivedQueue
          ? undefined
          : receivedStatusId;

    return buildAdminOrdersParams({
      page: currentPage,
      search: debouncedSearch,
      isCompleted: hasAuthenticated ? 1 : hasIncomplete ? 0 : undefined,
      statusId,
      employeeId: hasMyFiles ? employeeId : undefined,
      contractType: contractType || undefined,
    });
  }, [
    activeFilters,
    contractType,
    currentPage,
    debouncedSearch,
    employeeId,
    extraStatusId,
    receivedStatusId,
    returnedStatusId,
    canViewReceivedQueue,
  ]);

  const {
    items: tableItems,
    pagination,
    isLoading: tableLoading,
  } = useRealtimeOrdersList({
    params: listParams,
    autoRefresh,
  });

  const tableOrders = useMemo(
    () => tableItems.map(mapRealtimeTableOrder),
    [tableItems]
  );

  const goToDetails = (row) => {
    router.push(
      `/home/orders/${row.id ?? row.uuid}?from=${encodeURIComponent("/home/realtime-orders")}`
    );
  };

  const { mutate: receiveOrder, isPending: isReceiving, variables: receivingOrder } =
    useReceiveContract();

  const {
    mutate: changeStatus,
    isPending: isChangingStatus,
    variables: changingStatusId,
  } = useChangeOrderStatus({
    queryKey: [REALTIME_ORDERS_QUERY_KEY],
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

  const handleToggleFilter = (id) => {
    setActiveFilters((prev) => {
      const isOn = prev.includes(id);
      if (isOn) return prev.filter((item) => item !== id);

      if (id === "returned") setExtraStatusId(null);

      if (COMPLETION_FILTERS.includes(id)) {
        return [...prev.filter((item) => !COMPLETION_FILTERS.includes(item)), id];
      }
      return [...prev, id];
    });
  };

  const handleExtraStatusChange = (statusId) => {
    setExtraStatusId(statusId);
    if (statusId != null) {
      setActiveFilters((prev) => prev.filter((item) => item !== "returned"));
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
        filename: "الطلبات-مباشرة",
        showStatusColumn: true,
      }),
  });

  const columns = useMemo(
    () =>
      buildRealtimeOrderColumns({
        dark: isDark,
        onView: goToDetails,
        onStatusChange: handleStatusChange,
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

      {canViewNewRequests ? (
      <NewRequestsSection
        orders={newRequests}
        totalCount={newOrdersTotal}
        summary={newOrdersSummary}
        expanded={expandedNew}
        onExpandedChange={setExpandedNew}
        onReceive={receiveOrder}
        receivingId={isReceiving ? receivingOrder?.id : null}
        canReceive={canReceive}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        dark={isDark}
        isLoading={newOrdersLoading}
      />
      ) : null}

      <ControllableDataTable
        columns={columns}
        data={tableOrders}
        density={density}
        isColumnVisible={isColumnVisible}
        isLoading={tableLoading}
        emptyMessage="لا توجد طلبات مطابقة للبحث"
        onRowClick={goToDetails}
      />

      <TablePagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        dark={isDark}
      />

      <ReturnRequestDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        order={returnOrder}
        orderId={returnOrder?.id}
        queryKey={[REALTIME_ORDERS_QUERY_KEY]}
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
