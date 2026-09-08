"use client";

import { useQuery } from "@tanstack/react-query";
import PageSeoForm from "@/components/content/page-seo-form";
import Loader from "@/components/home/loader";
import { usePermissions } from "@/src/hooks/usePermissions";
import { CONTENT_PAGE_ENDPOINTS } from "@/src/lib/content-admin";
import { axiosInstance } from "@/src/utils/axios";

const READY_LOADING = (
  <div className="flex min-h-[80px] items-center justify-center">
    <Loader />
  </div>
);

const QUERY_LOADING = (
  <div className="flex min-h-[120px] items-center justify-center">
    <Loader />
  </div>
);

/**
 * Fetches + edits page-level SEO for a content-pages key (blogs / services / faqs / …).
 * Hidden without `{section}.view`; save disabled without `{section}.edit`
 * (system admin bypasses via `can()`).
 */
export default function ContentPageSeoPanel({
  pageKey,
  pageLabel,
  permissionSection,
  className = "mb-4",
}) {
  const { can, isReady } = usePermissions();
  const endpoint = CONTENT_PAGE_ENDPOINTS[pageKey];
  const queryKey = ["content-page", pageKey];

  const canView = !permissionSection || can(permissionSection, "view");
  const canEdit = !permissionSection || can(permissionSection, "edit");

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => axiosInstance.get(endpoint).then((res) => res?.data),
    enabled: Boolean(endpoint) && isReady && canView,
    staleTime: 30_000,
  });

  if (!endpoint) return null;
  if (!isReady) {
    return <div className={className}>{READY_LOADING}</div>;
  }
  if (!canView) return null;

  if (isLoading) {
    return <div className={className}>{QUERY_LOADING}</div>;
  }

  if (isError) {
    return (
      <div
        className={`rounded-xl border border-[#f0d3cd] bg-[#fdf0ee] p-4 text-[13px] font-bold text-[#c0392b] dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 ${className}`}
      >
        تعذر تحميل بيانات SEO لهذه الصفحة. تأكد أن الـ API يدعم{" "}
        <code dir="ltr">{endpoint}</code>.
      </div>
    );
  }

  return (
    <div className={className}>
      <PageSeoForm
        pageLabel={pageLabel}
        responseData={responseData}
        saveEndpoint={endpoint}
        queryKey={queryKey}
        canEdit={canEdit}
      />
    </div>
  );
}
