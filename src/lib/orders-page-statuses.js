export const ORDERS_PAGE_STATUS_FILTERS = [
  { label: "جديد", match: ["جديد"] },
  { label: "استرجاع", match: ["استرجاع", "مسترج"] },
  { label: "ملغى", match: ["ملغى", "ملغي", "ملغ"] },
  { label: "معلق", match: ["معلق", "معلّق"] },
  { label: "مستلم", match: ["مستلم", "استلام"] },
  { label: "تم التوثيق", match: ["تم التوثيق", "توثيق", "موثق"] },
];

function normalizeStatusName(value = "") {
  return String(value).trim().replace(/\s+/g, " ");
}

function matchesStatusName(name, patterns = []) {
  const normalized = normalizeStatusName(name);
  return patterns.some(
    (pattern) =>
      normalized === pattern ||
      normalized.includes(pattern) ||
      pattern.includes(normalized)
  );
}

export function filterOrdersPageStatusItems(statusItems = []) {
  const items = Array.isArray(statusItems) ? statusItems : [];

  return ORDERS_PAGE_STATUS_FILTERS.map(({ label, match }) => {
    const found = items.find((item) => matchesStatusName(item?.name, match));
    if (!found) return null;
    return { ...found, name: label };
  }).filter(Boolean);
}

/** Default chip on order list pages (جديد). */
export const DEFAULT_ORDERS_PAGE_STATUS_LABEL = "جديد";

export function findOrdersPageStatusIdByLabel(
  statusItems = [],
  label = DEFAULT_ORDERS_PAGE_STATUS_LABEL
) {
  const items = Array.isArray(statusItems) ? statusItems : [];
  const filter = ORDERS_PAGE_STATUS_FILTERS.find((item) => item.label === label);
  const patterns = filter?.match ?? [label];

  const found = items.find((item) => matchesStatusName(item?.name, patterns));
  return found?.id ?? null;
}

export function getDefaultOrdersPageStatusId(statusItems = []) {
  return findOrdersPageStatusIdByLabel(
    statusItems,
    DEFAULT_ORDERS_PAGE_STATUS_LABEL
  );
}
