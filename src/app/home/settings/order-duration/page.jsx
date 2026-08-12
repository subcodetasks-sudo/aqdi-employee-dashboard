"use client";

import AddNewDurationDialog from "@/components/analysis/settings/order-duration/add-new-duration-dialog";
import EditDurationDialog from "@/components/analysis/settings/order-duration/edit-duration-dialog";
import ViewDurationDialog from "@/components/analysis/settings/order-duration/view-duration-dialog";
import {
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";
import { fetchBothContractTypes } from "@/components/SystemSettings/settings-list/fetch-contract-type-lists";
import {
  formatContractPeriodPrice,
  getContractPeriodLabel,
  getContractTypeLabel,
  normalizeContractPeriods,
} from "@/src/lib/contract-period-utils";
import { getInstrumentTypeLabel } from "@/src/lib/instrument-types";
import { useQuery } from "@tanstack/react-query";

const HEADERS = [
  "الاسم",
  { label: "نوع العقد", className: "text-center" },
  { label: "تصنيف الوثيقة", className: "text-center" },
  { label: "السعر", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function OrderDurationPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["contract-periods"],
    queryFn: () =>
      fetchBothContractTypes("/admin/contract-periods", (res) =>
        normalizeContractPeriods(res?.data)
      ),
  });

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="مدة الطلب" action={<AddNewDurationDialog />} />

      <SettingsTable headers={HEADERS} minWidth="860px">
        {isLoading ? (
          <SettingsEmptyRow colSpan={5} message="جاري التحميل..." />
        ) : data.length === 0 ? (
          <SettingsEmptyRow colSpan={5} />
        ) : (
          data.map((item) => (
            <SettingsTableRow key={item.id}>
              <SettingsTd>{getContractPeriodLabel(item)}</SettingsTd>
              <SettingsTd className="text-center">
                {getContractTypeLabel(item.contract_type)}
              </SettingsTd>
              <SettingsTd className="text-center">
                {getInstrumentTypeLabel(item.instrument_type)}
              </SettingsTd>
              <SettingsTd className="text-center tabular-nums">
                {formatContractPeriodPrice(item?.price) || "—"}
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <ViewDurationDialog duration={item} />
                  <EditDurationDialog duration={item} />
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </div>
  );
}
