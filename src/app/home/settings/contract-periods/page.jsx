"use client";

import { useState } from "react";
import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import ContractPeriodFormDialog from "@/components/analysis/settings/contract-periods/contract-period-form-dialog";
import DeleteContractPeriodDialog from "@/components/analysis/settings/contract-periods/delete-contract-period-dialog";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  SettingsEmptyRow,
  SettingsLoadingRows,
  SettingsListHeader,
  SettingsPagination,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
  SettingsPageShell,
} from "@/components/system-settings/shared";
import { contractTypeLabel } from "@/components/system-settings/settings-list/fetch-contract-type-lists";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { settingsFieldClass } from "@/components/system-settings/settings-form-dialog";
import { useAdminContractPeriods } from "@/src/hooks/use-admin-contract-periods";
import { formatContractPeriodPrice } from "@/src/lib/contract-period-utils";

const PER_PAGE = 20;
const HEADERS = [
  "المدة",
  "الملاحظة",
  { label: "نوع العقد", className: "text-center" },
  { label: "الأشهر", className: "text-center" },
  { label: "السعر", className: "text-center" },
  { label: "رسوم التوثيق", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

function formatMonths(value) {
  if (value == null || value === "") return "—";
  return String(value);
}

function formatMoney(value) {
  return formatContractPeriodPrice(value) || "—";
}

export default function ContractPeriodsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const [currentPage, setCurrentPage] = useState(1);
  const [contractType, setContractType] = useState("all");

  const { items, pagination, isLoading } = useAdminContractPeriods({
    page: currentPage,
    perPage: PER_PAGE,
    contractType: contractType === "all" ? "" : contractType,
  });

  return (
    <SettingsPageShell>
      <SettingsListHeader
        title="مدة العقد"
        action={
          <PermissionGate section={PERMISSION_SECTIONS.contract_periods} action="create">
            <ContractPeriodFormDialog />
          </PermissionGate>
        }
      />

      <div className="max-w-xs">
        <Select
          dir="rtl"
          value={contractType}
          onValueChange={(value) => {
            setContractType(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue placeholder="نوع العقد" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="housing">سكني</SelectItem>
            <SelectItem value="commercial">تجاري</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SettingsTable headers={HEADERS} minWidth="980px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={7} />
        ) : items.length === 0 ? (
          <SettingsEmptyRow colSpan={7} />
        ) : (
          items.map((item) => (
            <SettingsTableRow key={item.id}>
              <SettingsTd>
                <p className="font-bold">{item.period || "—"}</p>
              </SettingsTd>
              <SettingsTd>
                <div>
                  <p>{item.note_ar || item.note || "—"}</p>
                  {item.note_en ? (
                    <p className="mt-0.5 text-xs text-gray-400" dir="ltr">
                      {item.note_en}
                    </p>
                  ) : null}
                </div>
              </SettingsTd>
              <SettingsTd className="text-center">
                {contractTypeLabel(item.contract_type)}
              </SettingsTd>
              <SettingsTd className="text-center tabular-nums">
                {formatMonths(item.total_months)}
              </SettingsTd>
              <SettingsTd className="text-center tabular-nums">
                {formatMoney(item.price)}
              </SettingsTd>
              <SettingsTd className="text-center tabular-nums">
                {formatMoney(item.doc_fee)}
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <PermissionGate section={PERMISSION_SECTIONS.contract_periods} action="edit">
                    <ContractPeriodFormDialog item={item} />
                  </PermissionGate>
                  <PermissionGate section={PERMISSION_SECTIONS.contract_periods} action="delete">
                    <DeleteContractPeriodDialog item={item} />
                  </PermissionGate>
                </div>
              </SettingsTd>
            </SettingsTableRow>
          ))
        )}
      </SettingsTable>

      <SettingsPagination
        page={currentPage}
        lastPage={pagination?.last_page}
        onPageChange={setCurrentPage}
      />
    </SettingsPageShell>
  );
}
