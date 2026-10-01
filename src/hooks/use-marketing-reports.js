"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { useMarketingPeriod } from "@/src/hooks/use-marketing-tracking";

/**
 * التقارير tab.
 *   GET  /admin/marketing/reports?period=&channel=
 *   GET  /admin/marketing/reports/channels?period=&channel=
 *   POST /admin/marketing/reports/export   { format, period, date_from, date_to, channel }
 */

export const MARKETING_REPORTS_QUERY_KEY = "marketing-reports";

const retryUnlessClientError = (failureCount, error) => {
  const status = error?.response?.status;
  if ([401, 403, 404, 422].includes(status)) return false;
  return failureCount < 2;
};

function useReportQuery(segment, channel, enabled) {
  const { queryParams } = useMarketingPeriod();
  const params = { ...queryParams };
  if (channel && channel !== "all") params.channel = channel;

  const query = useQuery({
    queryKey: [MARKETING_REPORTS_QUERY_KEY, segment, params],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/marketing/reports${segment ? `/${segment}` : ""}`,
        { params }
      );
      return res?.data?.data ?? null;
    },
    enabled,
    staleTime: 60_000,
    retry: retryUnlessClientError,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMarketingReport({ channel, enabled = true } = {}) {
  return useReportQuery("", channel, enabled);
}

export function useMarketingReportChannels({ channel, enabled = true } = {}) {
  return useReportQuery("channels", channel, enabled);
}

const EXT = { pdf: "pdf", xlsx: "xlsx", csv: "csv" };

/** Export the marketing report. `pdf`/`xlsx`/`csv` download a file; `email` returns JSON. */
export function useExportMarketingReport() {
  const { queryParams } = useMarketingPeriod();

  return useMutation({
    mutationFn: async ({ format, channel }) => {
      const payload = {
        format,
        period: queryParams.period,
        date_from: queryParams.date_from ?? null,
        date_to: queryParams.date_to ?? null,
        channel: channel && channel !== "all" ? channel : "all",
      };

      if (format === "email") {
        const res = await axiosInstance.post("/admin/marketing/reports/export", payload);
        return { emailed: true, message: res?.data?.message };
      }

      const res = await axiosInstance.post("/admin/marketing/reports/export", payload, {
        responseType: "blob",
      });

      // Backend may hand back a link instead of the bytes.
      const type = res?.data?.type || "";
      if (type.includes("application/json")) {
        const text = await res.data.text();
        const url = JSON.parse(text)?.data?.url;
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
          return { downloaded: true };
        }
        throw new Error("no file url");
      }

      const blobUrl = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `marketing-report-${new Date().toISOString().slice(0, 10)}.${EXT[format] || "bin"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      return { downloaded: true };
    },
  });
}
