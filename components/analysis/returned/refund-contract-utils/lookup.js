import { extractRefundContractId, getOrderAdminApprovalStatus, getOrderUuid, getRefundItemActionKey } from "./ids";
import { isAdminRefundApproved, hasExistingReturnRequest } from "./status";
import {
  normalizeRefundContract,
  normalizeRefundFromOrder,
  mergeRefundWithOrderRow,
  buildReturnOrderRefundFromRow,
} from "./normalize";

export function buildRefundsLookup(refundItems) {
  const map = new Map();
  const list = Array.isArray(refundItems) ? refundItems : [];

  for (const item of list) {
    const normalized = normalizeRefundContract(item);
    if (!normalized?.refundId) continue;

    const contract = item.contract ?? {};

    map.set(normalized.refundId, normalized);
    if (normalized.contractId != null) {
      map.set(normalized.contractId, normalized);
      map.set(String(normalized.contractId), normalized);
    }
    if (contract.id != null) {
      map.set(contract.id, normalized);
      map.set(String(contract.id), normalized);
    }
    if (normalized.orderUuid) {
      map.set(normalized.orderUuid, normalized);
    }
    if (contract.uuid) {
      map.set(contract.uuid, normalized);
    }
    if (normalized.userMobile) {
      map.set(normalized.userMobile, normalized);
      map.set(String(normalized.userMobile), normalized);
    }
    if (normalized.draftContractNumber) {
      map.set(normalized.draftContractNumber, normalized);
      map.set(String(normalized.draftContractNumber), normalized);
    }
  }

  return map;
}

export function findRefundInLookup(order, refundsLookup) {
  if (!order || !refundsLookup?.size) return null;

  const keys = [
    order.uuid,
    order.uuid != null ? String(order.uuid) : null,
    order.id,
    order.id != null ? String(order.id) : null,
    order.contract_id,
    order.contract_id != null ? String(order.contract_id) : null,
    order.refund_id,
    order.refundable_contract_id,
    order.draft_contract_number,
    extractRefundContractId(order),
  ].filter((value) => value != null && value !== "");

  for (const key of keys) {
    const found = refundsLookup.get(key);
    if (found?.refundId) return found;
  }

  for (const refund of refundsLookup.values()) {
    if (refund.orderUuid && String(refund.orderUuid) === String(order.uuid)) return refund;
    if (
      refund.contractId != null &&
      (String(refund.contractId) === String(order.id) || String(refund.contractId) === String(order.contract_id))
    ) {
      return refund;
    }
    if (refund.userMobile && order.user_mobile && String(refund.userMobile) === String(order.user_mobile)) {
      return refund;
    }
  }

  return null;
}

export function refundItemMatchesOrder(order, item) {
  if (!order || !item) return false;

  const contract = item.contract ?? {};
  const orderUuid = order.uuid ?? order.contract_summary?.uuid;
  const contractId = order.contract_id ?? order.id ?? order.contract_summary?.id;
  const itemContractId = item.contract_id ?? contract.id;
  const itemUuid = contract.uuid ?? item.contract_uuid ?? item.uuid;

  if (orderUuid && itemUuid && String(orderUuid) === String(itemUuid)) return true;
  if (contractId && itemContractId && String(contractId) === String(itemContractId)) return true;

  const draft = order.draft_contract_number ?? order.contract_summary?.draft_contract_number;
  const itemDraft = item.draft_contract_number ?? contract.draft_contract_number;
  if (draft && itemDraft && String(draft) === String(itemDraft)) return true;

  const mobile = order.user_mobile ?? order.user?.mobile ?? order.contract_summary?.user_mobile;
  const itemMobile = contract.user?.phone ?? contract.user_mobile ?? item.user_mobile ?? item.customer_mobile;
  if (
    mobile &&
    itemMobile &&
    String(mobile) === String(itemMobile) &&
    order.refund_amount != null &&
    item.refund_amount != null &&
    Number(order.refund_amount) === Number(item.refund_amount)
  ) {
    return true;
  }

  return false;
}

