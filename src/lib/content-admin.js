"use client";

export const CONTENT_PAGE_ENDPOINTS = {
  home: "/admin/content-pages/home",
  about: "/admin/content-pages/about",
};

export function extractContentSections(responseData) {
  const payload = responseData?.data ?? responseData;
  return payload?.sections ?? payload ?? {};
}

export function getStringValue(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
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
