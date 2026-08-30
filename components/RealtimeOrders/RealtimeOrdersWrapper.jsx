"use client";

import { useMemo } from "react";
import {
  ControllableDataTable,
  useTablePreferences,
} from "@/components/shared/controllable-table";
import NewRequestsSection from "./NewRequestsSection";
import RealtimeOrdersToolbar from "./RealtimeOrdersToolbar";
import RealtimeStatusFilterBar from "./RealtimeStatusFilterBar";
import RealtimeOrdersTablePagination from "./RealtimeOrdersTablePagination";
import RealtimeOrdersDialogs from "./RealtimeOrdersDialogs";
import { buildRealtimeOrderColumns } from "./realtime-orders-columns";
import { cn } from "@/lib/utils";
import { REALTIME_ORDERS_QUERY_KEY } from "@/src/hooks/use-realtime-new-orders";
import { useRealtimeOrdersWrapper } from "@/src/hooks/use-realtime-orders-wrapper";
import { isDraftOrderRow } from "@/src/lib/draft-contract-statuses";

const TABLE_STORAGE_KEY = "realtime-orders-table-prefs";

export default function RealtimeOrdersWrapper() {
  const vm = useRealtimeOrdersWrapper();

  const columns = useMemo(
    () =>
      buildRealtimeOrderColumns({
        dark: vm.isDark,
        onView: vm.goToDetails,
        onStatusChange: vm.handleStatusChange,
        statuses: vm.statusItems,
        changingOrderId: vm.isChangingStatus ? vm.changingStatusId?.orderId : null,
        canChangeStatus: vm.canChangeStatus,
        canAddStatus: vm.canAddStatus,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      vm.isDark,
      vm.statusItems,
      vm.isChangingStatus,
      vm.changingStatusId,
      vm.canChangeStatus,
      vm.canAddStatus,
    ]
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
        searchQuery={vm.searchQuery}
        onSearchChange={vm.setSearchQuery}
        activeFilters={vm.activeFilters}
        onToggleFilter={vm.handleToggleFilter}
        filterPills={vm.visiblePills}
        filtersOpen={vm.filtersOpen && !vm.inSectionMode}
        onToggleFilters={() => vm.setFiltersOpen((open) => !open)}
        hasActiveFilters={vm.hasInlineFilters}
        contractType={vm.contractType}
        onContractTypeChange={vm.setContractType}
        columns={columns}
        density={density}
        onDensityChange={setDensity}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onExport={vm.handleExport}
        isExporting={vm.isExporting}
        canExport={vm.canExport}
        dark={vm.isDark}
        onOpenPaymentLink={() => vm.setPaymentLinkOpen(true)}
        canManageStatuses={vm.canManageStatuses}
        onManageStatuses={() => vm.setManageStatusesOpen(true)}
        activeSection={vm.activeSectionMeta}
        sectionCount={vm.sectionCount}
        onCloseSection={vm.handleCloseSection}
      />

      {vm.canViewNewRequests && !vm.inSectionMode ? (
        <NewRequestsSection
          orders={vm.newRequests}
          totalCount={vm.newOrdersTotal}
          summary={vm.newOrdersSummary}
          expanded={vm.expandedNew}
          onExpandedChange={vm.setExpandedNew}
          onReceive={vm.receiveOrder}
          receivingId={vm.isReceiving ? vm.receivingOrder?.id : null}
          canReceive={vm.canReceive}
          autoRefresh={vm.autoRefresh}
          onAutoRefreshChange={vm.setAutoRefresh}
          dark={vm.isDark}
          isLoading={vm.newOrdersLoading}
        />
      ) : null}

      {vm.filtersOpen && !vm.inSectionMode ? (
        <RealtimeStatusFilterBar
          statusChips={vm.statusChips}
          statusId={vm.extraStatusId}
          onStatusChange={vm.handleExtraStatusChange}
          contractType={vm.contractType}
          onContractTypeChange={vm.setContractType}
          totalCount={vm.pagination?.total}
          dark={vm.isDark}
        />
      ) : null}

      <ControllableDataTable
        columns={columns}
        data={vm.tableOrders}
        density={density}
        isColumnVisible={isColumnVisible}
        isLoading={vm.tableLoading}
        emptyMessage="لا نتائج مطابقة — عدّل البحث أو الفلاتر"
        onRowClick={vm.goToDetails}
        getRowHighlight={isDraftOrderRow}
        defaultSort={{ id: "receivedSince", direction: "asc" }}
      />

      <RealtimeOrdersTablePagination
        pagination={vm.pagination}
        currentPage={vm.currentPage}
        onPageChange={vm.setCurrentPage}
        perPage={vm.perPage}
        onPerPageChange={(value) => {
          vm.setPerPage(value);
          vm.setCurrentPage(1);
        }}
        dark={vm.isDark}
      />

      <RealtimeOrdersDialogs
        queryKey={[REALTIME_ORDERS_QUERY_KEY]}
        returnDialogOpen={vm.returnDialogOpen}
        onReturnDialogOpenChange={vm.setReturnDialogOpen}
        returnOrder={vm.returnOrder}
        paymentLinkOpen={vm.paymentLinkOpen}
        onPaymentLinkOpenChange={vm.setPaymentLinkOpen}
        statusFieldsOpen={vm.statusFieldsOpen}
        onStatusFieldsOpenChange={vm.setStatusFieldsOpen}
        pendingStatusChange={vm.pendingStatusChange}
        onPendingStatusChangeClear={() => vm.setPendingStatusChange(null)}
        isChangingStatus={vm.isChangingStatus}
        onStatusFieldsSubmit={(extraValues) => {
          if (!vm.pendingStatusChange) return;
          vm.changeStatus({
            orderId: vm.pendingStatusChange.order.id,
            statusId: vm.pendingStatusChange.status.id,
            extraValues,
            fields: vm.getStatusCaseFields(vm.pendingStatusChange.status),
          });
        }}
        manageStatusesOpen={vm.manageStatusesOpen}
        onManageStatusesOpenChange={vm.setManageStatusesOpen}
        canAddStatus={vm.canAddStatus}
        canEditStatus={vm.canEditStatus}
      />
    </div>
  );
}
