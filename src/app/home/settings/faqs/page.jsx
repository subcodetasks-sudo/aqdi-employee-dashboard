"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import { useState } from "react";
import AddFaqDialog from "@/components/analysis/settings/faqs/add-faq-dialog";
import EditFaqDialog from "@/components/analysis/settings/faqs/edit-faq-dialog";
import DeleteFaqDialog from "@/components/analysis/settings/faqs/delete-faq-dialog";
import {
  SettingsEmptyRow,
  SettingsLoadingRows,
  SettingsListHeader,
  SettingsPagination,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";

const PER_PAGE = 10;
const HEADERS = [
  "السؤال",
  "الجواب",
  { label: "الإجراءات", className: "text-left" },
];

export default function FaqsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const [currentPage, setCurrentPage] = useState(1);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ["faqs", currentPage],
    queryFn: () =>
      axiosInstance
        .get(`/admin/faqs?per_page=${PER_PAGE}&page=${currentPage}`)
        .then((res) => res?.data),
  });

  const faqs = responseData?.data?.items ?? [];
  const pagination = responseData?.data?.pagination;

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="الأسئلة الشائعة" action={<AddFaqDialog />} />

      <SettingsTable headers={HEADERS} minWidth="860px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={3} />
        ) : faqs.length === 0 ? (
          <SettingsEmptyRow colSpan={3} />
        ) : (
          faqs.map((faq) => (
            <SettingsTableRow key={faq.id}>
              <SettingsTd className="min-w-[200px] font-bold">
                {faq.title_ar || faq.title_trans || "—"}
              </SettingsTd>
              <SettingsTd className="max-w-[480px]">
                <p className="line-clamp-3 whitespace-pre-wrap text-[#4B5563]">
                  {faq.answer_ar || faq.answer_trans || "—"}
                </p>
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <EditFaqDialog faq={faq} />
                  <DeleteFaqDialog faq={faq} />
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>

      <SettingsPagination
        page={currentPage}
        lastPage={pagination?.last_page}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
