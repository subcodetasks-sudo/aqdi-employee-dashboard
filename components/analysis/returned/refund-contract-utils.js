import { axiosInstance } from "@/src/utils/axios";

/** Contract status id for "استرجاع" — required before submitting a refund request. */
export const RETURN_CONTRACT_STATUS_ID = 2;

export function mapCreatedAtFilter(id) {
  if (!id || id === "total") return "all";
  if (id === "day") return "today";
  return id;
}

export function getReturnAnalysisTitle(id) {
  switch (id) {
    case "day":
      return "مسترجع اليــوم";
    case "week":
      return "مسترجع الأسبوع";
    case "month":
      return "مسترجع الشهر";
    case "year":
      return "مسترجع السنة";
    case "total":
      return "إجمالي المسترجع";
    default:
      return "مسترجع اليــوم";
  }
}

/** API uses `false` for pending/rejected, `true` when admin approved. */
export function isAdminRefundApproved(value) {
  return value === true || value === 1;
}

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

  if (
    typeof source.refundable_contract === "number" ||
    typeof source.refundable_contract === "string"
  ) {
    return source.refundable_contract;
  }

  return null;
}

/** Order uuid used in POST /admin/analytics/refunds/contracts/{uuid}. */
export function getOrderUuid(order) {
  if (!order) return null;

  return (
    order.uuid ??
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
  return (
    contract.uuid ??
    item.contract_uuid ??
    item.uuid ??
    item.order_number ??
    null
  );
}

export function isReturnContractOrder(order) {
  if (order?.return_contract === true) return true;
  if (Number(order?.contract_status_id) === RETURN_CONTRACT_STATUS_ID) return true;
  const statusName = order?.status?.name ?? order?.contract_status_name ?? "";
  return isReturnContractStatus({ name: statusName });
}

export function hasExistingReturnRequest(order) {
  if (!order) return false;
  if (isReturnContractOrder(order)) return true;
  if (extractRefundContractId(order)) return true;
  if (order.refund_amount != null && order.refund_amount !== "") return true;

  const nested =
    order.refundable_contract ??
    order.refund ??
    (Array.isArray(order.refundable_contracts) ? order.refundable_contracts[0] : null);
  if (nested) return true;

  return false;
}

/** Whether the row can still open "طلب إسترجاع" (approval stays on return-orders page). */
export function canRequestOrderReturn(order) {
  if (!order) return false;
  if (hasExistingReturnRequest(order)) return false;

  const customerRefunded = order.customer_refunded ?? order.is_refunded ?? order.refunded;
  if (customerRefunded !== null && customerRefunded !== undefined) return false;

  return true;
}

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

export function isReturnContractStatus(status) {
  if (!status) return false;
  if (Number(status.id) === RETURN_CONTRACT_STATUS_ID) return true;
  const name = String(status?.name || "").trim();
  return name === "استرجاع" || name.includes("استرجاع") || name.includes("مسترجع");
}

export function getOrderContractStatusDisplay(order) {
  const status = order?.status ?? {};
  const summary = order?.contract_summary ?? {};

  return {
    id:
      status.id ??
      order?.contract_status_id ??
      summary.contract_status_id ??
      null,
    name:
      status.name ??
      order?.contract_status_name ??
      summary.contract_status_name ??
      "—",
    color:
      status.color ??
      order?.contract_status_color ??
      summary.contract_status_color ??
      "#E6F0FF",
  };
}

export function isOrderInReturnStatus(order) {
  const { id } = getOrderContractStatusDisplay(order);
  return Number(id) === RETURN_CONTRACT_STATUS_ID;
}

export async function ensureReturnContractStatus(orderId, returnStatusId = RETURN_CONTRACT_STATUS_ID) {
  if (!orderId) {
    throw new Error("تعذر تحديد الطلب لتغيير الحالة");
  }

  const response = await axiosInstance.post(
    `/admin/orders/${orderId}/contract-status`,
    {
      contract_status_id: returnStatusId,
    }
  );

  if (response?.data?.success === false) {
    throw new Error(
      response?.data?.message || "تعذر تغيير حالة العقد إلى استرجاع"
    );
  }

  return response;
}

/**
 * Force contract status = 2 (استرجاع) on every known order identifier.
 * Backend refundable-contracts validates that status.
 */
export async function ensureReturnContractStatusForOrder(
  order,
  orderId,
  returnStatusId = RETURN_CONTRACT_STATUS_ID
) {
  const candidates = [
    order?.uuid,
    orderId,
    order?.id,
    order?.contract_id,
    order?.contract_summary?.uuid,
    order?.contract_summary?.id,
  ].filter((value, index, arr) => {
    if (value == null || value === "") return false;
    return arr.findIndex((item) => String(item) === String(value)) === index;
  });

  if (!candidates.length) {
    throw new Error("تعذر تحديد الطلب لتغيير الحالة");
  }

  let lastError = null;

  for (const candidate of candidates) {
    try {
      await ensureReturnContractStatus(candidate, returnStatusId);
      return candidate;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("تعذر تغيير حالة العقد إلى استرجاع");
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

  return (
    nested?.admin_confirmed ??
    order?.admin_confirmed ??
    order?.accept_retrun_contract ??
    order?.accept_return_contract
  );
}

export function canManageAdminRefund(refund) {
  if (!refund) return false;
  if (refund.returnContract) {
    return !isAdminRefundApproved(refund.adminConfirmed);
  }
  return !isAdminRefundApproved(refund.adminConfirmed);
}

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
      (String(refund.contractId) === String(order.id) ||
        String(refund.contractId) === String(order.contract_id))
    ) {
      return refund;
    }
    if (refund.userMobile && order.user_mobile && String(refund.userMobile) === String(order.user_mobile)) {
      return refund;
    }
  }

  return null;
}

