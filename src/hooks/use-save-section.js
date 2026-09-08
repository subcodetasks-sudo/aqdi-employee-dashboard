"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/src/utils/axios";

/**
 * Shared save mutation for the content-admin section forms.
 * Detects `FormData` payloads and sets the multipart header automatically,
 * so callers can pass either a plain object or a `FormData` instance.
 */
export function useSaveSection({ saveEndpoint, queryKey }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) =>
      axiosInstance.post(
        saveEndpoint,
        payload,
        payload instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : undefined
      ),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حفظ القسم بنجاح");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ القسم");
    },
  });

  return { saveSection: mutate, isPending };
}
