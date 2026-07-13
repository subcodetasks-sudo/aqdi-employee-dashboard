export const PAYMENT_MESSAGES_QUERY_KEY = "payment-messages";
export const PAYMENT_MESSAGES_API = "/admin/payment-messages";

export const PAYMENT_MESSAGE_TYPES = {
  success: "success",
  failed: "failed",
};

export const PAYMENT_MESSAGE_TYPE_META = {
  success: {
    type: "success",
    label: "رسالة نجاح الدفع",
    description: "تظهر للعميل بعد إتمام عملية الدفع بنجاح",
    emoji: "✅",
    accent: "#10B981",
    accentSoft: "#E6FFE6",
    border: "#B7EBC9",
  },
  failed: {
    type: "failed",
    label: "رسالة فشل الدفع",
    description: "تظهر للعميل عند فشل عملية الدفع",
    emoji: "❌",
    accent: "#EF4444",
    accentSoft: "#FFE6E6",
    border: "#FECACA",
  },
};

export const emptyPaymentMessageForm = {
  message: "",
  button_text: "",
  button_link: "",
  button_text_2: "",
  button_link_2: "",
};

export function extractPaymentMessageItems(response) {
  const body = response?.data;
  return body?.data?.items ?? body?.items ?? [];
}

export function getPaymentMessageByType(items = [], type) {
  return items.find((item) => item?.type === type) ?? null;
}

export function mapPaymentMessageToForm(item = {}) {
  return {
    message: item?.message ?? "",
    button_text: item?.button_text ?? "",
    button_link: item?.button_link ?? "",
    button_text_2: item?.button_text_2 ?? "",
    button_link_2: item?.button_link_2 ?? "",
  };
}

export function buildPaymentMessagePayload(form, type) {
  return {
    type,
    message: form.message.trim(),
    button_text: form.button_text.trim(),
    button_link: form.button_link.trim(),
    button_text_2: form.button_text_2.trim(),
    button_link_2: form.button_link_2.trim(),
  };
}

export function isPaymentMessageFormValid(form) {
  return Boolean(
    form?.message?.trim() &&
      form?.button_text?.trim() &&
      form?.button_link?.trim() &&
      form?.button_text_2?.trim() &&
      form?.button_link_2?.trim()
  );
}
