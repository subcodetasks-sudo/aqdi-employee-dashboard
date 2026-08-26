/**
 * Pure logic for the per-client "custom discount" coupon feature
 * (POST/GET/deactivate on /admin/users/{id}/coupons).
 */

export const DISCOUNT_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
};

export const APPLIES_TO_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "housing", label: "سكني فقط" },
  { value: "commercial", label: "تجاري فقط" },
];

// The API has no endpoint for real per-contract fee data, so the impact
// panel is an illustrative live preview, not a real quote — these are
// placeholder figures for "a typical first-year contract".
const PREVIEW_BASE_FEE = 349;
const PREVIEW_MARGIN_RATIO = 0.304;

const PREVIEW_TRACKS = [
  { key: "housing", label: "سكني – السنة الأولى" },
  { key: "commercial", label: "تجاري – السنة الأولى" },
];

export function computeDiscountedAmount({ type, value, baseAmount }) {
  const base = Number(baseAmount) || 0;
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return { discount: 0, amountAfter: base };
  }

  const rawDiscount =
    type === DISCOUNT_TYPES.FIXED ? numericValue : (base * numericValue) / 100;
  const discount = Math.max(0, Math.min(rawDiscount, base));

  return { discount, amountAfter: base - discount };
}

export function getDiscountPreviewRows({ type, value, appliesTo }) {
  const tracks = PREVIEW_TRACKS.filter(
    (track) => !appliesTo || appliesTo === "all" || track.key === appliesTo
  );

  return tracks.map((track) => {
    const { discount, amountAfter } = computeDiscountedAmount({
      type,
      value,
      baseAmount: PREVIEW_BASE_FEE,
    });
    const margin = PREVIEW_BASE_FEE * PREVIEW_MARGIN_RATIO;

    return {
      key: track.key,
      label: track.label,
      baseFee: PREVIEW_BASE_FEE,
      discount,
      amountAfter,
      margin,
      isProfitable: margin - discount > 0,
    };
  });
}

export function buildAssignCouponPayload(values = {}) {
  const type =
    values.type === DISCOUNT_TYPES.FIXED ? DISCOUNT_TYPES.FIXED : DISCOUNT_TYPES.PERCENTAGE;

  const payload = {
    type,
    value: Number(values.value) || 0,
    applies_to: values.appliesTo || "all",
    reason: (values.reason || "").trim(),
    notify_on_login: Boolean(values.notifyOnLogin),
  };

  if (values.expiresAt) {
    payload.expires_at = values.expiresAt;
  }
  if (values.notifyOnLogin && values.notificationMessage) {
    payload.notification_message = values.notificationMessage.trim();
  }

  return payload;
}
