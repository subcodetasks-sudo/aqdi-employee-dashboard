"use client";

import ContentPageForm from "@/components/analysis/settings/terms/content-page-form";
import { SettingsContentCard, SettingsListHeader } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";

export default function TermsPage() {
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["terms-and-conditions"],
    queryFn: () =>
      axiosInstance.get("/admin/content/terms-and-conditions").then((res) => res?.data),
  });

  const terms = responseData?.data;

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="الشروط والأحكام" subtitle="تحرير وتحديث محتوى الشروط والأحكام" />

      {isLoading ? (
        <SettingsContentCard>
          <p className="text-center text-[#9CA3AF] py-10">جاري التحميل...</p>
        </SettingsContentCard>
      ) : isError ? (
        <SettingsContentCard>
          <p className="text-center text-[#9CA3AF] py-10">تعذر تحميل المحتوى.</p>
        </SettingsContentCard>
      ) : (
        <SettingsContentCard>
          <ContentPageForm
            content={terms}
            saveEndpoint="/admin/content/terms-and-conditions"
            queryKey="terms-and-conditions"
          />
        </SettingsContentCard>
      )}
    </div>
  );
}
