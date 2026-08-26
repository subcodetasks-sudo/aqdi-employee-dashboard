"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/src/utils/axios";
import { CLIENTS_API, CLIENT_QUERY_KEY } from "@/src/hooks/use-clients";
import { APPLIES_TO_OPTIONS, DISCOUNT_TYPES, buildAssignCouponPayload } from "@/src/lib/client-discount";

export const CLIENT_COUPONS_QUERY_KEY = "client-coupons";

function unwrapData(response) {
  const body = response?.data ?? response;
  return body?.data ?? body;
}

/** `GET /admin/users/{id}/coupons` — response shape isn't documented beyond the
 *  Postman collection, so this accepts either a bare array or an `{ items: [] }` page. */
export function normalizeCouponListResponse(response) {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export function isCouponActive(coupon = {}) {
  if (coupon.deactivated_at) return false;
  if (typeof coupon.is_active === "boolean") return coupon.is_active;
  if (coupon.is_active != null) return coupon.is_active === 1 || coupon.is_active === "1";
  if (coupon.status != null) return String(coupon.status).toLowerCase() === "active";
  return true;
}

export function findActiveCoupon(coupons = []) {
  return coupons.find(isCouponActive) ?? null;
}

export function formatDiscountValue(coupon = {}) {
  const type = coupon.type_coupon ?? coupon.type;
  const value = coupon.value_coupon ?? coupon.value ?? 0;
  return type === DISCOUNT_TYPES.FIXED ? `${value} ر.س` : `${value}%`;
}

export function getAppliesToLabel(coupon = {}) {
  const option = APPLIES_TO_OPTIONS.find((opt) => opt.value === coupon.applies_to);
  return option?.label ?? APPLIES_TO_OPTIONS[0].label;
}

/** Active coupons first, then most-recently-created first within each group. */
export function sortCouponsForDisplay(coupons = []) {
  return [...coupons].sort((a, b) => {
    const activeDiff = Number(isCouponActive(b)) - Number(isCouponActive(a));
    if (activeDiff !== 0) return activeDiff;
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
  });
}

export function useClientCoupons(clientId) {
  const query = useQuery({
    queryKey: [CLIENT_COUPONS_QUERY_KEY, String(clientId)],
    queryFn: async () => {
      const res = await axiosInstance.get(`${CLIENTS_API}/${clientId}/coupons`);
      return normalizeCouponListResponse(res);
    },
    enabled: clientId != null && clientId !== "",
  });

  const coupons = query.data ?? [];

  return {
    coupons,
    activeCoupon: findActiveCoupon(coupons),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** `POST /admin/users/{id}/coupons` — assigns a secret custom discount coupon. */
export function useAssignClientCoupon(clientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formValues) =>
      axiosInstance.post(`${CLIENTS_API}/${clientId}/coupons`, buildAssignCouponPayload(formValues)),
    onSuccess: (res) => {
      const data = unwrapData(res);
      const code = data?.secret_code ?? data?.code_coupon;
      toast.success(
        code ? `تم حفظ الخصم بنجاح — الرمز السري: ${code}` : res?.data?.message || "تم حفظ الخصم بنجاح"
      );
      queryClient.invalidateQueries({ queryKey: [CLIENT_COUPONS_QUERY_KEY, String(clientId)] });
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY, String(clientId)] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ الخصم");
    },
  });
}

/** `POST /admin/users/{id}/coupons/{couponId}/deactivate`. */
export function useDeactivateClientCoupon(clientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId) =>
      axiosInstance.post(`${CLIENTS_API}/${clientId}/coupons/${couponId}/deactivate`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إلغاء تفعيل الخصم");
      queryClient.invalidateQueries({ queryKey: [CLIENT_COUPONS_QUERY_KEY, String(clientId)] });
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY, String(clientId)] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إلغاء تفعيل الخصم");
    },
  });
}
