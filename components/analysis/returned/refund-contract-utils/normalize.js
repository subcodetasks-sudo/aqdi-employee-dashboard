import { extractRefundContractId, getOrderAdminApprovalStatus } from "./ids";

/** Normalize table row or single-order payload for ReturnRequestDialog. */
export function normalizeOrderForReturnRequest(order, orderId) {
  if (!order) {
    return { id: orderId, contract_id: orderId };
  }

  if (order.uuid || order.user_mobile) {
    return {
      ...order,
      contract_id: order.contract_id ?? order.id ?? orderId,
      id: order.id ?? orderId,
      status:
        order.status ??
        (order.contract_status_name || order.contract_status_id
          ? {
              id: order.contract_status_id ?? order.status?.id,
              name: order.contract_status_name ?? order.status?.name,
              color: order.contract_status_color ?? order.status?.color,
            }
          : undefined),
    };
  }

  const summary = order.contract_summary ?? {};

  return {
    id: order.id ?? summary.id ?? orderId,
    contract_id: summary.id ?? order.contract_id ?? orderId,
    uuid: order.uuid ?? summary.uuid,
    user_mobile: order.user?.mobile ?? order.user_mobile,
    contract_type: summary.contract_type ?? order.contract_type,
    contract_type_key: summary.contract_type_key ?? order.contract_type_key,
    is_paid: summary.is_paid ?? order.is_paid,
    amount_payment: summary.amount_payment ?? order.amount_payment,
    payment_label_ar: summary.payment_label_ar ?? order.payment_label_ar,
    updated_at: order.updated_at ?? summary.updated_at,
    created_at: order.created_at ?? summary.created_at,
    employee_name: summary.employee_name ?? order.employee_name,
    status:
      summary.status ??
      order.status ?? {
        id: summary.contract_status_id ?? order.contract_status_id,
        name: summary.contract_status_name,
        color: summary.contract_status_color,
      },
    return_contract: order.return_contract ?? summary.return_contract,
    customer_refunded: order.customer_refunded,
    refund_id: order.refund_id,
    refundable_contract_id: order.refundable_contract_id,
    refundable_contract: order.refundable_contract,
    refund: order.refund,
    refundable_contracts: order.refundable_contracts,
    is_refunded: order.is_refunded,
    refunded: order.refunded,
  };
}

/**
 * Map analytics refund-contract row into the shape ReturnOrders / export expect.
 */
export function mapAnalyticsRefundContractToOrderRow(item) {
  if (!item) return null;

  const approved = item.management_approval?.approved ?? item.admin_confirmed ?? null;
  const paymentAmount = item.payment_amount ?? item.amount_payment ?? null;
  const contractUuid = item.contract_uuid ?? item.order_number ?? item.uuid ?? null;

  return {
    id: item.contract_id ?? item.id,
    uuid: contractUuid,
    contract_uuid: contractUuid,
    user_mobile: item.customer_mobile ?? item.user_mobile ?? "",
    customer_mobile: item.customer_mobile ?? item.user_mobile ?? "",
    customer_name: item.customer_name ?? null,
    contract_type: item.contract_type ?? "—",
    contract_type_key: item.contract_type_key ?? null,
    instrument_type: item.instrument_type ?? null,
    amount_payment: paymentAmount,
    is_paid: paymentAmount != null && paymentAmount !== "",
    payment_label_ar: item.payment_label_ar ?? null,
    refund_amount: item.refund_amount,
    is_refunded: item.is_refunded,
    customer_refunded: item.is_refunded,
    refunded: item.is_refunded,
    refunded_status: item.refunded_status ?? null,
    employee_name: item.requester?.name ?? item.employee_name ?? "—",
    requester: item.requester ?? null,
    user_id: item.user_id ?? item.customer_id ?? item.user?.id ?? null,
    user: item.user ?? null,
    admin_confirmed: approved,
    management_approval: item.management_approval ?? null,
    refund_id: item.id,
    refundable_contract_id: item.id,
    draft_contract_number: item.draft_contract_number ?? null,
    contract_id: item.contract_id ?? null,
    notes: item.notes ?? null,
    status: item.contract_status ?? {
      id: item.contract_status_id,
      name: item.contract_status_name,
    },
    contract_status_id: item.contract_status_id ?? null,
    contract_status_name: item.contract_status_name ?? null,
    is_return_order: item.is_return_order === true,
    has_draft_contract: item.has_draft_contract === true,
    created_at: item.created_at ?? null,
    raw: item,
  };
}

