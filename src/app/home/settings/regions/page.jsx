"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import AddNewRegionDialog from "@/components/analysis/settings/regions/add-new-region-dialog";
import DeleteRegionDialog from "@/components/analysis/settings/regions/delete-region-dialog";
import EditRegionDialog from "@/components/analysis/settings/regions/edit-region-dialog";
import {
  SettingsEmptyRow,
  SettingsLoadingRows,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";

const HEADERS = ["الاسم", { label: "الإجراءات", className: "text-left" }];

export default function RegionsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const { data: regions, isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: () => axiosInstance.get("/admin/regions"),
  });

  const data = regions?.data?.data?.items ?? [];

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="المناطق" action={<AddNewRegionDialog />} />

      <SettingsTable headers={HEADERS} minWidth="520px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={2} />
        ) : data.length === 0 ? (
          <SettingsEmptyRow colSpan={2} />
        ) : (
          data.map((row) => (
            <SettingsTableRow key={row.id}>
              <SettingsTd>{row?.name_ar}</SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <EditRegionDialog region={row} />
                  <DeleteRegionDialog region={row} />
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </div>
  );
}
