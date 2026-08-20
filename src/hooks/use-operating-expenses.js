"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

const OPERATING_EXPENSES_API = "/admin/operating-expenses";

async function fetchOperatingExpenses({ search, createdAt, page, perPage }) {
  const params = { page, per_page: perPage };
  if (search) params.search = search;
  if (createdAt && createdAt !== "all") params.created_at = createdAt;

  const res = await axiosInstance.get(OPERATING_EXPENSES_API, { params });
  return res.data?.data;
}

/** GET /admin/operating-expenses — list + pagination + summary (count, total_amount). */
export function useOperatingExpenses({ search, createdAt, page = 1, perPage = 20 }) {
  return useQuery({
    queryKey: ["operating-expenses", search, createdAt, page, perPage],
    queryFn: () => fetchOperatingExpenses({ search, createdAt, page, perPage }),
    placeholderData: (previousData) => previousData,
  });
}

/** POST /admin/operating-expenses — create. Body: { expense, amount }. */
export function useCreateOperatingExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => axiosInstance.post(OPERATING_EXPENSES_API, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operating-expenses"] });
    },
  });
}

/** PUT /admin/operating-expenses/{id} — update. Same body shape as create. */
export function useUpdateOperatingExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      axiosInstance.put(`${OPERATING_EXPENSES_API}/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operating-expenses"] });
    },
  });
}

/** DELETE /admin/operating-expenses/{id} — soft delete. */
export function useDeleteOperatingExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => axiosInstance.delete(`${OPERATING_EXPENSES_API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operating-expenses"] });
    },
  });
}
