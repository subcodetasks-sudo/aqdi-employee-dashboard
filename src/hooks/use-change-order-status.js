"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateOrdersCaches } from "@/src/lib/invalidate-orders-caches";
import { postOrderStatus } from "@/src/lib/order-status-api";

export function useChangeOrderStatus({ queryKey, onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, statusId, extraValues, fields }) =>
      postOrderStatus(orderId, { statusId, extraValues, fields }),
    onSuccess: (res, vars) => {
      invalidateOrdersCaches(queryClient, {
        queryKey,
        orderId: vars.orderId,
      });
      toast.success(res?.data?.message || "تم تغيير حالة الطلب");
      onSuccess?.(res, vars);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء تغيير حالة الطلب");
      onError?.(err);
    },
  });
}
