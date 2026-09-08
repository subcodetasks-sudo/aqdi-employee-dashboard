"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import {
  buildWebsiteImageFormData,
  extractWebsiteImages,
  WEBSITE_IMAGES_ENDPOINT,
  WEBSITE_IMAGES_QUERY_KEY,
} from "@/src/lib/website-images";

/** List + summary for the website-images SEO catalog. `isActive` is `true` / `false` / `null` (all). */
export function useWebsiteImages({ search = "", isActive = null, enabled = true } = {}) {
  const params = {};
  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;
  if (isActive === true) params.is_active = 1;
  if (isActive === false) params.is_active = 0;

  const query = useQuery({
    queryKey: [WEBSITE_IMAGES_QUERY_KEY, trimmed, isActive],
    queryFn: () =>
      axiosInstance
        .get(WEBSITE_IMAGES_ENDPOINT, { params })
        .then((res) => extractWebsiteImages(res?.data)),
    enabled,
    staleTime: 30_000,
  });

  return {
    items: query.data?.items ?? [],
    summary: query.data?.summary ?? {},
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

function invalidate(queryClient) {
  return queryClient.invalidateQueries({ queryKey: [WEBSITE_IMAGES_QUERY_KEY] });
}

/** Create a new catalog row (`website_images.create`). */
export function useCreateWebsiteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ form, imageFile, key }) =>
      axiosInstance.post(
        WEBSITE_IMAGES_ENDPOINT,
        buildWebsiteImageFormData(form, { imageFile, key }),
        { headers: { "Content-Type": "multipart/form-data" } }
      ),
    onSuccess: () => invalidate(queryClient),
  });
}

/**
 * Update alt / meta / label / flags for a row (`website_images.edit`).
 * POST `/{id}` + `_method=PUT` so an optional replacement `image` file is accepted.
 */
export function useUpdateWebsiteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form, imageFile }) => {
      const fd = buildWebsiteImageFormData(form, { imageFile });
      fd.append("_method", "PUT");
      return axiosInstance.post(`${WEBSITE_IMAGES_ENDPOINT}/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => invalidate(queryClient),
  });
}

/** Delete a catalog row (`website_images.delete`). */
export function useDeleteWebsiteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => axiosInstance.delete(`${WEBSITE_IMAGES_ENDPOINT}/${id}`),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Create missing catalog rows for known site assets without overwriting existing text (`website_images.create`). */
export function useSyncWebsiteImageDefaults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => axiosInstance.post(`${WEBSITE_IMAGES_ENDPOINT}/sync-defaults`),
    onSuccess: () => invalidate(queryClient),
  });
}
