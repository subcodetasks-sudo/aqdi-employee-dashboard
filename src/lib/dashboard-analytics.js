/** Normalize list or keyed object from dashboard-analytics API. */
export function toAnalyticsList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === 'object') return Object.values(data).filter(Boolean);
  return [];
}

/** Normalize keyed metrics (income, expenses, …) — object or array of items. */
export function toAnalyticsRecord(data) {
  if (!data) return {};
  if (Array.isArray(data)) {
    return Object.fromEntries(
      data.map((item, index) => [item?.key ?? String(index), item])
    );
  }
  if (typeof data === 'object') return data;
  return {};
}

export function formatPercentage(change) {
  if (change === null || change === undefined) return null;
  const num = Number(change);
  if (Number.isNaN(num)) return null;
  return `${num >= 0 ? '+' : ''}${num}%`;
}

export function formatMetricValue(item) {
  const value = item?.value;
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.filter(Boolean).join('، ') || '—';
  if (typeof value === 'object') return '—';

  if (typeof value === 'number') {
    return value.toLocaleString('ar-EG', {
      maximumFractionDigits: item?.type === 'currency' ? 2 : 0,
    });
  }

  return String(value);
}

/**
 * `linkFor` may be a static base path (old `${basePath}/${key}` route-segment style)
 * or a `(key) => string` builder (used for the `/home/reports?tab=...&period=key` query-param style).
 */
export function formatMap(record, linkFor, valueType = 'price') {
  const buildLink = typeof linkFor === 'function' ? linkFor : (key) => (linkFor ? `${linkFor}/${key}` : null);

  return Object.entries(toAnalyticsRecord(record)).map(([key, item]) => ({
    name: item?.label_ar ?? item?.label ?? key,
    value: formatMetricValue(item),
    valueType,
    percentage: formatPercentage(item?.percentage_change),
    type: key === 'total' ? (valueType === 'price' ? 'total' : 'total-regular') : key,
    link: buildLink(key),
  }));
}

/** Fixed display order for تحليلات الطلبات cards (matches dashboard layout). */
export function getOrderAnalyticsSortIndex(item) {
  const label = item?.label_ar ?? item?.label ?? "";
  const key = (item?.key ?? "").toLowerCase();

  if (key.includes("whatsapp") && key.includes("incomplete")) return 3;
  if (key.includes("whatsapp") && key.includes("complete")) return 2;
  if (key.includes("completion") || key.includes("completion_rate")) return 5;
  if (key.includes("return") || key.includes("refund")) return 4;
  if (key.includes("incomplete")) return 1;
  if (key.includes("complete") || key.includes("completed")) return 0;

  if (label.includes("واتساب") && (label.includes("غير") || label.includes("الغير"))) return 3;
  if (label.includes("واتساب") && label.includes("مكتمل")) return 2;
  if (label.includes("معدل")) return 5;
  if (label.includes("مسترج") || label.includes("استرجاع")) return 4;
  if (label.includes("غير") && label.includes("مكتمل")) return 1;
  if (label.includes("مكتمل")) return 0;

  return 999;
}

export function sortOrderAnalytics(items = []) {
  return [...items].sort(
    (a, b) => getOrderAnalyticsSortIndex(a) - getOrderAnalyticsSortIndex(b)
  );
}

export function normalizeDashboardAnalytics(raw) {
  if (!raw) return null;

  const financial = raw.financial_analytics ?? {};

  return {
    control_panel: toAnalyticsList(raw.control_panel),
    financial_analytics: {
      income: toAnalyticsRecord(financial.income),
      completed_orders: toAnalyticsRecord(financial.completed_orders),
      incomplete_orders: toAnalyticsRecord(financial.incomplete_orders),
      refunds: toAnalyticsRecord(financial.refunds),
      expenses: toAnalyticsRecord(financial.expenses),
    },
    user_analytics: raw.user_analytics ?? {},
    order_analytics: toAnalyticsList(raw.order_analytics),
    employee_analytics: toAnalyticsList(raw.employee_analytics),
    real_estate_and_units_analytics: {
      real_estates: toAnalyticsRecord(raw.real_estate_and_units_analytics?.real_estates),
      units: toAnalyticsRecord(raw.real_estate_and_units_analytics?.units),
    },
    location_analytics: toAnalyticsList(raw.location_analytics),
    order_transfer_analytics: toAnalyticsList(raw.order_transfer_analytics),
  };
}
