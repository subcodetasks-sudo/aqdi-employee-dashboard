import { findOrdersPageStatusIdByLabel } from "@/src/lib/orders-page-statuses";

export const CONTRACT_STATUSES_API = "/admin/contract-statuses";
export const CONTRACT_STATUSES_QUERY_KEY = "status";

export const NEW_CONTRACT_STATUS_ID = 1;
export const RECEIVED_CONTRACT_STATUS_ID = 6;
export const RETURN_CONTRACT_STATUS_ID = 2;
export const CANCELED_CONTRACT_STATUS_ID = 4;

export function extractContractStatusItems(response) {
  const body = response?.data ?? response;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.data?.data?.items)) return body.data.data.items;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data) && !body.data.items) {
    return Array.isArray(body.data) ? body.data : [];
  }
  return [];
}

function findExactStatusId(statusItems = [], name) {
  const target = String(name ?? "").trim();
  if (!target) return null;
  const found = (statusItems ?? []).find(
    (item) => String(item?.name ?? "").trim() === target
  );
  return found?.id ?? null;
}

export function resolveNewContractStatusId(statusItems = []) {
  return (
    findExactStatusId(statusItems, "جديد") ??
    findOrdersPageStatusIdByLabel(statusItems, "جديد") ??
    NEW_CONTRACT_STATUS_ID
  );
}

export function resolveReceivedContractStatusId(statusItems = []) {
  return (
    findExactStatusId(statusItems, "مستلم") ??
    findOrdersPageStatusIdByLabel(statusItems, "مستلم") ??
    RECEIVED_CONTRACT_STATUS_ID
  );
}

export function resolveReturnedContractStatusId(statusItems = []) {
  return (
    findExactStatusId(statusItems, "استرجاع") ??
    findOrdersPageStatusIdByLabel(statusItems, "استرجاع") ??
    RETURN_CONTRACT_STATUS_ID
  );
}

export function resolveCanceledContractStatusId(statusItems = []) {
  return (
    findExactStatusId(statusItems, "ملغى") ??
    findExactStatusId(statusItems, "ملغي") ??
    findOrdersPageStatusIdByLabel(statusItems, "ملغى") ??
    CANCELED_CONTRACT_STATUS_ID
  );
}

/** Statuses already covered by the main pills / new-requests strip. */
function isPillCoveredStatus(name = "") {
  const normalized = String(name).trim();
  if (!normalized) return true;
  if (normalized === "جديد") return true;
  if (
    normalized === "استرجاع" ||
    normalized.includes("استرجاع") ||
    normalized.includes("مسترجع")
  ) {
    return true;
  }
  return false;
}

export function getRealtimeExtraFilterStatuses(statusItems = []) {
  return (statusItems ?? []).filter(
    (item) => !isPillCoveredStatus(item?.name)
  );
}

function isAllOrdersPillCoveredStatus(name = "") {
  const normalized = String(name).trim();
  if (!normalized) return true;
  if (
    normalized.includes("استرجاع") ||
    normalized.includes("مسترجع")
  ) {
    return true;
  }
  if (normalized.includes("ملغ")) return true;
  return false;
}

export function getAllOrdersExtraFilterStatuses(statusItems = []) {
  return (statusItems ?? []).filter(
    (item) => !isAllOrdersPillCoveredStatus(item?.name)
  );
}
