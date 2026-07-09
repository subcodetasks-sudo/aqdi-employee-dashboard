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
