import { axiosInstance } from "@/src/utils/axios";

function asObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

/**
 * Payment-gateway / contract-paid payloads may put payment fields on the root
 * and/or under `data` / `record`. Prefer explicit payment fields from any level.
 */
export function normalizePaymentLinkPayload(data, { fallbackUuid } = {}) {
  const root = asObject(data);
  const nested = asObject(root.data);
  const record = asObject(nested.record ?? root.record);

  const paymentUrl =
    root.payment_url ||
    root.Payment_url ||
    nested.payment_url ||
    nested.Payment_url ||
    record.payment_url ||
    record.Payment_url ||
    null;

  const alreadyPaid =
    root.already_paid === true ||
    nested.already_paid === true ||
    root.is_paid === true ||
    root.is_paid === 1 ||
    nested.is_paid === true ||
    nested.is_paid === 1 ||
    record.is_paid === true ||
    record.is_paid === 1;

  return {
    paymentUrl,
    alreadyPaid,
    message: root.message || nested.message || record.message || null,
    contractUuid:
      root.contract_uuid ??
      nested.contract_uuid ??
      record.contract_uuid ??
      fallbackUuid ??
      null,
    contractId: root.contract_id ?? nested.contract_id ?? record.id ?? null,
    cartAmount:
      root.cart_amount ??
      nested.cart_amount ??
      record.cart_amount ??
      record.amount ??
      null,
    payment: root.payment ?? nested.payment ?? record.payment ?? null,
    paymentSuccessUrl:
      root.payment_success_url ?? nested.payment_success_url ?? null,
    paymentErrorUrl: root.payment_error_url ?? nested.payment_error_url ?? null,
    isPaid: alreadyPaid,
    success: root.success === true || root.success === 1 || nested.success === true,
  };
}

function assertPaymentLinkResult(result, response) {
  if (result.alreadyPaid) {
    return result;
  }

  if (!result.paymentUrl) {
    const data = response?.data;
    const apiMessage = data?.gateway_error || data?.message;
    const looksLikeSuccess =
      result.success ||
      (typeof apiMessage === "string" &&
        /نجح|نجاح|success/i.test(apiMessage));

    const error = new Error(
      looksLikeSuccess
        ? "لم يتم إرجاع رابط الدفع"
        : apiMessage || "لم يتم إرجاع رابط الدفع"
    );
    error.response = response;
    throw error;
  }

  return result;
}

export async function fetchContractPaymentLink(uuid) {
  const response = await axiosInstance.get(
    `/admin/payment-gateway/${encodeURIComponent(uuid)}`,
    { headers: { Accept: "application/json" } }
  );

  const result = normalizePaymentLinkPayload(response?.data, {
    fallbackUuid: uuid,
  });

  return assertPaymentLinkResult(result, response);
}

/**
 * Contract-paid payment links come from the payment-gateway using contract_uuid.
 * The detail endpoint often returns only a success message without payment_url.
 */
export async function fetchContractPaidPaymentLink(id, { contractUuid } = {}) {
  let uuid = contractUuid || null;

  if (!uuid) {
    const detailResponse = await axiosInstance.get(
      `/admin/contract-paid-by-employees/${encodeURIComponent(id)}`,
      { headers: { Accept: "application/json" } }
    );
    const detailResult = normalizePaymentLinkPayload(detailResponse?.data);

    if (detailResult.paymentUrl || detailResult.alreadyPaid) {
      return assertPaymentLinkResult(detailResult, detailResponse);
    }

    uuid = detailResult.contractUuid;
  }

  if (!uuid) {
    throw new Error("رقم العقد غير متوفر لإنشاء رابط الدفع");
  }

  return fetchContractPaymentLink(uuid);
}
