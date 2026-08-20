export const GENERAL_SETTINGS_QUERY_KEY = "general-settings";
export const GENERAL_SETTINGS_API = "/admin/settings/general";

export const GENERAL_SETTINGS_FIELDS = [
  { key: "website", label: "الموقع" },
  { key: "apple_store", label: "متجر Apple" },
  { key: "android_store", label: "متجر Android" },
  { key: "website_status", label: "حالة الموقع" },
  { key: "thank_you_card", label: "بطاقة الشكر" },
];

export const defaultGeneralSettings = {
  website: true,
  apple_store: false,
  android_store: true,
  website_status: true,
  thank_you_card: true,
};

export function extractGeneralSettings(response) {
  const body = response?.data;
  const data = body?.data ?? body;

  if (!data || typeof data !== "object") return defaultGeneralSettings;

  const record = Array.isArray(data?.items)
    ? data.items[0]
    : data?.settings && typeof data.settings === "object"
      ? data.settings
      : data;

  return GENERAL_SETTINGS_FIELDS.reduce((acc, field) => {
    acc[field.key] = Boolean(record?.[field.key] ?? defaultGeneralSettings[field.key]);
    return acc;
  }, {});
}
