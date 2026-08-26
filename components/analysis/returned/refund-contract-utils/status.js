import { extractRefundContractId } from "./ids";

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
    id: status.id ?? order?.contract_status_id ?? summary.contract_status_id ?? null,
    name: status.name ?? order?.contract_status_name ?? summary.contract_status_name ?? "—",
    color: status.color ?? order?.contract_status_color ?? summary.contract_status_color ?? "#E6F0FF",
  };
}

export function isOrderInReturnStatus(order) {
  const { id } = getOrderContractStatusDisplay(order);
  return Number(id) === RETURN_CONTRACT_STATUS_ID;
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
  if (order.is_return_order === true) return true;
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

  // Only block when the customer was actually refunded (true/1).
  // `false` / `0` must still allow opening the return request dialog.
  if (
    customerRefunded === true ||
    customerRefunded === 1 ||
    customerRefunded === "1" ||
    customerRefunded === "true"
  ) {
    return false;
  }

  return true;
}

export function isCustomerRefundPending(order) {
  const value = order?.customer_refunded ?? order?.is_refunded ?? order?.refunded;
  return value === null || value === undefined;
}

export function canManageAdminRefund(refund) {
  if (!refund) return false;
  if (refund.returnContract) {
    return !isAdminRefundApproved(refund.adminConfirmed);
  }
  return !isAdminRefundApproved(refund.adminConfirmed);
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
