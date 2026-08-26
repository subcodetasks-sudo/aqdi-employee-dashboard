"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import AddNewRegionDialog from "@/components/analysis/settings/regions/add-new-region-dialog";
import DeleteRegionDialog from "@/components/analysis/settings/regions/delete-region-dialog";
import EditRegionDialog from "@/components/analysis/settings/regions/edit-region-dialog";
import PermissionGate from "@/components/auth/PermissionGate";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  SettingsActions,
  SettingsEmptyRow,
  SettingsLoadingRows,
  SettingsListHeader,
  SettingsPageShell,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";

const HEADERS = ["الاسم", "الإجراءات"];

export default function RegionsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const { data: regions, isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: () => axiosInstance.get("/admin/regions"),
  });

  const data = regions?.data?.data?.items ?? [];

  return (
    <SettingsPageShell>
      <SettingsListHeader
        title="المناطق"
        subtitle="قائمة"
        action={
          <PermissionGate section={PERMISSION_SECTIONS.regions} action="create">
            <AddNewRegionDialog />
          </PermissionGate>
        }
      />

      <SettingsTable headers={HEADERS} minWidth="480px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={2} />
        ) : data.length === 0 ? (
          <SettingsEmptyRow colSpan={2} />
        ) : (
          data.map((row) => (
            <SettingsTableRow key={row.id}>
              <SettingsTd>{row?.name_ar}</SettingsTd>
              <SettingsTd>
                <SettingsActions>
                  <PermissionGate section={PERMISSION_SECTIONS.regions} action="edit">
                    <EditRegionDialog region={row} />
                  </PermissionGate>
                  <PermissionGate section={PERMISSION_SECTIONS.regions} action="delete">
                    <DeleteRegionDialog region={row} />
                  </PermissionGate>
                </SettingsActions>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </SettingsPageShell>
  );
}
