export const DRAFT_CONTRACT_STATUSES_API = "/admin/draft-contract-statuses";
export const DRAFT_CONTRACT_STATUSES_QUERY_KEY = "draft-contract-statuses";

export const DRAFT_ORDERS_API = "/admin/orders/draft";
/** @deprecated Use buildDraftOrdersUrl({ statusId }) — API is ?status_id= */
export const DRAFT_ORDERS_BY_STATUS_API = "/admin/orders/draft/status";

export function buildDraftOrdersUrl({
  statusId,
  page,
  search,
  perPage,
} = {}) {
  const params = new URLSearchParams();
  if (statusId != null && statusId !== "") {
    params.set("status_id", String(statusId));
  }
  if (page != null && page !== "") params.set("page", String(page));
  if (perPage != null && perPage !== "") {
    params.set("per_page", String(perPage));
  }
  if (search) params.set("search", String(search));
  const qs = params.toString();
  return qs ? `${DRAFT_ORDERS_API}?${qs}` : DRAFT_ORDERS_API;
}

/** Draft list filtered by contract status: GET /admin/orders/draft?status_id= */
export function getDraftOrdersByStatusUrl(statusId) {
  return buildDraftOrdersUrl({ statusId });
}

export function extractDraftOrdersPayload(response) {
  const body = response?.data ?? response;
  const payload = body?.data ?? body;
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.data?.items)
      ? payload.data.items
      : [];
  const pagination = payload?.pagination ?? payload?.data?.pagination ?? null;
  return { items, pagination };
}

export function extractDraftStatusItems(response) {
  const body = response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.data?.data?.items)) return body.data.data.items;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

/** Prefer active statuses; fall back to full list if /active is empty. */
export function resolveDraftStatusFilterItems(activeResponse, allResponse) {
  const active = extractDraftStatusItems(activeResponse);
  if (active.length > 0) return filterDraftStatusFilterItems(active);
  const all = extractDraftStatusItems(allResponse);
  return filterDraftStatusFilterItems(
    all.filter((item) => item?.is_active !== false && item?.is_active !== 0)
  );
}

/** Statuses that should not appear as chips on the draft-contracts page. */
const DRAFT_PAGE_FILTER_EXCLUDED_NAME_PATTERNS = [
  "مستلم من الموظف",
  "إرسال مسودة العقد لكم عبر واتساب",
  "توثيق العقد في إيجار",
  "بانتظار المشرف",
  "66ع",
];

export function filterDraftStatusFilterItems(statusItems = []) {
  const items = Array.isArray(statusItems) ? statusItems : [];
  return items.filter((item) => {
    const name = String(item?.name ?? "").trim();
    if (!name) return false;
    return !DRAFT_PAGE_FILTER_EXCLUDED_NAME_PATTERNS.some(
      (pattern) => name === pattern || name.includes(pattern)
    );
  });
}

export const emptyDraftStatusForm = {
  name: "",
  description: "",
  color_text: "#000000",
  color: "#000000",
};

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

function isTruthyFlag(value) {
  return value === true || value === 1 || value === "1";
}

function textLooksLikeDraft(value) {
  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!text) return false;
  return (
    text === "draft" ||
    text.includes("draft") ||
    text.includes("مسود")
  );
}

/** Detect draft-contract rows in mixed order lists / related contracts. */
export function isDraftOrderRow(row = {}) {
  if (!row) return false;

  const summary = row.contract_summary ?? {};
  const sources = [row, summary];

  for (const item of sources) {
    if (!item || typeof item !== "object") continue;

    if (isTruthyFlag(item.is_draft) || isTruthyFlag(item.is_draft_contract)) {
      return true;
    }
    if (isTruthyFlag(item.is_draft_order) || isTruthyFlag(item.from_draft)) {
      return true;
    }

    if (
      textLooksLikeDraft(item.order_type) ||
      textLooksLikeDraft(item.type) ||
      textLooksLikeDraft(item.source) ||
      textLooksLikeDraft(item.category)
    ) {
      return true;
    }

    if (item.draft_contract_status_id || item.draft_contract_status?.id) {
      return true;
    }
    if (item.draft_contract_status_name || item.draft_contract_status?.name) {
      return true;
    }

    if (
      textLooksLikeDraft(item.status?.name) ||
      textLooksLikeDraft(item.contract_status_name) ||
      textLooksLikeDraft(item.status_name)
    ) {
      return true;
    }

    if (
      textLooksLikeDraft(item.instrument_type_key) ||
      textLooksLikeDraft(item.instrument_type)
    ) {
      return true;
    }
  }

  return false;
}

function parseHexColor(value = "") {
  const hex = String(value).trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return null;
}

/** Soft row background tint from a draft status color. */
export function getDraftRowHighlightStyle(color) {
  const rgb = parseHexColor(color);
  if (!rgb) {
    return {
      backgroundColor: "#FFFBEB",
      boxShadow: "inset -3px 0 0 #F59E0B",
    };
  }
  return {
    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
    boxShadow: `inset -3px 0 0 ${color}`,
  };
}
