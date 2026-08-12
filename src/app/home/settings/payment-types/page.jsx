"use client";

import AddPaymentTypeDialog from "@/components/analysis/settings/payment-types/add-payment-type-dialog";
import EditPaymentTypeDialog from "@/components/analysis/settings/payment-types/edit-payment-type-dialog";
import {
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
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

export default function PaymentTypesPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["payment-types"],
    queryFn: () => fetchBothContractTypes("/admin/payment-types", extractAlertList),
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="طرق الدفع" action={<AddPaymentTypeDialog />} />

      <SettingsTable headers={HEADERS} minWidth="640px">
        {isLoading ? (
          <SettingsEmptyRow colSpan={3} message="جاري التحميل..." />
        ) : data.length === 0 ? (
          <SettingsEmptyRow colSpan={3} />
        ) : (
          data.map((item) => (
            <SettingsTableRow key={`${item.contract_type}-${item.id}`}>
              <SettingsTd>
                <div>
                  <p>{item.name_ar || item.name}</p>
                  {item.name_en ? (
                    <p className="mt-0.5 text-[12px] text-[#9CA3AF]" dir="ltr">
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
                  <EditPaymentTypeDialog paymentType={item} />
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </div>
  );
}
