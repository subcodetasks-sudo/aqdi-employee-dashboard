"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";

/**
 * Marketing "Related APIs" from the tracking collection — the pieces that feed
 * data into the tracking screens (they are not the tracking screens themselves):
 *
 *   GET  /admin/reports/marketing/utm-template   → UTM builder + ad-account status
 *   POST /admin/reports/marketing/spend          → manual / CSV ad-spend import
 *   POST /admin/reports/marketing/sync           → pull spend from connected ad accounts
 *   GET  /admin/seo-google/status                → Search Console connection state
 *   POST /admin/seo-google/connect               → OAuth auth_url
 *   GET/POST /admin/seo-google/search-console/sites → list / choose property
 */

export const UTM_TEMPLATE_QUERY_KEY = "marketing-utm-template";
export const GOOGLE_SEO_STATUS_QUERY_KEY = "google-seo-status";
export const SEARCH_CONSOLE_SITES_QUERY_KEY = "search-console-sites";

const retryUnlessClientError = (failureCount, error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 404 || status === 422 || status === 500) {
    return false;
  }
  return failureCount < 2;
};

/** Canonical utm_source values, tagged-URL template, and per-platform ad-account status. */
export function useUtmTemplate({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: [UTM_TEMPLATE_QUERY_KEY],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/reports/marketing/utm-template");
      return res?.data?.data ?? null;
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: retryUnlessClientError,
  });

  return {
    template: query.data?.template ?? null,
    example: query.data?.example ?? null,
    whatsappExample: query.data?.whatsapp_example ?? null,
    clickIds: query.data?.click_ids ?? [],
    sources: query.data?.sources ?? [],
    accounts: query.data?.accounts ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Manual / CSV ad-spend import. `rows` = [{ spent_on, platform, campaign_id, campaign_name, spend, currency, impressions, clicks }]. */
export function useImportAdSpend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows) =>
      axiosInstance
        .post("/admin/reports/marketing/spend", { rows })
        .then((res) => res?.data?.data ?? null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-tracking"] });
    },
  });
}

/** Pull spend from connected ad accounts. `payload` = { days, platform? }. */
export function useSyncAdSpend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload = {}) =>
      axiosInstance
        .post("/admin/reports/marketing/sync", payload)
        .then((res) => res?.data?.data ?? null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-tracking"] });
    },
  });
}

/**
 * Google (Search Console + Analytics) connection status. The backend currently
 * 500s here until the `google_seo_connections` table exists — surfaced as
 * `unavailable` so the UI can show a calm "not available yet" instead of an error.
 */
export function useGoogleSeoStatus({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: [GOOGLE_SEO_STATUS_QUERY_KEY],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/seo-google/status");
      return res?.data?.data ?? null;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: retryUnlessClientError,
  });

  const status = query.error?.response?.status;
  return {
    status: query.data ?? null,
    connected: Boolean(query.data?.connected),
    isLoading: query.isLoading,
    error: query.error,
    // 500 / 422 here means "backend feature not provisioned", not a transient failure.
    unavailable: status === 500 || status === 422,
    refetch: query.refetch,
  };
}

export function useConnectGoogleSeo() {
  return useMutation({
    mutationFn: () =>
      axiosInstance
        .post("/admin/seo-google/connect", {})
        .then((res) => res?.data?.data ?? null),
  });
}

export function useSearchConsoleSites({ enabled = false } = {}) {
  const query = useQuery({
    queryKey: [SEARCH_CONSOLE_SITES_QUERY_KEY],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/seo-google/search-console/sites");
      return res?.data?.data ?? null;
    },
    enabled,
    retry: retryUnlessClientError,
  });
  return {
    sites: query.data?.sites ?? query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSelectSearchConsoleSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (siteUrl) =>
      axiosInstance
        .post("/admin/seo-google/search-console/sites", { site_url: siteUrl })
        .then((res) => res?.data?.data ?? null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOOGLE_SEO_STATUS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["marketing-tracking"] });
    },
  });
}
