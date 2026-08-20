"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Loader from "@/components/home/loader";
import {
  SingleOrderProvider,
  useSingleOrderContext,
} from "@/components/Orders/single-order/single-order-context";
import DeedOwners from "@/components/Orders/single-order/deed-owners";
import PropertyDetails from "@/components/Orders/single-order/property-details";
import UnitDetailes from "@/components/Orders/single-order/unit-detailes";
import ContractTenant from "@/components/Orders/single-order/contract-tenant";
import FinancialDetailes from "@/components/Orders/single-order/financial-detailes";
import LeaseRenewalOrderView from "@/components/Orders/single-order/lease-renewal/lease-renewal-order-view";
import ReturnRequestDialog from "@/components/Orders/return-request-dialog";
import PaymentLinkDialog from "@/components/Orders/shared/payment-link-dialog";
import { fetchContractPaymentLink } from "@/components/Orders/shared/payment-gateway";
import { getOrderContractUuid } from "@/components/Orders/messages/order-section-message-utils";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import { useContractStatuses } from "@/src/hooks/use-contract-statuses";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import { useChangeOrderStatus } from "@/src/hooks/use-change-order-status";
import {
  canRequestOrderReturn,
  isReturnContractStatus,
  normalizeOrderForReturnRequest,
} from "@/components/analysis/returned/refund-contract-utils";
import { openDialogAfterMenuClose } from "@/src/lib/open-dialog-after-menu-close";
import ChangeOrderStatusFieldsDialog, {
  getStatusCaseFields,
  statusRequiresExtraFields,
} from "../ChangeOrderStatusFieldsDialog";
import PropertyUpdateDialog from "../PropertyUpdateDialog";
import SendDraftDialog from "../SendDraftDialog";
import CorrectionRequestDialog from "../CorrectionRequestDialog";
import EjarDocumentationDialog from "../EjarDocumentationDialog";
import OrderDetailsHeader from "./OrderDetailsHeader";
import OrderGroupsLayout from "./OrderGroupsLayout";
import SectionEditorDialog from "./SectionEditorDialog";
import { mapOrderDetailView } from "./map-order-detail";

function resolveBackLink(from) {
  if (from === "/home/realtime-orders" || from?.startsWith("/home/realtime-orders")) {
    return { href: "/home/realtime-orders", label: "الطلبات مباشرة" };
  }
  if (from?.startsWith("/home/clients") || from?.startsWith("/home/users")) {
    return { href: from, label: "العملاء" };
  }
  if (from?.startsWith("/home/")) {
    return { href: from, label: "رجوع" };
  }
  return { href: "/home/orders", label: "جميع الطلبات" };
}

