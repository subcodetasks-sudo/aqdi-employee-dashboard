"use client";

import AddNewPropertyTypeDialog from "@/components/analysis/settings/property-types/add-new-property-type-dialog";
import EditTypePropertyDialog from "@/components/analysis/settings/property-types/edit-type-property-dialog";
import {
  SETTINGS_DELETE_TRIGGER_CLASS,
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import {
  contractTypeLabel,
  extractNestedData,
  fetchBothContractTypes,
} from "@/components/SystemSettings/settings-list/fetch-contract-type-lists";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const HEADERS = [
  "الاسم",
  { label: "تصنيف العقار", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function PropertyTypesPage() {
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["property-types"],
    queryFn: () =>
      fetchBothContractTypes("/admin/real-estate-types", extractNestedData),
  });

  const { mutate: deleteItem, isPending } = useMutation({
    mutationFn: (id) =>
      axiosInstance.post(`/admin/real-estate-types/${id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف نوع العقار بنجاح");
      queryClient.invalidateQueries({ queryKey: ["property-types"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف نوع العقار");
    },
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="أنواع العقار" action={<AddNewPropertyTypeDialog />} />

      <SettingsTable headers={HEADERS} minWidth="640px">
        {isLoading ? (
          <SettingsEmptyRow colSpan={3} message="جاري التحميل..." />
        ) : data.length === 0 ? (
          <SettingsEmptyRow colSpan={3} />
        ) : (
          data.map((item) => (
            <SettingsTableRow key={item.id}>
              <SettingsTd>{item.name_ar}</SettingsTd>
              <SettingsTd className="text-center">
                {contractTypeLabel(item.contract_type)}
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <EditTypePropertyDialog unit={item} />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => deleteItem(item.id)}
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
