"use client";

import Loader from "@/components/home/loader";

import {
  useUnwrapPageProps
} from "@/src/hooks/use-unwrap-page-props";
import ContentPageForm from "@/components/analysis/settings/terms/content-page-form";
import { SettingsContentCard, SettingsListHeader,
  SettingsPageShell,
} from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";

export default function PrivacyPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: () => axiosInstance.get("/admin/content/privacy").then((res) => res?.data),
  });

  const privacy = responseData?.data;

  return (
    <SettingsPageShell>
      <SettingsListHeader title="سياسة الخصوصية" subtitle="تحرير وتحديث محتوى سياسة الخصوصية" />

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <SettingsContentCard>
          <p className="text-center text-gray-400 py-10">تعذر تحميل المحتوى.</p>
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
    </SettingsPageShell>
  );
}
