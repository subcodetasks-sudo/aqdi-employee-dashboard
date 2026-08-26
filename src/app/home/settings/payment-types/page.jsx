"use client";

import {
  useUnwrapPageProps
} from "@/src/hooks/use-unwrap-page-props";
import AddPaymentTypeDialog from "@/components/analysis/settings/payment-types/add-payment-type-dialog";
import EditPaymentTypeDialog from "@/components/analysis/settings/payment-types/edit-payment-type-dialog";
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
import {
  contractTypeLabel,
  extractAlertList,
  fetchBothContractTypes,
} from "@/components/SystemSettings/settings-list/fetch-contract-type-lists";
import { useQuery } from "@tanstack/react-query";

const HEADERS = [
  "الاسم",
  { label: "نوع العقد", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function PaymentTypesPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const { data = [], isLoading } = useQuery({
    queryKey: ["payment-types"],
    queryFn: () => fetchBothContractTypes("/admin/payment-types", extractAlertList),
  });

  return (
    <SettingsPageShell>
      <SettingsListHeader
        title="طرق الدفع"
        action={
          <PermissionGate section={PERMISSION_SECTIONS.app_content} action="create">
            <AddPaymentTypeDialog />
          </PermissionGate>
        }
      />

      <SettingsTable headers={HEADERS} minWidth="640px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={3} />
        ) : data.length === 0 ? (
          <SettingsEmptyRow colSpan={3} />
        ) : (
          data.map((item) => (
            <SettingsTableRow key={`${item.contract_type}-${item.id}`}>
              <SettingsTd>
                <div>
                  <p>{item.name_ar || item.name}</p>
                  {item.name_en ? (
                    <p className="mt-0.5 text-xs text-gray-400" dir="ltr">
                      {item.name_en}
                    </p>
                  ) : null}
                </div>
              </SettingsTd>
              <SettingsTd className="text-center">
                {contractTypeLabel(item.contract_type)}
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <PermissionGate section={PERMISSION_SECTIONS.app_content} action="edit">
                    <EditPaymentTypeDialog paymentType={item} />
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
