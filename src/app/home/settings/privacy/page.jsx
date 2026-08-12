"use client";

import ContentPageForm from "@/components/analysis/settings/terms/content-page-form";
import { SettingsContentCard, SettingsListHeader } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";

export default function PrivacyPage() {
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: () => axiosInstance.get("/admin/content/privacy").then((res) => res?.data),
  });

  const privacy = responseData?.data;

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="سياسة الخصوصية" subtitle="تحرير وتحديث محتوى سياسة الخصوصية" />

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
            content={privacy}
            saveEndpoint="/admin/content/privacy"
            queryKey="privacy-policy"
          />
        </SettingsContentCard>
      )}
    </div>
  );
}
