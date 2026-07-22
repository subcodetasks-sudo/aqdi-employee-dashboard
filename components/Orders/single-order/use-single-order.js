"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { toast } from "sonner";
import { mapApiValidationErrors } from "@/src/lib/contract-update";
import { invalidateOrdersCaches } from "@/src/lib/invalidate-orders-caches";

export function useSingleOrder(contractId) {
  const queryClient = useQueryClient();
  const queryKey = ["single-order", contractId];
  const unitsQueryKey = ["order-units", contractId];

  const query = useQuery({
    queryKey,
    queryFn: () =>
      axiosInstance.get(`/admin/orders/${contractId}`).then((res) => res.data),
    enabled: Boolean(contractId),
  });

  const orderData = query.data?.data;

  const invalidateOrderAndUnits = (res) => {
    if (res?.data && !Array.isArray(res.data) && res.data?.id === Number(contractId)) {
      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        data: res.data,
      }));
    } else {
      queryClient.invalidateQueries({ queryKey });
    }
    queryClient.invalidateQueries({ queryKey: unitsQueryKey });
    invalidateOrdersCaches(queryClient, { queryKey, orderId: contractId });
  };

  const handleMutationError = (error) => {
    const apiErrors = error?.response?.data?.errors;
    if (apiErrors) {
      const mapped = mapApiValidationErrors(apiErrors);
      const first = Object.values(mapped)[0];
      toast.error(first || error?.response?.data?.message || "خطأ في التحقق");
      throw { fieldErrors: mapped, message: error?.response?.data?.message };
    }
    toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ البيانات");
    throw error;
  };

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance
        .post(`/admin/orders/${contractId}`, payload)
        .then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res?.message || "تم تحديث بيانات العقد بنجاح");
      invalidateOrderAndUnits(res);
    },
    onError: handleMutationError,
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ unitId, payload }) =>
      axiosInstance
        .post(`/admin/orders/${contractId}/units/${unitId}`, payload)
        .then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res?.message || "تم تحديث الوحدة بنجاح");
      invalidateOrderAndUnits(res);
      query.refetch();
    },
    onError: handleMutationError,
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (unitId) =>
      axiosInstance
        .post(`/admin/orders/${contractId}/units/${unitId}/delete`)
        .then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res?.message || "تم فصل الوحدة عن العقد");
      invalidateOrderAndUnits(res);
      query.refetch();
    },
    onError: handleMutationError,
  });

  return {
    orderData,
    contractId,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateContract: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    updateUnit: (unitId, payload) =>
      updateUnitMutation.mutateAsync({ unitId, payload }),
    deleteUnit: deleteUnitMutation.mutateAsync,
    isSavingUnit: updateUnitMutation.isPending,
    isDeletingUnit: deleteUnitMutation.isPending,
  };
}
