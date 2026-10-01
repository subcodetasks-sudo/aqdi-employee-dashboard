"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { fetchContractPaymentLink } from "@/components/orders/shared/payment-gateway";
import { getOrderContractUuid } from "@/components/orders/messages/order-section-message-utils";
import {
  canOfferClosureActions,
  getReturnRequestExistsMessage,
  hasReturnRequest,
  isReturnContractStatus,
  normalizeOrderForReturnRequest,
  UNPAID_ORDER_RETURN_MESSAGE,
} from "@/components/analysis/returned/refund-contract-utils";
import { openDialogAfterMenuClose } from "@/src/lib/open-dialog-after-menu-close";
import { useChangeOrderStatus } from "@/src/hooks/use-change-order-status";
import {
  normalizeOrderMenuStatus,
  useConfirmOrderStatusChange,
} from "@/src/hooks/use-confirm-order-status-change";

const EMPTY_PAYMENT_LINK = {
  paymentUrl: "",
  cartAmount: null,
  alreadyPaid: false,
  message: null,
  payment: null,
};

export function useOrderDetailsDialogs({ orderData, id, canReturn, refetch }) {
  const [editorSection, setEditorSection] = useState(null);
  const [sectionErrorContext, setSectionErrorContext] = useState(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);
  const [propertyUpdateOpen, setPropertyUpdateOpen] = useState(false);
  const [sendDraftOpen, setSendDraftOpen] = useState(false);
  const [correctionRequestOpen, setCorrectionRequestOpen] = useState(false);
  const [ejarDocumentationOpen, setEjarDocumentationOpen] = useState(false);
  const [statusFieldsOpen, setStatusFieldsOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState(EMPTY_PAYMENT_LINK);
  const changeStatusRef = useRef(null);

  const {
    confirmOpen: confirmStatusOpen,
    pendingConfirm: pendingStatusConfirm,
    requestConfirm,
    confirmStatusChange,
    clearConfirm,
    handleConfirmOpenChange: setConfirmStatusOpen,
  } = useConfirmOrderStatusChange({
    onDirectChange: (pending) => {
      changeStatusRef.current?.({
        orderId: pending.orderId,
        statusId: pending.status.id,
      });
    },
    onNeedsFields: (pending) => {
      setPendingStatusChange({
        orderId: pending.orderId,
        status: pending.status,
      });
      setStatusFieldsOpen(true);
    },
  });

  const { mutate: changeStatus, isPending: isChangingStatus } = useChangeOrderStatus({
    queryKey: ["single-order", id],
    onSuccess: () => {
      setStatusFieldsOpen(false);
      setPendingStatusChange(null);
      clearConfirm();
      refetch();
    },
  });
  changeStatusRef.current = changeStatus;

  const openReturn = (source = orderData) => {
    if (!canReturn) {
      toast.error("ليست لديك صلاحية طلب الاسترجاع");
      return;
    }
    const normalized = normalizeOrderForReturnRequest(source, source?.id ?? id);
    if (!canOfferClosureActions(normalized, source)) {
      toast.error(UNPAID_ORDER_RETURN_MESSAGE);
      return;
    }
    if (hasReturnRequest(normalized)) {
      toast.info(getReturnRequestExistsMessage(normalized));
      return;
    }
    setReturnOrder(normalized);
    openDialogAfterMenuClose(() => setReturnDialogOpen(true));
  };

  const handleStatusChange = (_row, status) => {
    const menuStatus = normalizeOrderMenuStatus(status);

    if (isReturnContractStatus(menuStatus)) {
      // Same as the "رفع طلب استرجاع" pill: create a request, or block if one exists.
      openReturn(orderData);
      return;
    }

    requestConfirm({
      order: orderData,
      orderId: orderData.id,
      status: menuStatus,
      orderLabel: orderData?.uuid ?? orderData?.id,
    });
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

  return {
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
    confirmStatusOpen,
    setConfirmStatusOpen,
    pendingStatusConfirm,
    confirmStatusChange,
    paymentDialogOpen,
    setPaymentDialogOpen,
    paymentLink,
    isChangingStatus,
    changeStatus,
    openReturn,
    handleStatusChange,
    handlePayLink,
  };
}
