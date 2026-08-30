"use client";

import { useMemo } from "react";
import {
  ControllableDataTable,
  useTablePreferences,
} from "@/components/shared/controllable-table";
import RealtimeOrdersToolbar from "@/components/RealtimeOrders/RealtimeOrdersToolbar";
import AllOrdersPagination from "./all-orders-pagination";
import AllOrdersDialogs from "./AllOrdersDialogs";
import { buildAllOrderColumns } from "./all-orders-columns";
import { getStatusCaseFields } from "@/components/RealtimeOrders/ChangeOrderStatusFieldsDialog";
import { ALL_ORDERS_QUERY_KEY } from "@/src/hooks/use-realtime-new-orders";
import { useAllOrdersWrapper } from "@/src/hooks/use-all-orders-wrapper";
import { isDraftOrderRow } from "@/src/lib/draft-contract-statuses";

const TABLE_STORAGE_KEY = "all-orders-table-prefs";

export default function AllOrdersWrapper() {
  const vm = useAllOrdersWrapper();

  const columns = useMemo(
    () =>
      buildAllOrderColumns({
        dark: vm.isDark,
        onView: vm.goToDetails,
        onStatusChange: vm.handleStatusChange,
        onPrint: vm.handlePrint,
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
        title="جميع الطلبات"
        searchPlaceholder="بحث: رقم الطلب / الجوال / الاسم..."
        searchQuery={vm.searchQuery}
        onSearchChange={vm.setSearchQuery}
        activeFilters={vm.activeFilters}
        onToggleFilter={vm.handleToggleFilter}
        filterPills={vm.visiblePills}
        extraStatuses={vm.extraStatuses}
        extraStatusId={vm.extraStatusId}
        onExtraStatusChange={vm.handleExtraStatusChange}
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
      />

      <ControllableDataTable
        columns={columns}
        data={vm.tableOrders}
        density={density}
        isColumnVisible={isColumnVisible}
        isLoading={vm.tableLoading}
        emptyMessage="لا توجد طلبات مطابقة للبحث"
        onRowClick={vm.goToDetails}
        getRowHighlight={isDraftOrderRow}
        defaultSort={{ id: "receivedSince", direction: "asc" }}
      />

      <AllOrdersPagination
        pagination={vm.pagination}
        currentPage={vm.currentPage}
        onPageChange={vm.setCurrentPage}
        perPage={vm.perPage}
        onPerPageChange={vm.setPerPage}
        dark={vm.isDark}
      />

      <AllOrdersDialogs
        queryKey={[ALL_ORDERS_QUERY_KEY]}
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
            fields: getStatusCaseFields(vm.pendingStatusChange.status),
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
