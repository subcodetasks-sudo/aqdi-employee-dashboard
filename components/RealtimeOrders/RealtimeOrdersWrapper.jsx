"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ControllableDataTable,
  useTablePreferences,
} from "@/components/shared/controllable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NewRequestsSection from "./NewRequestsSection";
import RealtimeOrdersToolbar from "./RealtimeOrdersToolbar";
import RealtimeStatusFilterBar from "./RealtimeStatusFilterBar";
import { buildRealtimeOrderColumns } from "./realtime-orders-columns";
import {
  mapRealtimeNewOrder,
  mapRealtimeTableOrder,
} from "./map-realtime-order";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/src/hooks/useThemeMode";
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
import { getRealtimeStatusChipStatuses } from "@/src/lib/contract-statuses";
import { useReceiveContract } from "@/src/hooks/use-receive-contract";
import { isDraftOrderRow } from "@/src/lib/draft-contract-statuses";
import { STATUS_FILTER_PILLS } from "./mock-data";
import ChangeOrderStatusFieldsDialog, {
  getStatusCaseFields,
  statusRequiresExtraFields,
} from "./ChangeOrderStatusFieldsDialog";
import ManageContractStatusesDialog from "./ManageContractStatusesDialog";
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
const SECTION_FILTERS = ["authenticated", "canceled", "returned", "incomplete"];
const DEFAULT_PER_PAGE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100];

const PILL_PERMISSIONS = {
  authenticated: PERMISSION_SECTIONS.request_classification,
  canceled: PERMISSION_SECTIONS.request_classification,
  returned: PERMISSION_SECTIONS.returned_request,
  incomplete: PERMISSION_SECTIONS.incomplete_request,
};

function TablePagination({
  pagination,
  currentPage,
  onPageChange,
  perPage,
  onPerPageChange,
  dark,
}) {
  if (!pagination || !pagination.total) return null;

  const lastPage = Math.max(1, pagination.last_page ?? 1);
  const total = pagination.total ?? 0;
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const btnClass = cn(
    "size-[30px] rounded-[9px] border flex items-center justify-center text-[15px] transition-colors disabled:opacity-35 disabled:cursor-default",
    dark
      ? "border-[#28453A] bg-[#132620] text-[#C4D8D0] hover:bg-[#1A332B]"
      : "border-[#DFE9E4] bg-white text-[#33403B] hover:bg-[#F7FAF9]"
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2.5 flex-wrap pt-1 text-[12.5px]",
        dark ? "text-[#84A093]" : "text-[#5A6B64]"
      )}
      dir="rtl"
    >
      <span>
        عرض{" "}
        <b className={dark ? "text-[#C4D8D0]" : "text-[#33403B]"}>
          {from}–{to}
        </b>{" "}
        من <b className={dark ? "text-[#C4D8D0]" : "text-[#33403B]"}>{total}</b> طلب
      </span>

      <span className="flex items-center gap-2">
        <span className="font-bold whitespace-nowrap">صفوف/صفحة</span>
        <Select
          value={String(perPage)}
          onValueChange={(value) => onPerPageChange?.(Number(value))}
        >
          <SelectTrigger
            className={cn(
              "h-[30px] w-[72px] rounded-[9px] border px-2 text-xs font-bold shadow-none focus:ring-0 focus:ring-offset-0",
              dark
                ? "border-[#28453A] bg-[#132620] text-[#C4D8D0]"
                : "border-[#DFE9E4] bg-white text-[#33403B]"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent dir="rtl" className="min-w-[72px]">
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)} className="text-xs font-bold">
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          disabled={currentPage >= lastPage}
          className={btnClass}
          title="الصفحة التالية"
          aria-label="الصفحة التالية"
        >
          ‹
        </button>
        <span
          className={cn(
            "font-extrabold tabular-nums px-1.5",
            dark ? "text-[#5FD0A8]" : "text-[#0B5F4C]"
          )}
        >
          {currentPage} / {lastPage}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className={btnClass}
          title="الصفحة السابقة"
          aria-label="الصفحة السابقة"
        >
          ›
        </button>
      </span>
    </div>
  );
}

