import { axiosInstance } from "@/src/utils/axios";

export function orderStatusUpdateUrl(orderId) {
  return `/admin/orders/${orderId}/status`;
}

export function orderReturnContractStatusUrl(orderId) {
  return `/admin/orders/${orderId}/return-contract-status`;
}

/** Backend field is misspelled; keep this exact key. */
export const ACCEPT_RETURN_CONTRACT_FIELD = "accept_retrun_contract";

export function collectOrderIdentifierCandidates(order, orderId) {
  return [
    order?.uuid,
    order?.orderUuid,
    order?.order_uuid,
    orderId,
    order?.id,
    order?.contract_id,
    order?.contractId,
    order?.order_id,
    order?.orderId,
    order?.contract_summary?.uuid,
    order?.contract_summary?.id,
  ].filter((value, index, arr) => {
    if (value == null || value === "") return false;
    return arr.findIndex((item) => String(item) === String(value)) === index;
  });
}

/**
 * Body for POST /admin/orders/{id}/status.
 * Extra keys come from status_case.fields (deed_type, ejar_contract_number, …).
 */
export function buildOrderStatusChangePayload(statusId, fields = [], values = {}) {
  const list = Array.isArray(fields) ? fields : [];
  const hasFile = list.some(
    (field) => field?.type === "file" && values?.[field.name] instanceof File
  );

  if (hasFile) {
    const formData = new FormData();
    formData.append("status_id", String(statusId));
    list.forEach((field) => {
      const value = values?.[field.name];
      if (value == null || value === "") return;
      if (value instanceof File) formData.append(field.name, value);
      else formData.append(field.name, String(value));
    });
    return formData;
  }

  const payload = { status_id: statusId };
  list.forEach((field) => {
    const value = values?.[field.name];
    if (value == null || value === "") return;
    payload[field.name] = value;
  });
  return payload;
}

export function postOrderStatus(orderId, { statusId, extraValues, fields } = {}) {
  if (orderId == null || orderId === "") {
    return Promise.reject(new Error("تعذر تحديد الطلب لتغيير الحالة"));
  }

  const payload =
    fields?.length > 0
      ? buildOrderStatusChangePayload(statusId, fields, extraValues)
      : { status_id: statusId };

  return axiosInstance.post(orderStatusUpdateUrl(orderId), payload);
}

export function postReturnContractStatus(orderId, accept = true) {
  if (orderId == null || orderId === "") {
    return Promise.reject(new Error("تعذر تحديد الطلب لتحديث حالة الاسترجاع"));
  }

  return axiosInstance.post(orderReturnContractStatusUrl(orderId), {
    [ACCEPT_RETURN_CONTRACT_FIELD]: accept,
  });
}

export async function postReturnContractStatusForOrder(order, orderId, accept = true) {
  const candidates = collectOrderIdentifierCandidates(order, orderId);
  if (!candidates.length) {
    throw new Error("تعذر تحديد الطلب لتحديث حالة الاسترجاع");
  }

  let lastError = null;
  for (const candidate of candidates) {
    try {
      const response = await postReturnContractStatus(candidate, accept);
      if (response?.data?.success === false) {
        throw new Error(response?.data?.message || "تعذر تحديث حالة الاسترجاع");
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("تعذر تحديث حالة الاسترجاع");
}
