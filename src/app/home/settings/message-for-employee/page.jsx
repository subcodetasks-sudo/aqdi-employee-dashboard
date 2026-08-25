"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import AddNewMessageForEmployeeDialog from "@/components/analysis/settings/message-for-employees/add-message-for-employee";
import DisplayMessageForEmployeeDialog from "@/components/analysis/settings/message-for-employees/display-message-for-employee";
import {
  SETTINGS_DELETE_TRIGGER_CLASS,
  SettingsEmptyRow,
  SettingsLoadingRows,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const HEADERS = [
  "القسم",
  "البند",
  "الرسالة",
  { label: "الإجراءات", className: "text-left" },
];

export default function EmployeeTermsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const queryClient = useQueryClient();

  const { data: alertsResponse, isLoading } = useQuery({
    queryKey: ["message-alerts-employee"],
    queryFn: () => axiosInstance.get("/admin/message-alerts/employee").then((res) => res.data),
  });

  const alerts = alertsResponse?.data?.items || alertsResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/admin/message-alerts/employee/${id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الرسالة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["message-alerts-employee"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الرسالة");
    },
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader
        title="رسائل توضيحية للموظفين"
        action={<AddNewMessageForEmployeeDialog isEdit={false} />}
      />

      <SettingsTable headers={HEADERS} minWidth="860px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={4} />
        ) : alerts.length === 0 ? (
          <SettingsEmptyRow colSpan={4} />
        ) : (
          alerts.map((item) => (
            <SettingsTableRow key={item.id}>
              <SettingsTd>{item.section?.name_ar || "بدون قسم"}</SettingsTd>
              <SettingsTd>{item.section_item?.name_ar || item?.message || "بدون بند"}</SettingsTd>
              <SettingsTd className="max-w-[320px]">
                <p className="line-clamp-2">{item?.message || "—"}</p>
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <DisplayMessageForEmployeeDialog messageAlert={item} />
                  <AddNewMessageForEmployeeDialog isEdit messageAlert={item} />
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
