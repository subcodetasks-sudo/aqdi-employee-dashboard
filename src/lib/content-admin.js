"use client";

export const CONTENT_PAGE_ENDPOINTS = {
  home: "/admin/content-pages/home",
  about: "/admin/content-pages/about",
  /** Public blogs index (قائمة كل المقالات) — page-level SEO only. */
  blogs: "/admin/content-pages/blogs",
  /** Public services index (قائمة صفحات الخدمات) — page-level SEO only. */
  services: "/admin/content-pages/services",
  /** Public FAQs index (قائمة الأسئلة الشائعة) — page-level SEO only. */
  faqs: "/admin/content-pages/faqs",
};

/** Page-level SEO fields shared by home / about content pages (Arabic-only site). */
export const CONTENT_PAGE_META_FIELDS = ["meta_title", "meta_description"];

/** Client-side id for a freshly added card/feature. Merge on the server is by `id`. */
export function newLocalId() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function extractContentSections(responseData) {
  const payload = responseData?.data ?? responseData;
  return payload?.sections ?? payload ?? {};
}

/**
 * Page-level SEO meta from a content-pages GET payload.
 * Accepts top-level fields, or a nested `meta` / `seo` object.
 * Also accepts legacy `meta_title_ar` / `meta_description_ar` if the API still sends them.
 */
export function extractPageMeta(responseData) {
  const payload = responseData?.data ?? responseData ?? {};
  const meta =
    payload.meta && typeof payload.meta === "object"
      ? payload.meta
      : payload.seo && typeof payload.seo === "object"
        ? payload.seo
        : payload;

  return {
    meta_title: getStringValue(
      meta.meta_title ?? meta.meta_title_ar
    ),
    meta_description: getStringValue(
      meta.meta_description ?? meta.meta_description_ar
    ),
  };
}

/** Multipart body for saving page-level SEO (top-level keys, not a section prefix). */
export function buildPageMetaFormData(fields = {}) {
  const formData = new FormData();
  CONTENT_PAGE_META_FIELDS.forEach((key) => {
    formData.append(key, String(fields[key] ?? "").trim());
  });
  return formData;
}

export function getStringValue(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

export function getFileNameFromUrl(url = "") {
  if (!url) return "";
  const cleanUrl = url.split("?")[0];
  const parts = cleanUrl.split("/");
  return parts[parts.length - 1] || "";
}

export function isPdfUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

export function createImageAsset(url = null) {
  return {
    previewUrl: url || null,
    name: getFileNameFromUrl(url),
  };
}

export function createFileAsset(url = null) {
  return {
    previewUrl: url || null,
    name: getFileNameFromUrl(url),
    isPdf: isPdfUrl(url),
  };
}

/**
 * Returns `{ [fieldKey]: file }` when a new file was picked, otherwise a `keep_<keepKey>` flag
 * (`keepKey` defaults to `fieldKey`, but can differ, e.g. fieldKey "license_file" / keepKey "license").
 */
export function assetFormValue(file, isRemoved, fieldKey = "image", keepKey = fieldKey) {
  if (file instanceof File) return { [fieldKey]: file };
  return { [`keep_${keepKey}`]: isRemoved ? "0" : "1" };
}

function appendFormFields(formData, prefix, fields) {
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const fieldKey = `${prefix}[${key}]`;
    if (value instanceof File) {
      formData.append(fieldKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) =>
        appendFormFields(formData, `${fieldKey}[${index}]`, item)
      );
    } else if (typeof value === "object") {
      appendFormFields(formData, fieldKey, value);
    } else {
      formData.append(fieldKey, String(value).trim());
    }
  });
}

/**
 * Builds a `multipart/form-data` payload for content-section endpoints, e.g.
 * buildSectionFormData("app", { badge_text: "...", image: file, cards: [{ title: "..." }] })
 * produces `app[badge_text]`, `app[image]`, `app[cards][0][title]`, etc.
 */
export function buildSectionFormData(prefix, fields) {
  const formData = new FormData();
  appendFormFields(formData, prefix, fields);
  return formData;
}
