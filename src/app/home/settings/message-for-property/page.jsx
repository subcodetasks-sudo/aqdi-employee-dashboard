"use client";

import AddNewMessageForPropertyDialog from "@/components/analysis/settings/message-for-property/add-message-for-property";
import DisplayMessageForPropertyDialog from "@/components/analysis/settings/message-for-property/display-message-for-property";
import {
  SETTINGS_DELETE_TRIGGER_CLASS,
  SettingsEmptyRow,
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

export default function PropertyTermsPage() {
  const queryClient = useQueryClient();

  const { data: alertsResponse, isLoading } = useQuery({
    queryKey: ["message-alerts-property"],
    queryFn: () => axiosInstance.get("/admin/message-alerts/property").then((res) => res.data),
  });

  const alerts = alertsResponse?.data?.items || alertsResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        return await axiosInstance.post(`/admin/message-alerts/property/${id}/delete`);
      } catch (e) {
        if (e.response?.status === 404 || e.response?.status === 405) {
          return await axiosInstance.delete(`/admin/message-alerts/property/${id}`);
        }
        throw e;
      }
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الرسالة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["message-alerts-property"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الرسالة");
    },
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader
        title="رسائل توضيحية للعقار"
        action={<AddNewMessageForPropertyDialog isEdit={false} />}
      />

      <SettingsTable headers={HEADERS} minWidth="860px">
        {isLoading ? (
          <SettingsEmptyRow colSpan={4} message="جاري التحميل..." />
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
                  <DisplayMessageForPropertyDialog messageAlert={item} />
                  <AddNewMessageForPropertyDialog isEdit messageAlert={item} />
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
