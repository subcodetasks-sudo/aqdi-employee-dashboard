"use client";

import ReturnRequestDialog from "@/components/Orders/return-request-dialog";
import ChangeOrderStatusFieldsDialog from "@/components/RealtimeOrders/ChangeOrderStatusFieldsDialog";
import ManageContractStatusesDialog from "@/components/RealtimeOrders/ManageContractStatusesDialog";
import WhatsAppPaymentLinkDialog from "@/components/RealtimeOrders/WhatsAppPaymentLinkDialog";

export default function AllOrdersDialogs({
  queryKey,
  returnDialogOpen,
  onReturnDialogOpenChange,
  returnOrder,
  paymentLinkOpen,
  onPaymentLinkOpenChange,
  statusFieldsOpen,
  onStatusFieldsOpenChange,
  pendingStatusChange,
  onPendingStatusChangeClear,
  isChangingStatus,
  onStatusFieldsSubmit,
  manageStatusesOpen,
  onManageStatusesOpenChange,
  canAddStatus,
  canEditStatus,
}) {
  return (
    <>
      <ReturnRequestDialog
        open={returnDialogOpen}
        onOpenChange={onReturnDialogOpenChange}
        order={returnOrder}
        orderId={returnOrder?.id}
        queryKey={queryKey}
      />

      <WhatsAppPaymentLinkDialog
        open={paymentLinkOpen}
        onOpenChange={onPaymentLinkOpenChange}
      />

      <ChangeOrderStatusFieldsDialog
        open={statusFieldsOpen}
        onOpenChange={(next) => {
          onStatusFieldsOpenChange(next);
          if (!next) onPendingStatusChangeClear();
        }}
        status={pendingStatusChange?.status}
        isPending={isChangingStatus}
        onSubmit={onStatusFieldsSubmit}
      />

      <ManageContractStatusesDialog
        open={manageStatusesOpen}
        onOpenChange={onManageStatusesOpenChange}
        canCreate={canAddStatus}
        canEdit={canEditStatus}
      />
    </>
  );
}
