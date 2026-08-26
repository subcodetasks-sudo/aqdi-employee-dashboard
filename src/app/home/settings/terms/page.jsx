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

export default function TermsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["terms-and-conditions"],
    queryFn: () =>
      axiosInstance.get("/admin/content/terms-and-conditions").then((res) => res?.data),
  });

  const terms = responseData?.data;

  return (
    <SettingsPageShell>
      <SettingsListHeader title="الشروط والأحكام" subtitle="تحرير وتحديث محتوى الشروط والأحكام" />

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <SettingsContentCard>
          <p className="text-center text-gray-400 py-10">تعذر تحميل المحتوى.</p>
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
    </SettingsPageShell>
  );
}
