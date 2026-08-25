"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import AddNewMessageSectionDialog from "@/components/analysis/settings/message-sections/add-message-section-dialog";
import {
  SETTINGS_DELETE_TRIGGER_CLASS,
  SettingsEmptyRow,
  SettingsLoadingRows,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import {
  audienceLabel,
  extractAlertList,
  fetchAudienceLists,
} from "@/components/SystemSettings/settings-list/fetch-contract-type-lists";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const HEADERS = [
  "الاسم",
  { label: "النوع", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function MessageSectionsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["message-alert-sections"],
    queryFn: () =>
      fetchAudienceLists(
        (type) => `admin/message-alert-sections/${type}/options/list`,
        extractAlertList
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        return await axiosInstance.post(`/admin/message-alert-sections/${id}/delete`);
      } catch (e) {
        if (e.response?.status === 404 || e.response?.status === 405) {
          return await axiosInstance.delete(`/admin/message-alert-sections/${id}`);
        }
        throw e;
      }
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف القسم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["message-alert-sections"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف القسم");
    },
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="أقسام الرسائل" action={<AddNewMessageSectionDialog isEdit={false} />} />

      <SettingsTable headers={HEADERS} minWidth="640px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={3} />
        ) : data.length === 0 ? (
          <SettingsEmptyRow colSpan={3} />
        ) : (
          data.map((item) => (
            <SettingsTableRow key={`${item.type}-${item.id}`}>
              <SettingsTd>{item.name_ar}</SettingsTd>
              <SettingsTd className="text-center">{audienceLabel(item.type)}</SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <AddNewMessageSectionDialog isEdit section={item} defaultType={item.type} />
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(item.id)}
                    className={SETTINGS_DELETE_TRIGGER_CLASS}
                  >
                    حذف
                  </button>
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </div>
  );
}
