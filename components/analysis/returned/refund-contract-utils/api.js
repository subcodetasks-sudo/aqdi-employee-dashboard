import { axiosInstance } from "@/src/utils/axios";
import { postReturnContractStatusForOrder } from "@/src/lib/order-status-api";
import { getOrderUuid, getRefundItemActionKey } from "./ids";
import { findRefundItemForOrder, resolveRefundIdForAction } from "./lookup";

export const REFUNDS_CONTRACTS_API = "/admin/analytics/refunds/contracts";

export function extractRefundItemsFromApi(root) {
  if (!root) return [];
  if (Array.isArray(root)) return root;
  const payload = root?.data ?? root;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.contracts)) return payload.contracts;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(root?.contracts)) return root.contracts;
  if (Array.isArray(root?.items)) return root.items;
  return [];
}

/** Summary + pagination from GET /admin/analytics/refunds/contracts. */
export function extractRefundsContractsPayload(root) {
  const payload = root?.data ?? root ?? {};
  const summary = payload?.summary ?? {};
  const managementApproval = summary?.management_approval ?? payload?.management_approval ?? null;
  const contractStatuses = summary?.contract_statuses ?? payload?.contract_statuses ?? [];

  return {
    period: payload?.period ?? null,
    labelAr: payload?.label_ar ?? null,
    contracts: extractRefundItemsFromApi(root),
    pagination: payload?.pagination ?? root?.pagination ?? null,
    summary,
    managementApproval,
    contractStatuses,
  };
}

export async function fetchAllRefundContracts() {
  let page = 1;
  let allItems = [];
  let lastPage = 1;

  try {
    do {
      const res = await axiosInstance.get(`${REFUNDS_CONTRACTS_API}?created_at=all&page=${page}`);
      const { contracts, pagination } = extractRefundsContractsPayload(res.data);
      allItems = allItems.concat(contracts);
      lastPage = pagination?.last_page ?? page;
      page += 1;
    } while (page <= lastPage && page <= 50);
  } catch {
    return allItems;
  }

  return allItems;
}

/**
 * Global refund-contract KPIs — GET /admin/analytics/refunds/contracts (page 1).
 * The `summary` block is table-page independent, so it drives the KPI row.
 */
export async function fetchRefundContractsSummary() {
  try {
    const res = await axiosInstance.get(`${REFUNDS_CONTRACTS_API}?created_at=all&page=1`);
    return extractRefundsContractsPayload(res.data);
  } catch {
    return null;
  }
}

export async function fetchRefundContractIdForOrder(order, refundsLookup, options = {}) {
  const { allRefunds = [] } = options;

  const syncKey = resolveRefundIdForAction(order, null, refundsLookup);
  if (syncKey) return syncKey;

  if (allRefunds.length > 0) {
    const found = findRefundItemForOrder(order, allRefunds);
    const key = found?.id ?? getRefundItemActionKey(found);
    if (key != null && key !== "") return String(key);
  }

  const orderUuid = getOrderUuid(order);
  return orderUuid ? String(orderUuid) : null;
}

export async function resolveRefundIdForActionAsync(order, refund, refundsLookup, options = {}) {
  const syncId = resolveRefundIdForAction(order, refund, refundsLookup);
  if (syncId) return syncId;
  return fetchRefundContractIdForOrder(order, refundsLookup, options);
}

export async function updateRefundContract(refundKey, body, orderContext = {}) {
  const response = await axiosInstance.post(`/admin/analytics/refunds/contracts/${refundKey}`, {
    admin_confirmed: body.admin_confirmed,
    refund_amount: body.refund_amount,
    notes: body.notes ?? null,
  });

  if (response?.data?.success === false) {
    return response;
  }

  // The backend flips the contract to "استرجاع" on approval by itself. Only
  // re-issue return-contract-status when a caller explicitly opts in as a
  // fallback — and never let it fail the (already successful) approval.
  if (body?.admin_confirmed === true && orderContext.syncContractStatus === true) {
    const order = {
      ...(orderContext.refund ?? {}),
      ...(orderContext.order ?? {}),
    };
    const orderId =
      orderContext.orderId ??
      order?.id ??
      order?.uuid ??
      order?.contract_id ??
      order?.contractId ??
      order?.orderId ??
      order?.order_id;
    try {
      await postReturnContractStatusForOrder(order, orderId, true);
    } catch {
      // non-fatal: the refund approval itself already succeeded
    }
  }

  return response;
}