function OrderDetailsBody() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const { orderData, isLoading, isError, refetch } = useSingleOrderContext();
  const { setOrderId, setDisplayedPart, setSidebarOpen } = useSidebarStore();
  const { can, isAdmin } = usePermissions();
  const { activeItems: statuses } = useContractStatuses();

  const canChangeStatus =
    isAdmin ||
    can(PERMISSION_SECTIONS.request_classification, "edit") ||
    can(PERMISSION_SECTIONS.all_requests, "edit");
  const canAddStatus =
    isAdmin || can(PERMISSION_SECTIONS.request_classification, "create");
  const canReturn =
    isAdmin ||
    can(PERMISSION_SECTIONS.returned_request, "create") ||
    can(PERMISSION_SECTIONS.returned_request, "edit");

  const [editorSection, setEditorSection] = useState(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);
  const [propertyUpdateOpen, setPropertyUpdateOpen] = useState(false);
  const [sendDraftOpen, setSendDraftOpen] = useState(false);
  const [correctionRequestOpen, setCorrectionRequestOpen] = useState(false);
  const [ejarDocumentationOpen, setEjarDocumentationOpen] = useState(false);
  const [statusFieldsOpen, setStatusFieldsOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState({
    paymentUrl: "",
    cartAmount: null,
    alreadyPaid: false,
    message: null,
    payment: null,
  });

  useEffect(() => {
    setOrderId(id);
    return () => {
      setOrderId(null);
      if (useSidebarStore.getState().displayedPart === "comments") {
        setDisplayedPart("default");
      }
    };
  }, [id, setOrderId, setDisplayedPart]);

  const view = useMemo(
    () => (orderData ? mapOrderDetailView(orderData) : null),
    [orderData]
  );
  const back = resolveBackLink(searchParams.get("from"));
  const isLeaseRenewal =
    orderData?.contract_summary?.instrument_type_key === "lease_renewal";

  const { mutate: changeStatus, isPending: isChangingStatus } = useChangeOrderStatus({
    queryKey: ["single-order", id],
    onSuccess: () => {
      setStatusFieldsOpen(false);
      setPendingStatusChange(null);
      refetch();
    },
  });

  const openReturn = (source = orderData) => {
    if (!canReturn) {
      toast.error("ليست لديك صلاحية طلب الاسترجاع");
      return;
    }
    const normalized = normalizeOrderForReturnRequest(source, source?.id ?? id);
    if (!canRequestOrderReturn(normalized)) {
      toast.info("يوجد طلب استرجاع مسبقاً لهذا الطلب");
      return;
    }
    setReturnOrder(normalized);
    openDialogAfterMenuClose(() => setReturnDialogOpen(true));
  };

  const handleStatusChange = (_row, status) => {
    const menuStatus = {
      id: status.id,
      name: status.name ?? status.label,
      label: status.label ?? status.name,
      color: status.color,
      status_case: status.status_case ?? null,
    };

    if (isReturnContractStatus(menuStatus)) {
      openReturn(orderData);
      return;
    }

    if (statusRequiresExtraFields(menuStatus)) {
      setPendingStatusChange({ orderId: orderData.id, status: menuStatus });
      openDialogAfterMenuClose(() => setStatusFieldsOpen(true));
      return;
    }

    changeStatus({ orderId: orderData.id, statusId: status.id });
  };

  const handleOpenNotes = () => {
    setOrderId(id);
    setSidebarOpen(true);
    setDisplayedPart("comments");
  };

  const handlePayLink = async () => {
    const uuid = getOrderContractUuid(orderData);
    if (!uuid) {
      toast.error("رقم الطلب غير متوفر");
      return;
    }
    try {
      const result = await fetchContractPaymentLink(uuid);
      setPaymentLink({
        paymentUrl: result.paymentUrl || "",
        cartAmount: result.cartAmount,
        alreadyPaid: result.alreadyPaid,
        message: result.message,
        payment: result.payment,
      });
      setPaymentDialogOpen(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.gateway_error ||
          error?.response?.data?.message ||
          error?.message ||
          "تعذر إنشاء رابط الدفع"
      );
    }
  };

  if (isLoading) return <Loader />;
  if (isError || !orderData || !view) {
    return (
      <div className="p-6 text-center text-[#A3A3A3]" dir="rtl">
        تعذر تحميل بيانات الطلب
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-5 min-h-full transition-colors -m-[45px] p-[45px] max-[1700px]:-m-[30px] max-[1700px]:p-[30px] bg-[#F4F6F5] dark:bg-[#0B1411]"
      dir="rtl"
    >
      <OrderDetailsHeader
        order={view}
        orderData={orderData}
        backHref={back.href}
        backLabel={back.label}
        onStatusChange={handleStatusChange}
        onOpenNotes={handleOpenNotes}
        onPayLink={handlePayLink}
        onRefund={() => openReturn(orderData)}
        onPropertyUpdate={() => setPropertyUpdateOpen(true)}
        onSendDraft={() => setSendDraftOpen(true)}
        onMissingAttachment={() => setCorrectionRequestOpen(true)}
        onEjarDocumentation={() => setEjarDocumentationOpen(true)}
        statuses={statuses}
        canChangeStatus={canChangeStatus}
        canAddStatus={canAddStatus}
        isStatusPending={isChangingStatus}
      />

      {isLeaseRenewal ? (
        <LeaseRenewalOrderView orderData={orderData} />
      ) : (
        <OrderGroupsLayout order={view} onEdit={setEditorSection} />
      )}

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

      <ReturnRequestDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        order={returnOrder}
        orderId={returnOrder?.id}
        queryKey={["single-order", id]}
      />

      <PropertyUpdateDialog
        open={propertyUpdateOpen}
        onOpenChange={setPropertyUpdateOpen}
        orderData={orderData}
        queryKey={["single-order", id]}
      />

      <SendDraftDialog
        open={sendDraftOpen}
        onOpenChange={setSendDraftOpen}
        orderData={orderData}
        queryKey={["single-order", id]}
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
        queryKey={["single-order", id]}
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
    </div>
  );
}

export default function RealtimeOrderDetailsWrapper() {
  const params = useParams();
  const id = params?.id;

  return (
    <SingleOrderProvider contractId={id}>
      <OrderDetailsBody />
    </SingleOrderProvider>
  );
}
