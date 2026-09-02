"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { useMarketingPeriod } from "@/src/hooks/use-marketing-tracking";

/**
 * إدارة المحتوى tab — service pages (own CRUD) + articles (marketing view of
 * `/admin/blogs`, with per-article attribution + editorial queue).
 *
 *   GET/POST/PUT/DELETE /admin/marketing/service-pages[/{id}]
 *   GET                 /admin/marketing/articles?period=&category=&status=
 */

export const SERVICE_PAGES_QUERY_KEY = "marketing-service-pages";
export const MARKETING_ARTICLES_QUERY_KEY = "marketing-articles";

const retryUnlessClientError = (failureCount, error) => {
  const status = error?.response?.status;
  if ([401, 403, 404, 422].includes(status)) return false;
  return failureCount < 2;
};

export function useServicePages({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: [SERVICE_PAGES_QUERY_KEY],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/marketing/service-pages");
      return res?.data?.data ?? null;
    },
    enabled,
    staleTime: 60_000,
    retry: retryUnlessClientError,
  });

  return {
    summary: query.data?.summary ?? null,
    items: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useServicePageMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [SERVICE_PAGES_QUERY_KEY] });

  const create = useMutation({
    mutationFn: (body) =>
      axiosInstance.post("/admin/marketing/service-pages", body).then((r) => r?.data?.data),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, ...body }) =>
      axiosInstance.put(`/admin/marketing/service-pages/${id}`, body).then((r) => r?.data?.data),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) =>
      axiosInstance.delete(`/admin/marketing/service-pages/${id}`).then((r) => r?.data),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useMarketingArticles({ category, status, enabled = true } = {}) {
  const { queryParams } = useMarketingPeriod();
  const params = { ...queryParams };
  if (category && category !== "all") params.category = category;
  if (status) params.status = status;

  const query = useQuery({
    queryKey: [MARKETING_ARTICLES_QUERY_KEY, params],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/marketing/articles", { params });
      return res?.data?.data ?? null;
    },
    enabled,
    staleTime: 60_000,
    retry: retryUnlessClientError,
  });

  return {
    summary: query.data?.summary ?? null,
    categories: query.data?.categories ?? [],
    items: query.data?.items ?? [],
    editorialQueue: query.data?.editorial_queue ?? [],
    periods: query.data?.periods ?? null,
    currencyLabel: query.data?.currency_label_ar ?? "﷼",
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
