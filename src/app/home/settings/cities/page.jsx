"use client";

import AddNewCityDialog from "@/components/analysis/settings/cities/add-new-city-dialog";
import DeleteCityDialog from "@/components/analysis/settings/cities/delete-city-dialog";
import EditCityDialog from "@/components/analysis/settings/cities/edit-city-dialog";
import {
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";

const HEADERS = [
  "الاسم",
  { label: "المنطقة", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function CitiesPage() {
  const { data: cities, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: () => axiosInstance.get("/admin/cities"),
  });

  const data = cities?.data?.data?.items ?? [];

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="المدن" action={<AddNewCityDialog />} />

      <SettingsTable headers={HEADERS} minWidth="640px">
        {isLoading ? (
          <SettingsEmptyRow colSpan={3} message="جاري التحميل..." />
        ) : data.length === 0 ? (
          <SettingsEmptyRow colSpan={3} />
        ) : (
          data.map((row) => (
            <SettingsTableRow key={row.id}>
              <SettingsTd>{row?.name_ar}</SettingsTd>
              <SettingsTd className="text-center">
                {row?.regions?.name_ar || "—"}
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <EditCityDialog city={row} />
                  <DeleteCityDialog city={row} />
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </div>
  );
}
