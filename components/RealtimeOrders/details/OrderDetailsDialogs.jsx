"use client";

import DeedOwners from "@/components/Orders/single-order/deed-owners";
import PropertyDetails from "@/components/Orders/single-order/property-details";
import UnitDetailes from "@/components/Orders/single-order/unit-detailes";
import ContractTenant from "@/components/Orders/single-order/contract-tenant";
import FinancialDetailes from "@/components/Orders/single-order/financial-detailes";
import ReturnRequestDialog from "@/components/Orders/return-request-dialog";
import PaymentLinkDialog from "@/components/Orders/shared/payment-link-dialog";
import ChangeOrderStatusFieldsDialog, {
  getStatusCaseFields,
} from "../ChangeOrderStatusFieldsDialog";
import PropertyUpdateDialog from "../PropertyUpdateDialog";
import SendDraftDialog from "../SendDraftDialog";
import CorrectionRequestDialog from "../CorrectionRequestDialog";
import EjarDocumentationDialog from "../EjarDocumentationDialog";
import SectionEditorDialog from "./SectionEditorDialog";
import OrderSectionErrorDialog from "@/components/Orders/messages/order-section-error-dialog";

export default function OrderDetailsDialogs({ id, orderData, view, dialogs }) {
  const {
    editorSection,
    setEditorSection,
    sectionErrorContext,
    setSectionErrorContext,
    returnDialogOpen,
    setReturnDialogOpen,
    returnOrder,
    propertyUpdateOpen,
    setPropertyUpdateOpen,
    sendDraftOpen,
    setSendDraftOpen,
    correctionRequestOpen,
    setCorrectionRequestOpen,
    ejarDocumentationOpen,
    setEjarDocumentationOpen,
    statusFieldsOpen,
    setStatusFieldsOpen,
    pendingStatusChange,
    setPendingStatusChange,
    paymentDialogOpen,
    setPaymentDialogOpen,
    paymentLink,
    isChangingStatus,
    changeStatus,
  } = dialogs;

  const queryKey = ["single-order", id];

  return (
    <>
      <SectionEditorDialog
        open={Boolean(editorSection)}
        onOpenChange={(open) => {
          if (!open) setEditorSection(null);
        }}
        section={editorSection}
      >
        {editorSection === "deed" ? <DeedOwners data={orderData} /> : null}
        {editorSection === "address" ? <PropertyDetails data={orderData} /> : null}
        {editorSection === "tenant" ? <ContractTenant data={orderData} /> : null}
        {editorSection === "financial" ? (
          <FinancialDetailes data={orderData} />
        ) : null}
        {editorSection === "units" ? <UnitDetailes data={orderData} /> : null}
      </SectionEditorDialog>

      <OrderSectionErrorDialog
        open={Boolean(sectionErrorContext)}
        onOpenChange={(open) => {
          if (!open) setSectionErrorContext(null);
        }}
        orderData={orderData}
        context={sectionErrorContext}
      />

      <ReturnRequestDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        order={returnOrder}
        orderId={returnOrder?.id}
        queryKey={queryKey}
      />

      <PropertyUpdateDialog
        open={propertyUpdateOpen}
        onOpenChange={setPropertyUpdateOpen}
        orderData={orderData}
        queryKey={queryKey}
      />

      <SendDraftDialog
        open={sendDraftOpen}
        onOpenChange={setSendDraftOpen}
        orderData={orderData}
        queryKey={queryKey}
      />

      <CorrectionRequestDialog
        open={correctionRequestOpen}
        onOpenChange={setCorrectionRequestOpen}
        order={view}
      />

      <EjarDocumentationDialog
        open={ejarDocumentationOpen}
        onOpenChange={setEjarDocumentationOpen}
        orderData={orderData}
        queryKey={queryKey}
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
            orderId: pendingStatusChange.orderId,
            statusId: pendingStatusChange.status.id,
            extraValues,
            fields: getStatusCaseFields(pendingStatusChange.status),
          });
        }}
      />

      <PaymentLinkDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        paymentUrl={paymentLink.paymentUrl}
        cartAmount={paymentLink.cartAmount}
        alreadyPaid={paymentLink.alreadyPaid}
        message={paymentLink.message}
        payment={paymentLink.payment}
      />
    </>
  );
}
