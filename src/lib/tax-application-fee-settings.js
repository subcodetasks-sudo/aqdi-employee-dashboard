export const TAX_APPLICATION_FEE_SETTINGS_QUERY_KEY = "admin-settings-tax-fees";
export const TAX_APPLICATION_FEE_SETTINGS_API = "/admin/settings";

/** Keys this screen owns — never POST unrelated settings as empty strings. */
export const TAX_APPLICATION_FEE_SETTINGS_KEYS = [
  "housing_tax",
  "commercial_tax",
  "application_fees",
];

export const TAX_APPLICATION_FEE_SETTINGS_FIELDS = [
  {
    key: "housing_tax",
    label: "ضريبة العقد السكني (%)",
    description: "نسبة الضريبة المستخدمة في مالية العقود السكنية",
  },
  {
    key: "commercial_tax",
    label: "ضريبة العقد التجاري (%)",
    description: "نسبة ضريبة القيمة المضافة / العقود التجارية",
  },
  {
    key: "application_fees",
    label: "رسوم التطبيق (ر.س)",
    description: "رسوم ثابتة تُضاف في الخطوة الأخيرة من مالية العقد",
  },
];

export const emptyTaxApplicationFeeSettingsForm = {
  housing_tax: "",
  commercial_tax: "",
  application_fees: "",
};

function toOptionalNumberInput(value) {
  if (value == null || value === "") return "";
  return String(value);
}

function unwrapSettings(response) {
  const body = response?.data ?? response;
  const payload = body?.data ?? body;
  if (!payload || typeof payload !== "object") return null;
  if (payload.settings && typeof payload.settings === "object") {
    return payload.settings;
  }
  return payload;
}

export function extractTaxApplicationFeeSettings(response) {
  const settings = unwrapSettings(response);
  if (!settings) return emptyTaxApplicationFeeSettingsForm;

  return {
    housing_tax: toOptionalNumberInput(settings.housing_tax),
    commercial_tax: toOptionalNumberInput(settings.commercial_tax),
    application_fees: toOptionalNumberInput(settings.application_fees),
  };
}

function parseOptionalNumber(value) {
  if (value == null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num;
}

/** Partial update — only the three keys this screen edits. */
export function buildTaxApplicationFeeSettingsPayload(form = {}) {
  return {
    housing_tax: parseOptionalNumber(form.housing_tax),
    commercial_tax: parseOptionalNumber(form.commercial_tax),
    application_fees: parseOptionalNumber(form.application_fees),
  };
}
