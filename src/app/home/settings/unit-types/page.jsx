"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import AddNewTypeDialog from "@/components/analysis/settings/unit-types/add-new-type-dialog";
import EditTypeUnitDialog from "@/components/analysis/settings/unit-types/edit-type-unit-dialog";
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
  contractTypeLabel,
  extractItems,
  fetchBothContractTypes,
} from "@/components/SystemSettings/settings-list/fetch-contract-type-lists";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const HEADERS = [
  "الاسم",
  { label: "تصنيف الوحدة", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function UnitTypesPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["unit-types"],
    queryFn: () => fetchBothContractTypes("/admin/unit-types", extractItems),
  });

  const { mutate: deleteItem, isPending } = useMutation({
    mutationFn: (id) => axiosInstance.post(`/admin/unit-types/${id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف نوع الوحدة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["unit-types"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف نوع الوحدة");
    },
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="أنواع الوحدات" action={<AddNewTypeDialog />} />

      <SettingsTable headers={HEADERS} minWidth="640px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={3} />
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
                  <EditTypeUnitDialog unit={item} />
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