export default function RealtimeOrdersWrapper() {
  const router = useRouter();
  const isDark = useIsDark();
  const { can, isAdmin } = usePermissions();

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
  const [activeSection, setActiveSection] = useState(null);
  const [extraStatusId, setExtraStatusId] = useState(null);
  const [contractType, setContractType] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedNew, setExpandedNew] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);
  const [paymentLinkOpen, setPaymentLinkOpen] = useState(false);
  const [statusFieldsOpen, setStatusFieldsOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [manageStatusesOpen, setManageStatusesOpen] = useState(false);

  const activeFilters = activeSection ? [activeSection] : [];
  const inSectionMode = Boolean(activeSection);

  const {
    activeItems: statusItems,
    receivedStatusId,
    newStatusId,
    returnedStatusId,
    canceledStatusId,
  } = useContractStatuses();

  const statusChips = useMemo(
    () => getRealtimeStatusChipStatuses(statusItems, receivedStatusId),
    [statusItems, receivedStatusId]
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
  }, [debouncedSearch, activeSection, extraStatusId, contractType, perPage]);

  const listParams = useMemo(() => {
    const hasAuthenticated = activeSection === "authenticated";
    const hasIncomplete = activeSection === "incomplete";
    const hasReturned = activeSection === "returned";
    const hasCanceled = activeSection === "canceled";
    const hasCompletionFilter = hasAuthenticated || hasIncomplete;

    const hasExtraStatus = extraStatusId != null && extraStatusId !== "";
    const statusId = hasExtraStatus
      ? extraStatusId
      : hasCanceled
        ? canceledStatusId
        : hasReturned
          ? returnedStatusId
          : hasCompletionFilter || !canViewReceivedQueue
            ? undefined
            : receivedStatusId;

    return buildAdminOrdersParams({
      page: currentPage,
      perPage,
      search: debouncedSearch,
      isCompleted: hasAuthenticated ? 1 : hasIncomplete ? 0 : undefined,
      statusId,
      contractType: contractType || undefined,
    });
  }, [
    activeSection,
    canceledStatusId,
    contractType,
    currentPage,
    debouncedSearch,
    extraStatusId,
    perPage,
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
    if (!SECTION_FILTERS.includes(id)) return;
    setExtraStatusId(null);
    setSearchQuery("");
    setFiltersOpen(false);
    setActiveSection((prev) => (prev === id ? null : id));
  };

  const handleCloseSection = () => {
    setActiveSection(null);
    setSearchQuery("");
  };

  const handleExtraStatusChange = (statusId) => {
    setExtraStatusId(statusId);
    if (statusId != null) {
      setActiveSection(null);
    }
  };

  const activeSectionMeta =
    STATUS_FILTER_PILLS.find((pill) => pill.id === activeSection) ?? null;
  const sectionCount = pagination?.total ?? tableOrders.length;
  const hasInlineFilters = extraStatusId != null || Boolean(contractType);

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
        filename: "الطلبات-مباشر",
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
        filtersOpen={filtersOpen && !inSectionMode}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        hasActiveFilters={hasInlineFilters}
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
        onOpenPaymentLink={() => setPaymentLinkOpen(true)}
        canManageStatuses={canManageStatuses}
        onManageStatuses={() => setManageStatusesOpen(true)}
        activeSection={activeSectionMeta}
        sectionCount={sectionCount}
        onCloseSection={handleCloseSection}
      />

      {canViewNewRequests && !inSectionMode ? (
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

      {filtersOpen && !inSectionMode ? (
        <RealtimeStatusFilterBar
          statusChips={statusChips}
          statusId={extraStatusId}
          onStatusChange={handleExtraStatusChange}
          contractType={contractType}
          onContractTypeChange={setContractType}
          totalCount={pagination?.total}
          dark={isDark}
        />
      ) : null}

      <ControllableDataTable
        columns={columns}
        data={tableOrders}
        density={density}
        isColumnVisible={isColumnVisible}
        isLoading={tableLoading}
        emptyMessage="لا نتائج مطابقة — عدّل البحث أو الفلاتر"
        onRowClick={goToDetails}
        getRowHighlight={isDraftOrderRow}
        defaultSort={{ id: "receivedSince", direction: "asc" }}
      />

      <TablePagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        perPage={perPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setCurrentPage(1);
        }}
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
