export const DRAFT_CONTRACT_STATUSES_API = "/admin/draft-contract-statuses";
export const DRAFT_CONTRACT_STATUSES_QUERY_KEY = "draft-contract-statuses";

export const DRAFT_ORDERS_API = "/admin/orders/draft";
export const DRAFT_ORDERS_BY_STATUS_API = "/admin/orders/draft/status";

export const emptyDraftStatusForm = {
  name: "",
  color_text: "#000000",
  color: "#000000",
};

export function extractDraftStatusItems(response) {
  const body = response?.data;
  return body?.data?.items ?? body?.data?.data?.items ?? body?.items ?? [];
}

export function getDraftOrdersByStatusUrl(statusId) {
  return `${DRAFT_ORDERS_BY_STATUS_API}/${statusId}`;
}

export function getDraftOrderStatusLabel(row = {}) {
  return (
    row?.draft_contract_status?.name ??
    row?.draft_contract_status_name ??
    row?.status?.name ??
    row?.contract_status_name ??
    "—"
  );
}

export function getDraftOrderStatusColor(row = {}) {
  return (
    row?.draft_contract_status?.color ??
    row?.draft_contract_status_color ??
    row?.status?.color
  );
}

export function getDraftOrderStatusTextColor(row = {}) {
  return (
    row?.draft_contract_status?.color_text ??
    row?.draft_contract_status_color_text ??
    row?.status?.color_text
  );
}

export function getOrderDraftStatusFromDetail(orderData = {}) {
  const summary = orderData?.contract_summary ?? {};
  return {
    id:
      orderData?.draft_contract_status_id ??
      orderData?.draft_contract_status?.id ??
      summary?.draft_contract_status_id ??
      summary?.draft_contract_status?.id ??
      null,
    name: getDraftOrderStatusLabel({ ...summary, ...orderData }),
    color: getDraftOrderStatusColor({ ...summary, ...orderData }),
    colorText: getDraftOrderStatusTextColor({ ...summary, ...orderData }),
  };
}

export function getOrderDraftContractNumber(orderData = {}) {
  const summary = orderData?.contract_summary ?? {};
  return (
    orderData?.draft_contract_number ??
    summary?.draft_contract_number ??
    ""
  );
}
