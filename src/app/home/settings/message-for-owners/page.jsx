"use client";

import AddNewMessageForClientDialog from "@/components/analysis/settings/message-for-clients/add-message-for-client";
import DisplayMessageForClientDialog from "@/components/analysis/settings/message-for-clients/display-message-for-client";
import {
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
} from "@/components/SystemSettings/shared";

const MOCK_ITEMS = [
  "نوع الوثيقة",
  "رقم وثيقة الملكية",
  "تاريخ وثيقة الملكية",
  "نوع الوحدة",
];

const HEADERS = [
  "القسم",
  "البند",
  { label: "الإجراءات", className: "text-left" },
];

export default function OwnerMessagesPage() {
  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="رسائل توضيحية للملاك" action={<AddNewMessageForClientDialog />} />

      <SettingsTable headers={HEADERS} minWidth="640px">
        {MOCK_ITEMS.length === 0 ? (
          <SettingsEmptyRow colSpan={3} />
        ) : (
          MOCK_ITEMS.map((item) => (
            <SettingsTableRow key={item}>
              <SettingsTd>قسم الصك</SettingsTd>
              <SettingsTd>{item}</SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <DisplayMessageForClientDialog />
                  <AddNewMessageForClientDialog isEdit />
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </div>
  );
}
