"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/src/utils/axios";
import { invalidateOrdersCaches } from "@/src/lib/invalidate-orders-caches";

export function updateOrderUrl(orderId) {
  return `/admin/orders/${orderId}`;
}

/** POST /admin/orders/{id} with an arbitrary body — accepts any updatable order field. */
export function useUpdateOrder({ queryKey, successMessage, onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, body }) => {
      if (orderId == null || orderId === "") {
        return Promise.reject(new Error("تعذر تحديد الطلب"));
      }
      return axiosInstance.post(updateOrderUrl(orderId), body);
    },
    onSuccess: (res, vars) => {
      invalidateOrdersCaches(queryClient, { queryKey, orderId: vars.orderId });
      toast.success(res?.data?.message || successMessage || "تم الحفظ بنجاح");
      onSuccess?.(res, vars);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء الحفظ");
      onError?.(err);
    },
  });
}
