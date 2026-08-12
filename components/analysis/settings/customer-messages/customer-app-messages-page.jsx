"use client";

import AddNewMessageForClientDialog from "@/components/analysis/settings/message-for-clients/add-message-for-client";
import DisplayMessageForClientDialog from "@/components/analysis/settings/message-for-clients/display-message-for-client";
import {
  SETTINGS_DELETE_TRIGGER_CLASS,
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import { useCustomerMessages } from "@/src/hooks/use-customer-messages";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const HEADERS = [
  "القسم",
  "البند",
  { label: "الإجراءات", className: "text-left" },
];

export default function CustomerAppMessagesPage() {
  const queryClient = useQueryClient();
  const { messages, isLoading } = useCustomerMessages("client");

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/admin/customer-messages/${id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الرسالة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["customer-messages"] });
      queryClient.invalidateQueries({ queryKey: ["message-alerts-client"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الرسالة");
    },
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader
        title="الرسائل التطبيقية للعميل"
        action={<AddNewMessageForClientDialog />}
      />

      <SettingsTable headers={HEADERS} minWidth="720px">
        {isLoading ? (
          <SettingsEmptyRow colSpan={3} message="جاري التحميل..." />
        ) : messages.length === 0 ? (
          <SettingsEmptyRow colSpan={3} />
        ) : (
          messages.map((item) => (
            <SettingsTableRow key={item.id}>
              <SettingsTd>
                {item.section?.name_ar || item.section?.name_en || "بدون قسم"}
              </SettingsTd>
              <SettingsTd>
                {item.section_item?.name_ar || item.section_item?.name_en || "بدون بند"}
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <DisplayMessageForClientDialog messageAlert={item} />
                  <AddNewMessageForClientDialog isEdit messageAlert={item} />
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