export function findRefundItemForOrder(order, refundItems) {
  if (!order || !Array.isArray(refundItems) || refundItems.length === 0) return null;

  const matches = refundItems.filter((item) => refundItemMatchesOrder(order, item));
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  const pending = matches.filter((item) => !isAdminRefundApproved(item.admin_confirmed));
  if (pending.length === 1) return pending[0];

  return matches[0];
}

export function resolveRefundForOrder(order, refundsLookup) {
  const fromOrder = normalizeRefundFromOrder(order);
  if (fromOrder?.refundId) return fromOrder;

  return findRefundInLookup(order, refundsLookup);
}

/** Resolve refundable-contract id for return-orders table rows. */
export function resolveReturnOrderRefund(order, refundsLookup) {
  const resolved = resolveRefundForOrder(order, refundsLookup);
  if (resolved?.refundId) return mergeRefundWithOrderRow(resolved, order);

  if (order && refundsLookup?.size) {
    for (const refund of refundsLookup.values()) {
      const contract = refund.raw?.contract ?? {};
      const matches =
        String(refund.orderUuid) === String(order.uuid) ||
        String(contract.uuid) === String(order.uuid) ||
        String(refund.contractId) === String(order.id) ||
        String(refund.contractId) === String(order.contract_id) ||
        String(contract.id) === String(order.id) ||
        (refund.userMobile && order.user_mobile && String(refund.userMobile) === String(order.user_mobile));

      if (matches) return mergeRefundWithOrderRow(refund, order);
    }
  }

  return buildReturnOrderRefundFromRow(order);
}

export function resolveRefundIdForAction(order, refund, refundsLookup) {
  if (refund?.orderUuid && refund.orderUuid !== "—") return String(refund.orderUuid);

  const orderUuid = getOrderUuid(order);
  if (orderUuid) return String(orderUuid);

  const found = findRefundInLookup(order, refundsLookup);
  if (found?.orderUuid && found.orderUuid !== "—") return String(found.orderUuid);

  const resolved = resolveReturnOrderRefund(order, refundsLookup);
  if (resolved?.orderUuid && resolved.orderUuid !== "—") return String(resolved.orderUuid);

  return null;
}

/** Always build refund row for return-orders table (even before id is resolved). */
export function ensureReturnOrderRefund(order, refundsLookup) {
  const resolved = resolveReturnOrderRefund(order, refundsLookup);
  if (resolved) {
    const refundId = resolveRefundIdForAction(order, resolved, refundsLookup);
    return { ...resolved, refundId: refundId ?? resolved.refundId };
  }

  if (!order) return null;

  return mergeRefundWithOrderRow(
    {
      refundId: resolveRefundIdForAction(order, null, refundsLookup),
      orderUuid: order.uuid ?? "—",
      userMobile: order.user_mobile ?? "",
      contractType: order.contract_type ?? "—",
      refundAmount: order.refund_amount,
      adminConfirmed: getOrderAdminApprovalStatus(order),
      amountPayment: order.amount_payment,
      isPaid: order.is_paid,
      paymentLabelAr: order.payment_label_ar,
      employeeName: order.employee_name ?? "—",
      draftContractNumber: order.draft_contract_number,
      contractId: order.contract_id ?? order.id,
      returnContract: true,
      raw: order,
    },
    order
  );
}

export function enrichReturnOrderRow(row, refundItems, refundsLookup) {
  if (!row) return row;

  let actionKey = resolveRefundIdForAction(row, null, refundsLookup);
  if (!actionKey && Array.isArray(refundItems) && refundItems.length > 0) {
    const found = findRefundItemForOrder(row, refundItems);
    actionKey = getRefundItemActionKey(found);
  }
  if (!actionKey) {
    actionKey = getOrderUuid(row);
  }

  if (!actionKey) return row;

  return {
    ...row,
    refund_id: actionKey,
    refundable_contract_id: actionKey,
    _resolvedRefundContractId: actionKey,
  };
}

export function canShowReturnOrderApproval(order, refund) {
  if (!resolveRefundIdForAction(order, refund)) return false;
  if (!hasExistingReturnRequest(order)) return false;

  const customerRefunded = order?.customer_refunded ?? order?.is_refunded ?? order?.refunded;
  // Hide only after the customer refund is fully done
  if (customerRefunded === true || customerRefunded === 1) return false;

  return true;
}