export function normalizeRefundContract(item) {
  if (!item) return null;
  const contract = item.contract ?? {};
  const refundRecordId = extractRefundContractId(item) ?? item.id;
  const orderUuid = contract.uuid ?? item.contract_uuid ?? item.uuid ?? item.order_number ?? "—";
  const paymentAmount = contract.amount_payment ?? item.amount_payment ?? item.payment_amount;
  const adminConfirmed = item.management_approval?.approved ?? item.admin_confirmed ?? null;

  return {
    id: refundRecordId,
    refundId: orderUuid !== "—" ? orderUuid : refundRecordId,
    orderUuid,
    userMobile: contract.user?.phone ?? contract.user_mobile ?? item.user_mobile ?? item.customer_mobile ?? "",
    contractType: contract.contract_type ?? item.contract_type ?? "—",
    contractTypeKey: contract.contract_type_key ?? item.contract_type_key,
    amountPayment: paymentAmount,
    isPaid: contract.is_paid ?? item.is_paid ?? (paymentAmount != null && paymentAmount !== ""),
    paymentLabelAr: contract.payment_label_ar ?? item.payment_label_ar ?? item.refunded_status?.label_ar,
    refundAmount: item.refund_amount,
    adminConfirmed,
    customerRefunded: item.customer_refunded ?? item.is_refunded ?? item.refunded,
    employeeName:
      contract.employee?.name ??
      item.requester?.name ??
      item.employee_name ??
      item.raised_by_name ??
      item.raised_by ??
      "—",
    statusName:
      contract.status?.name ??
      item.contract_status?.name ??
      item.contract_status_name ??
      item.status?.name ??
      item.status_name,
    statusColor: contract.status?.color ?? item.contract_status?.color ?? item.status?.color,
    referenceNumber: item.reference_number ?? item.refund_reference,
    notes: item.notes,
    createdAt: item.created_at ?? contract.created_at,
    updatedAt: item.updated_at ?? contract.updated_at,
    contractId: item.contract_id ?? contract.id ?? null,
    draftContractNumber: item.draft_contract_number,
    returnContract: item.return_contract === true || item.is_return_order === true,
    raw: item,
  };
}

/** Build refund row from return-orders list item when nested refund exists. */
export function normalizeRefundFromOrder(order) {
  if (!order) return null;

  const nested =
    order.refundable_contract ??
    order.refund ??
    (Array.isArray(order.refundable_contracts) ? order.refundable_contracts[0] : null);

  if (nested) {
    const normalized = normalizeRefundContract(nested);
    if (normalized?.refundId) return normalized;
  }

  const refundId = extractRefundContractId(order);
  if (refundId) {
    return normalizeRefundContract({
      ...order,
      id: refundId,
      contract_id: order.contract_id ?? order.id,
      refund_amount: order.refund_amount,
      admin_confirmed: getOrderAdminApprovalStatus(order),
      reference_number: order.refund_reference ?? order.reference_number,
      contract: order,
      return_contract: true,
    });
  }

  return null;
}

export function mergeRefundWithOrderRow(refund, order) {
  if (!refund) return null;

  return {
    ...refund,
    refundAmount: refund.refundAmount ?? order?.refund_amount,
    adminConfirmed: refund.adminConfirmed ?? getOrderAdminApprovalStatus(order),
    orderUuid: refund.orderUuid && refund.orderUuid !== "—" ? refund.orderUuid : order?.uuid,
    userMobile: refund.userMobile || order?.user_mobile || "",
    contractType: refund.contractType && refund.contractType !== "—" ? refund.contractType : order?.contract_type,
    employeeName:
      refund.employeeName && refund.employeeName !== "—"
        ? refund.employeeName
        : order?.employee_name ?? order?.accept_retrun_contract_employee?.name,
    draftContractNumber: refund.draftContractNumber ?? order?.draft_contract_number,
    returnContract: true,
  };
}

/** Build refund payload from a return-orders table row. */
export function buildReturnOrderRefundFromRow(order) {
  const refundId = extractRefundContractId(order);
  if (!refundId || !order) return null;

  return mergeRefundWithOrderRow(
    normalizeRefundContract({
      ...order,
      id: refundId,
      contract_id: order.contract_id ?? order.id,
      refund_amount: order.refund_amount,
      admin_confirmed: getOrderAdminApprovalStatus(order),
      contract: order,
      return_contract: true,
    }),
    order
  );
}
