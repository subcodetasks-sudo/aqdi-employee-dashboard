"use client";

const EMPTY_PLACEHOLDERS = new Set([
  "",
  "—",
  "--",
  "---",
  "لا يوجد",
  "null",
  "undefined",
]);

export function isEmptyDisplayValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "number" && Number.isNaN(value)) return true;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return true;
    if (EMPTY_PLACEHOLDERS.has(trimmed)) return true;
    // Pure dash / placeholder glyphs from APIs or previous UI defaults
    if (/^[-–—ـ.]+$/.test(trimmed)) return true;
  }
  return false;
}

export function formatDisplayValue(value, emptyFallback = "—") {
  if (isEmptyDisplayValue(value)) return emptyFallback;
  return String(value);
}
