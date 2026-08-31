"use client";

import { useEffect, useMemo } from "react";
import {
  ControllableDataTable,
  useTablePreferences,
} from "@/components/shared/controllable-table";
import { makeSelectionColumn } from "@/components/shared/table-selection-column";
import TableBatchActionsBar from "@/components/shared/table-batch-actions-bar";
import { useRowSelection } from "@/src/hooks/use-row-selection";
import RealtimeOrdersToolbar from "@/components/RealtimeOrders/RealtimeOrdersToolbar";
import WhatsAppPaymentLinkDialog from "@/components/RealtimeOrders/WhatsAppPaymentLinkDialog";
import ReturnRequestDialog from "@/components/Orders/return-request-dialog";
import ChangeOrderStatusFieldsDialog, {
  getStatusCaseFields,
} from "@/components/RealtimeOrders/ChangeOrderStatusFieldsDialog";
import ManageContractStatusesDialog from "@/components/RealtimeOrders/ManageContractStatusesDialog";
import {
  RefundApprovedSuccessDialog,
  RefundRetractSuccessDialog,
} from "@/components/analysis/returned/refund-contract-success-dialog";
import AllOrdersPagination from "./all-orders-pagination";
import ReturnOrdersToolbarKpis from "./shared/return-orders-toolbar-kpis";
import { buildReturnOrderColumns } from "./return-orders-columns";
import { ALL_ORDERS_QUERY_KEY } from "@/src/hooks/use-realtime-new-orders";
import { useReturnOrdersWrapper } from "@/src/hooks/use-return-orders-wrapper";
import { isDraftOrderRow } from "@/src/lib/draft-contract-statuses";

const TABLE_STORAGE_KEY = "return-orders-table-prefs";

export default function ReturnOrdersWrapper() {
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
    listParams,
    handleBatchPrint,
    isBatchPrinting,
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
    refundsLookup,
    refundItems,
    kpiCounts,
    successDialog,
    setSuccessDialog,
    handleSuccessDialogClose,
  } = useReturnOrdersWrapper();

  const selection = useRowSelection();

  const clearSelection = selection.clear;
  useEffect(() => {
    clearSelection();
  }, [listParams, clearSelection]);

  const baseColumns = useMemo(
    () =>
      buildReturnOrderColumns({
        dark: isDark,
        onView: goToDetails,
        onStatusChange: handleStatusChange,
        onPrint: handlePrint,
        statuses: statusItems,
        changingOrderId: isChangingStatus ? changingStatusId?.orderId : null,
        canChangeStatus,
        canAddStatus,
        refundsLookup,
        refundItems,
        exportQueryKey: [ALL_ORDERS_QUERY_KEY],
        onApprovedSuccess: (refund) =>
          setSuccessDialog({ type: "approved", refund }),
        onRetractSuccess: (refund) =>
          setSuccessDialog({ type: "retract", refund }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isDark,
      statusItems,
      isChangingStatus,
      changingStatusId,
      canChangeStatus,
      canAddStatus,
      refundsLookup,
      refundItems,
    ]
  );

  const columns = useMemo(
    () => [
      makeSelectionColumn({
        rows: tableOrders,
        selectedIds: selection.selectedIds,
        onToggleRow: selection.toggle,
        onToggleAll: selection.toggleMany,
      }),
      ...baseColumns.map((col, index) =>
        index === 0 ? { ...col, sticky: undefined } : col
      ),
    ],
    [
      baseColumns,
      tableOrders,
      selection.selectedIds,
      selection.toggle,
      selection.toggleMany,
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
        title="الطلبات المسترجعة"
        searchPlaceholder="بحث: رقم الطلب / الجوال / الاسم..."
        headerKpis={
          <ReturnOrdersToolbarKpis rows={tableOrders} counts={kpiCounts} />
        }
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

      <TableBatchActionsBar
        count={selection.selectedCount}
        onPrint={() => handleBatchPrint(selection.selectedArray)}
        onClear={selection.clear}
        isPrinting={isBatchPrinting}
        dark={isDark}
      />

      <ControllableDataTable
        columns={columns}
        data={tableOrders}
        density={density}
        isColumnVisible={isColumnVisible}
        isLoading={tableLoading}
        emptyMessage="لا توجد طلبات مسترجعة مطابقة للبحث"
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
