import { describe, expect, it } from "vitest";
import {
  findActiveCoupon,
  formatDiscountValue,
  getAppliesToLabel,
  isCouponActive,
  normalizeCouponListResponse,
  sortCouponsForDisplay,
} from "./use-client-discount";

describe("normalizeCouponListResponse", () => {
  it("unwraps a { data: { items: [...] } } envelope", () => {
    const response = { data: { data: { items: [{ id: 1 }, { id: 2 }] } } };
    expect(normalizeCouponListResponse(response)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("unwraps a { data: [...] } envelope", () => {
    const response = { data: { data: [{ id: 1 }] } };
    expect(normalizeCouponListResponse(response)).toEqual([{ id: 1 }]);
  });

  it("returns an empty array when the payload has no recognizable list", () => {
    expect(normalizeCouponListResponse({ data: { data: null } })).toEqual([]);
    expect(normalizeCouponListResponse(undefined)).toEqual([]);
  });
});

describe("isCouponActive", () => {
  it("treats a coupon with is_active: true as active", () => {
    expect(isCouponActive({ is_active: true })).toBe(true);
  });

  it("treats a coupon with is_active: false as inactive", () => {
    expect(isCouponActive({ is_active: false })).toBe(false);
  });

  it("treats a coupon with is_active: 0 (numeric flag) as inactive", () => {
    expect(isCouponActive({ is_active: 0 })).toBe(false);
  });

  it("treats a deactivated_at timestamp as inactive regardless of other flags", () => {
    expect(isCouponActive({ is_active: true, deactivated_at: "2026-01-01" })).toBe(false);
  });

  it("falls back to a status string when no is_active flag is present", () => {
    expect(isCouponActive({ status: "inactive" })).toBe(false);
    expect(isCouponActive({ status: "active" })).toBe(true);
  });

  it("defaults to active when no flag is present at all", () => {
    expect(isCouponActive({})).toBe(true);
  });
});

describe("findActiveCoupon", () => {
  it("returns the first active coupon in the list", () => {
    const coupons = [
      { id: 1, is_active: false },
      { id: 2, is_active: true },
      { id: 3, is_active: true },
    ];
    expect(findActiveCoupon(coupons)?.id).toBe(2);
  });

  it("returns null when no coupon is active", () => {
    const coupons = [{ id: 1, is_active: false }];
    expect(findActiveCoupon(coupons)).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(findActiveCoupon([])).toBeNull();
  });
});

describe("formatDiscountValue", () => {
  it("formats a percentage coupon with a % suffix", () => {
    expect(formatDiscountValue({ type_coupon: "percentage", value_coupon: 10 })).toBe("10%");
  });

  it("formats a fixed coupon with a ر.س suffix", () => {
    expect(formatDiscountValue({ type_coupon: "fixed", value_coupon: 50 })).toBe("50 ر.س");
  });

  it("falls back to the type/value field names as well", () => {
    expect(formatDiscountValue({ type: "fixed", value: 25 })).toBe("25 ر.س");
  });

  it("defaults to 0 when no value field is present", () => {
    expect(formatDiscountValue({ type: "percentage" })).toBe("0%");
  });
});

describe("getAppliesToLabel", () => {
  it("maps a known applies_to value to its Arabic label", () => {
    expect(getAppliesToLabel({ applies_to: "commercial" })).toBe("تجاري فقط");
    expect(getAppliesToLabel({ applies_to: "housing" })).toBe("سكني فقط");
    expect(getAppliesToLabel({ applies_to: "all" })).toBe("الكل");
  });

  it("defaults to the 'all' label when applies_to is missing or unrecognized", () => {
    expect(getAppliesToLabel({})).toBe("الكل");
    expect(getAppliesToLabel({ applies_to: "bogus" })).toBe("الكل");
  });
});

describe("sortCouponsForDisplay", () => {
  it("lists active coupons before inactive ones", () => {
    const coupons = [
      { id: 1, is_active: false },
      { id: 2, is_active: true },
    ];
    expect(sortCouponsForDisplay(coupons).map((c) => c.id)).toEqual([2, 1]);
  });

  it("orders coupons with the same status by most recently created first", () => {
    const coupons = [
      { id: 1, is_active: true, created_at: "2026-01-01" },
      { id: 2, is_active: true, created_at: "2026-03-01" },
      { id: 3, is_active: true, created_at: "2026-02-01" },
    ];
    expect(sortCouponsForDisplay(coupons).map((c) => c.id)).toEqual([2, 3, 1]);
  });

  it("does not mutate the input array", () => {
    const coupons = [
      { id: 1, is_active: false },
      { id: 2, is_active: true },
    ];
    const original = [...coupons];
    sortCouponsForDisplay(coupons);
    expect(coupons).toEqual(original);
  });
});
