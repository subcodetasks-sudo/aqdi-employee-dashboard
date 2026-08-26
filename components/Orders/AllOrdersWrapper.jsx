"use client";

import { useMemo } from "react";
import {
  ControllableDataTable,
  useTablePreferences,
} from "@/components/shared/controllable-table";
import RealtimeOrdersToolbar from "@/components/RealtimeOrders/RealtimeOrdersToolbar";
import WhatsAppPaymentLinkDialog from "@/components/RealtimeOrders/WhatsAppPaymentLinkDialog";
import ReturnRequestDialog from "@/components/Orders/return-request-dialog";
import ChangeOrderStatusFieldsDialog, {
  getStatusCaseFields,
} from "@/components/RealtimeOrders/ChangeOrderStatusFieldsDialog";
import ManageContractStatusesDialog from "@/components/RealtimeOrders/ManageContractStatusesDialog";
import AllOrdersPagination from "./all-orders-pagination";
import { buildAllOrderColumns } from "./all-orders-columns";
import { ALL_ORDERS_QUERY_KEY } from "@/src/hooks/use-realtime-new-orders";
import { useAllOrdersWrapper } from "@/src/hooks/use-all-orders-wrapper";
import { isDraftOrderRow } from "@/src/lib/draft-contract-statuses";

const TABLE_STORAGE_KEY = "all-orders-table-prefs";

export default function AllOrdersWrapper() {
  const {
    isDark,
    canChangeStatus,
    canAddStatus,
    canEditStatus,
    canManageStatuses,
    canExport,
    visiblePills,
    searchQuery,
    setSearchQuery,
    activeFilters,
    extraStatusId,
    contractType,
    setContractType,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    returnDialogOpen,
    setReturnDialogOpen,
    returnOrder,
    paymentLinkOpen,
    setPaymentLinkOpen,
    statusFieldsOpen,
    setStatusFieldsOpen,
    pendingStatusChange,
    setPendingStatusChange,
    manageStatusesOpen,
    setManageStatusesOpen,
    statusItems,
    extraStatuses,
    tableOrders,
    pagination,
    tableLoading,
    goToDetails,
    changeStatus,
    isChangingStatus,
    changingStatusId,
    handleStatusChange,
    handlePrint,
    handleToggleFilter,
    handleExtraStatusChange,
    handleExport,
    isExporting,
  } = useAllOrdersWrapper();

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
        getRowHighlight={isDraftOrderRow}
        defaultSort={{ id: "receivedSince", direction: "asc" }}
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