export function extractRefundItemsFromApi(root) {
  if (!root) return [];
  if (Array.isArray(root)) return root;
  const payload = root?.data ?? root;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(root?.items)) return root.items;
  return [];
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

  const mobile =
    order.user_mobile ?? order.user?.mobile ?? order.contract_summary?.user_mobile;
  const itemMobile =
    contract.user?.phone ??
    contract.user_mobile ??
    item.user_mobile ??
    item.customer_mobile;
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

export async function fetchRefundContractIdForOrder(order, refundsLookup, options = {}) {
  const { allRefunds = [] } = options;

  const syncKey = resolveRefundIdForAction(order, null, refundsLookup);
  if (syncKey) return syncKey;

  if (allRefunds.length > 0) {
    const found = findRefundItemForOrder(order, allRefunds);
    const key = getRefundItemActionKey(found);
    if (key) return String(key);
  }

  const orderUuid = getOrderUuid(order);
  return orderUuid ? String(orderUuid) : null;
}

export async function resolveRefundIdForActionAsync(order, refund, refundsLookup, options = {}) {
  const syncId = resolveRefundIdForAction(order, refund, refundsLookup);
  if (syncId) return syncId;
  return fetchRefundContractIdForOrder(order, refundsLookup, options);
}

export async function fetchAllRefundContracts() {
  let page = 1;
  let allItems = [];
  let lastPage = 1;

  do {
    const res = await axiosInstance.get(
      `/admin/analytics/refunds/contracts?created_at=all&page=${page}`
    );
    const items = extractRefundItemsFromApi(res.data);
    allItems = allItems.concat(items);
    const payload = res.data?.data ?? res.data;
    lastPage = payload?.pagination?.last_page ?? payload?.last_page ?? page;
    page += 1;
  } while (page <= lastPage && page <= 50);

  return allItems;
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

export function resolveRefundForOrder(order, refundsLookup) {
  const fromOrder = normalizeRefundFromOrder(order);
  if (fromOrder?.refundId) return fromOrder;

  return findRefundInLookup(order, refundsLookup);
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
        (refund.userMobile &&
          order.user_mobile &&
          String(refund.userMobile) === String(order.user_mobile));

      if (matches) return mergeRefundWithOrderRow(refund, order);
    }
  }

  return buildReturnOrderRefundFromRow(order);
}

export function isCustomerRefundPending(order) {
  const value = order?.customer_refunded ?? order?.is_refunded ?? order?.refunded;
  return value === null || value === undefined;
}

export function canShowReturnOrderApproval(order, refund) {
  if (!resolveRefundIdForAction(order, refund)) return false;
  if (!hasExistingReturnRequest(order)) return false;

  const customerRefunded = order?.customer_refunded ?? order?.is_refunded ?? order?.refunded;
  if (customerRefunded === true || customerRefunded === 1) return false;

  if (isCustomerRefundPending(order)) return true;

  return canManageAdminRefund(refund);
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

export function normalizeRefundContract(item) {
  if (!item) return null;
  const contract = item.contract ?? {};
  const refundId =
    extractRefundContractId(item) ??
    item.id;

  return {
    id: refundId,
    refundId,
    orderUuid:
      contract.uuid ??
      item.contract_uuid ??
      item.uuid ??
      item.order_number ??
      "—",
    userMobile:
      contract.user?.phone ??
      contract.user_mobile ??
      item.user_mobile ??
      item.customer_mobile ??
      "",
    contractType:
      contract.contract_type ??
      item.contract_type ??
      "—",
    contractTypeKey: contract.contract_type_key ?? item.contract_type_key,
    amountPayment:
      contract.amount_payment ?? item.amount_payment ?? item.payment_amount,
    isPaid: contract.is_paid ?? item.is_paid,
    paymentLabelAr: contract.payment_label_ar ?? item.payment_label_ar,
    refundAmount: item.refund_amount,
    adminConfirmed: item.admin_confirmed,
    customerRefunded: item.customer_refunded ?? item.is_refunded ?? item.refunded,
    employeeName:
      contract.employee?.name ??
      item.employee_name ??
      item.raised_by_name ??
      item.raised_by ??
      "—",
    statusName: contract.status?.name ?? item.status?.name ?? item.status_name,
    statusColor: contract.status?.color ?? item.status?.color,
    referenceNumber: item.reference_number ?? item.refund_reference,
    notes: item.notes,
    createdAt: item.created_at ?? contract.created_at,
    updatedAt: item.updated_at ?? contract.updated_at,
    contractId: item.contract_id ?? contract.id ?? null,
    draftContractNumber: item.draft_contract_number,
    returnContract: item.return_contract === true,
    raw: item,
  };
}

export function formatRelativeTimeAr(dateString) {
  if (!dateString) return "—";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes}د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days >= 1 && remainingHours > 0) return `منذ ${days} يوم و ${remainingHours} س`;
  if (days >= 1) return `منذ ${days} يوم`;
  return `منذ ${hours} س`;
}

export function buildRefundApprovedCustomerMessage(refund) {
  const amount = refund?.refundAmount ?? "—";
  const reference = refund?.referenceNumber ?? "—";
  const orderNumber = refund?.orderUuid ?? "—";

  return `عميلنا العزيز،

نود إبلاغكم بأنه تم استرجاع المبلغ بنجاح
المبلغ: ${amount}
الرقم المرجعي: ${reference}
رقم الطلب: ${orderNumber}

شكراً لتفهمكم.`;
}

export function updateRefundContract(refundKey, body) {
  return axiosInstance.post(`/admin/analytics/refunds/contracts/${refundKey}`, {
    admin_confirmed: body.admin_confirmed,
    refund_amount: body.refund_amount,
    notes: body.notes ?? null,
  });
}
