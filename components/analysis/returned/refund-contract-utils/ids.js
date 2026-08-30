/** Refundable-contract row id from nested order/refund payloads. */
export function extractRefundContractId(source) {
  if (!source) return null;

  const summary = source.contract_summary ?? {};
  const nested =
    source.refundable_contract ??
    source.refund ??
    summary.refundable_contract ??
    summary.refund ??
    (Array.isArray(source.refundable_contracts) ? source.refundable_contracts[0] : null) ??
    (Array.isArray(summary.refundable_contracts) ? summary.refundable_contracts[0] : null);

  const candidates = [
    source._resolvedRefundContractId,
    source.refund_id,
    source.refundable_contract_id,
    source.refundable_contracts_id,
    source.refund_contract_id,
    source.refundable_contract?.id,
    source.refund?.id,
    nested?.id,
    summary.refundable_contract_id,
    summary.refund_id,
    Array.isArray(source.refundable_contracts) ? source.refundable_contracts[0]?.id : null,
  ];

  for (const id of candidates) {
    if (id != null && id !== "") return id;
  }

  if (typeof source.refundable_contract === "number" || typeof source.refundable_contract === "string") {
    return source.refundable_contract;
  }

  return null;
}

/** Order uuid used in POST /admin/analytics/refunds/contracts/{uuid}. */
export function getOrderUuid(order) {
  if (!order) return null;

  return (
    order.uuid ??
    order.contract_uuid ??
    order.contract_summary?.uuid ??
    order.contract?.uuid ??
    order.order_uuid ??
    order.order_number ??
    null
  );
}

export function getRefundItemActionKey(item) {
  if (!item) return null;

  const contract = item.contract ?? {};
  return contract.uuid ?? item.contract_uuid ?? item.uuid ?? item.order_number ?? null;
}

export function resolveRefundableContractId(order, orderId) {
  return (
    order?.uuid ??
    order?.contract_summary?.uuid ??
    orderId ??
    order?.id ??
    order?.contract_id ??
    null
  );
}

export function getOrderAdminApprovalStatus(order) {
  const nested =
    order?.refundable_contract ??
    order?.refund ??
    (Array.isArray(order?.refundable_contracts) ? order.refundable_contracts[0] : null);

  // `management_approval` is authoritative when present. `approved: null` means
  // the request is still pending — do not fall back to a stale `admin_confirmed`.
  const managementApproval =
    order?.management_approval ?? nested?.management_approval ?? null;
  if (managementApproval && typeof managementApproval === "object" && "approved" in managementApproval) {
    return managementApproval.approved ?? null;
  }

  // No management_approval block: `admin_confirmed: null` is also pending.
  return (
    nested?.admin_confirmed ??
    order?.admin_confirmed ??
    order?.accept_retrun_contract ??
    order?.accept_return_contract ??
    null
  );
}
