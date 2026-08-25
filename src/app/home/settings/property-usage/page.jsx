"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import AddNewPropertyUsageDialog from "@/components/analysis/settings/property-usage/add-new-property-usage-dialog";
import EditUsagePropertyDialog from "@/components/analysis/settings/property-usage/edit-usage-property-dialog";
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
  { label: "تصنيف العقار", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function PropertyUsagePage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["property-usage"],
    queryFn: () =>
      fetchBothContractTypes("/admin/real-estate-usages", extractItems),
  });

  const { mutate: deleteItem, isPending } = useMutation({
    mutationFn: (id) =>
      axiosInstance.post(`/admin/real-estate-usages/${id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف استخدام العقار بنجاح");
      queryClient.invalidateQueries({ queryKey: ["property-usage"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء حذف استخدام العقار"
      );
    },
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader
        title="استخدام العقار"
        action={<AddNewPropertyUsageDialog />}
      />

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
                  <EditUsagePropertyDialog unit={item} />
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
