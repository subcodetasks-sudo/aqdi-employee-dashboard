export const GENERAL_SETTINGS_QUERY_KEY = "general-settings";
export const GENERAL_SETTINGS_API = "/admin/settings/general";

export const GENERAL_SETTINGS_FIELDS = [
  { key: "apple_store", label: "متجر Apple" },
  { key: "android_store", label: "متجر Android" },
  { key: "website_status", label: "حالة الموقع" },
  { key: "thank_you_card", label: "بطاقة الشكر" },
];

export const defaultGeneralSettings = {
  apple_store: false,
  android_store: true,
  website_status: true,
  thank_you_card: true,
};

function toBoolean(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "no", ""].includes(normalized)) return false;
    if (["true", "1", "yes"].includes(normalized)) return true;
  }
  return Boolean(value);
}

// A field entry can be a bare boolean/number/string, or the newer
// `{ key, label, enabled }` object shape — read `enabled` when present.
function readFieldEnabled(entry, fallback) {
  if (entry && typeof entry === "object" && !Array.isArray(entry) && "enabled" in entry) {
    return toBoolean(entry.enabled, fallback);
  }
  return toBoolean(entry, fallback);
}

// Writes `value` back into a field entry, preserving the `{ key, label, enabled }`
// object shape when the current entry uses it.
function writeFieldEnabled(entry, value) {
  if (entry && typeof entry === "object" && !Array.isArray(entry) && "enabled" in entry) {
    return { ...entry, enabled: value };
  }
  return value;
}

function getSettingsRecord(data) {
  return Array.isArray(data?.items)
    ? data.items[0]
    : data?.settings && typeof data.settings === "object"
      ? data.settings
      : data;
}

export function extractGeneralSettings(response) {
  const body = response?.data;
  const data = body?.data ?? body;

  if (!data || typeof data !== "object") return defaultGeneralSettings;

  const record = getSettingsRecord(data);

  return GENERAL_SETTINGS_FIELDS.reduce((acc, field) => {
    acc[field.key] = readFieldEnabled(record?.[field.key], defaultGeneralSettings[field.key]);
    return acc;
  }, {});
}

// Patches a cached general-settings response (mirrors extractGeneralSettings'
// shape detection) so the UI can reflect a save without waiting on a refetch.
export function patchGeneralSettingsCache(response, key, value) {
  if (!response || typeof response !== "object") return response;

  const body = response?.data;
  const data = body?.data ?? body;
  if (!data || typeof data !== "object") return response;

  const record = getSettingsRecord(data);
  if (!record || typeof record !== "object") return response;

  const updatedRecord = { ...record, [key]: writeFieldEnabled(record?.[key], value) };

  if (Array.isArray(data?.items)) {
    const items = [updatedRecord, ...data.items.slice(1)];
    const updatedData = { ...data, items };
    return body?.data
      ? { ...response, data: { ...body, data: updatedData } }
      : { ...response, data: updatedData };
  }

  if (data?.settings && typeof data.settings === "object") {
    const updatedData = { ...data, settings: updatedRecord };
    return body?.data
      ? { ...response, data: { ...body, data: updatedData } }
      : { ...response, data: updatedData };
  }

  return body?.data
    ? { ...response, data: { ...body, data: updatedRecord } }
    : { ...response, data: updatedRecord };
}
