"use client";

import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { isRealtimeDbConfigured, subscribeToPath } from "@/src/lib/firebase/database";

export const SEO_CRAWL_QUERY_KEY = "seo-crawl-dashboard";
export const SEO_CRAWL_ISSUES_QUERY_KEY = "seo-crawl-issues";
export const SEO_CRAWL_ISSUE_DETAILS_QUERY_KEY = "seo-crawl-issue-details";

const IN_PROGRESS_STATUSES = ["queued", "running"];
const POLL_INTERVAL = 3000;

export function isCrawlInProgress(status) {
  return IN_PROGRESS_STATUSES.includes(status);
}

export function useSeoCrawlDashboard({ runId, enabled = true } = {}) {
  // Fallback polling is toggled via `setPollFallback` (called from render, not an
  // effect) instead of a state prop — that would require this same hook's own
  // output (crawl status) to be known before this call, which isn't possible.
  const pollFallbackRef = useRef(false);

  const query = useQuery({
    queryKey: [SEO_CRAWL_QUERY_KEY, runId ?? null],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/seo-crawl", {
        params: runId ? { run_id: runId } : undefined,
      });
      return res.data?.data ?? null;
    },
    enabled,
    refetchInterval: () => (pollFallbackRef.current ? POLL_INTERVAL : false),
  });

  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    setPollFallback: (value) => {
      pollFallbackRef.current = value;
    },
  };
}

export function useSeoCrawlIssues({
  runId,
  type,
  severity,
  search,
  page = 1,
  perPage = 20,
  enabled = true,
} = {}) {
  const params = { page, per_page: perPage };
  if (runId) params.run_id = runId;
  if (type) params.type = type;
  if (severity) params.severity = severity;
  if (search) params.search = search;

  const query = useQuery({
    queryKey: [
      SEO_CRAWL_ISSUES_QUERY_KEY,
      runId ?? null,
      type ?? null,
      severity ?? null,
      search ?? "",
      page,
      perPage,
    ],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/seo-crawl/issues", { params });
      return res.data?.data ?? { items: [], pagination: null };
    },
    enabled,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Fetches a single issue's details — call with `enabled` tied to the modal/drawer being open, not on every row render. */
export function useSeoCrawlIssueDetails(issueId, { enabled = true } = {}) {
  const query = useQuery({
    queryKey: [SEO_CRAWL_ISSUE_DETAILS_QUERY_KEY, issueId ?? null],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/seo-crawl/issues/${issueId}`);
      return res.data?.data ?? null;
    },
    enabled: enabled && issueId != null,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 404 || status === 403) return false;
      return failureCount < 2;
    },
  });

  return {
    details: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useStartSeoCrawl() {
  return useMutation({
    mutationFn: (payload) => axiosInstance.post("/admin/seo-crawl/run", payload || {}),
  });
}

export function useStopSeoCrawl() {
  return useMutation({
    mutationFn: (runId) => axiosInstance.post("/admin/seo-crawl/stop", runId ? { run_id: runId } : {}),
  });
}

/**
 * Subscribes to a Realtime Database path (backend writes a full-replace status node there
 * while a crawl is queued/running). Falls back gracefully — `realtimeError` stays true and
 * the caller is expected to poll the REST dashboard instead — when RTDB isn't configured or
 * the listener errors (e.g. rules deny read).
 */
export function useSeoCrawlRealtime(path, { enabled = true } = {}) {
  const [liveStatus, setLiveStatus] = useState(null);
  const [listenerError, setListenerError] = useState(false);

  const configured = isRealtimeDbConfigured();
  const active = enabled && Boolean(path) && configured;

  useEffect(() => {
    if (!active) return undefined;

    const unsubscribe = subscribeToPath(
      path,
      (value) => setLiveStatus(value),
      () => setListenerError(true)
    );

    return () => unsubscribe?.();
  }, [path, active]);

  return { liveStatus, realtimeError: !configured || listenerError };
}
