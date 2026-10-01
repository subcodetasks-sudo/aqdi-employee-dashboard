export const APP_STATUS_QUERY_KEY = "app-status";
export const APP_STATUS_API = "/admin/settings/app-status";

// Maintenance-message fields shown for the website channel. The public
// /api/v2/website-status endpoint returns message_ar / message_en (plus a
// locale-resolved `message` the backend derives on its own).
export const WEBSITE_MESSAGE_FIELDS = [
  {
    key: "message_ar",
    label: "رسالة الإغلاق (عربي)",
    placeholder: "الموقع مغلق حالياً بسبب أعمال التطوير",
  },
  {
    key: "message_en",
    label: "رسالة الإغلاق (إنجليزي)",
    placeholder: "The website is temporarily closed for maintenance",
  },
];

export const emptyWebsiteForm = {
  is_open: true,
  message_ar: "",
  message_en: "",
};

// Platform-specific version fields. Android has no in-app update messages.
export const APP_STATUS_VERSION_FIELDS = {
  ios: [
    { key: "latest_version", label: "أحدث إصدار", placeholder: "1.2.0" },
    { key: "min_version", label: "أدنى إصدار مدعوم", placeholder: "1.1.0" },
    {
      key: "store_url",
      label: "رابط المتجر",
      placeholder: "https://apps.apple.com/app/aqdi",
    },
    {
      key: "message_ar",
      label: "رسالة التحديث (عربي)",
      placeholder: "يرجى تحديث التطبيق لمتابعة الاستخدام",
      textarea: true,
    },
    {
      key: "message_en",
      label: "رسالة التحديث (إنجليزي)",
      placeholder: "Please update the app to continue",
      textarea: true,
    },
  ],
  android: [
    { key: "latest_version", label: "أحدث إصدار", placeholder: "1.2.0" },
    { key: "min_version", label: "أدنى إصدار مدعوم", placeholder: "1.1.0" },
    {
      key: "store_url",
      label: "رابط المتجر",
      placeholder: "https://play.google.com/store/apps/details?id=sa.aqdi",
    },
  ],
};

export const emptyPlatformForm = {
  ios: {
    latest_version: "",
    min_version: "",
    force_update: false,
    store_url: "",
    message_ar: "",
    message_en: "",
  },
  android: {
    latest_version: "",
    min_version: "",
    force_update: false,
    store_url: "",
  },
};

function toBoolean(value, fallback = false) {
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

function getRecord(data) {
  return Array.isArray(data?.items)
    ? data.items[0]
    : data?.settings && typeof data.settings === "object"
      ? data.settings
      : data;
}

function extractPlatform(record, platform) {
  const source = record?.[platform] ?? {};
  const base = emptyPlatformForm[platform];
  return Object.keys(base).reduce((acc, key) => {
    if (key === "force_update") {
      acc[key] = toBoolean(source[key], base[key]);
    } else {
      acc[key] = source[key] ?? base[key];
    }
    return acc;
  }, {});
}

export function extractAppStatus(response) {
  const body = response?.data;
  const data = body?.data ?? body;

  if (!data || typeof data !== "object") {
    return {
      website: { ...emptyWebsiteForm },
      mobile: { is_open: true },
      ios: { ...emptyPlatformForm.ios },
      android: { ...emptyPlatformForm.android },
    };
  }

  const record = getRecord(data);
  const website = record?.website ?? {};

  return {
    website: {
      is_open: toBoolean(website.is_open, true),
      message_ar: website.message_ar ?? "",
      message_en: website.message_en ?? "",
    },
    mobile: { is_open: toBoolean(record?.mobile?.is_open, true) },
    ios: extractPlatform(record, "ios"),
    android: extractPlatform(record, "android"),
  };
}

// Mobile channel — on/off only, no maintenance copy.
export function buildOpenStatePayload(channel, isOpen) {
  return { [channel]: { is_open: Boolean(isOpen) } };
}

// Website channel — on/off plus the maintenance messages the public
// /api/v2/website-status endpoint serves.
export function buildWebsiteStatusPayload(form = {}) {
  return {
    website: {
      is_open: Boolean(form.is_open),
      message_ar: (form.message_ar ?? "").trim(),
      message_en: (form.message_en ?? "").trim(),
    },
  };
}

export function buildPlatformPayload(platform, form = {}) {
  const fields = APP_STATUS_VERSION_FIELDS[platform] ?? [];
  const payload = { force_update: Boolean(form.force_update) };
  fields.forEach(({ key }) => {
    payload[key] = (form[key] ?? "").trim();
  });
  return { [platform]: payload };
}
