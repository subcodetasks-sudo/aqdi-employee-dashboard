"use client";

import ReturnRequestDialog from "@/components/orders/return-request-dialog";
import ChangeOrderStatusFieldsDialog from "./change-order-status-fields-dialog";
import ManageContractStatusesDialog from "./manage-contract-statuses-dialog";
import WhatsAppPaymentLinkDialog from "./whatsapp-payment-link-dialog";

export default function RealtimeOrdersDialogs({
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
