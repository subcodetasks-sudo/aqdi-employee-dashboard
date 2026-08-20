"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { toast } from "sonner";
import { invalidateOrdersCaches } from "@/src/lib/invalidate-orders-caches";

export const RECEIVED_CONTRACTS_API = "/admin/received-contracts";
export const DEFAULT_RECEIVE_NOTES = "تم الاستلام";

export function getReceiveContractId(order) {
  return order?.id ?? order?.contract_id ?? null;
}

export function receiveContract(order, { notes = DEFAULT_RECEIVE_NOTES } = {}) {
  const contractId = getReceiveContractId(order);
  if (contractId == null || contractId === "") {
    return Promise.reject(new Error("معرّف العقد غير موجود"));
  }

  return axiosInstance.post(RECEIVED_CONTRACTS_API, {
    contract_id: contractId,
    notes,
  });
}

export function useReceiveContract({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order) => receiveContract(order),
    onSuccess: (res, order) => {
      invalidateOrdersCaches(queryClient, {
        orderId: getReceiveContractId(order),
      });
      toast.success(res?.data?.message || "تم استلام الطلب");
      onSuccess?.(res, order);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء استلام الطلب");
    },
  });
}
