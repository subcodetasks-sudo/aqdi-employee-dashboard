"use client";

import {
  useUnwrapPageProps
} from "@/src/hooks/use-unwrap-page-props";
import AddNewCityDialog from "@/components/analysis/settings/cities/add-new-city-dialog";
import DeleteCityDialog from "@/components/analysis/settings/cities/delete-city-dialog";
import EditCityDialog from "@/components/analysis/settings/cities/edit-city-dialog";
import PermissionGate from "@/components/auth/PermissionGate";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  SettingsEmptyRow,
  SettingsLoadingRows,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
  SettingsPageShell,
} from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";

const HEADERS = [
  "الاسم",
  { label: "المنطقة", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function CitiesPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const { data: cities, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: () => axiosInstance.get("/admin/cities"),
  });

  const data = cities?.data?.data?.items ?? [];

  return (
    <SettingsPageShell>
      <SettingsListHeader
        title="المدن"
        action={
          <PermissionGate section={PERMISSION_SECTIONS.cities} action="create">
            <AddNewCityDialog />
          </PermissionGate>
        }
      />

      <SettingsTable headers={HEADERS} minWidth="640px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={3} />
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
                  <PermissionGate section={PERMISSION_SECTIONS.cities} action="edit">
                    <EditCityDialog city={row} />
                  </PermissionGate>
                  <PermissionGate section={PERMISSION_SECTIONS.cities} action="delete">
                    <DeleteCityDialog city={row} />
                  </PermissionGate>
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </SettingsPageShell>
  );
}
