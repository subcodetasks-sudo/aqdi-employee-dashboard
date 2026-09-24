"use client";

import { useEffect, useState } from "react";
import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import ServicesPricingFormDialog from "@/components/analysis/settings/services-pricing/services-pricing-form-dialog";
import DeleteServicesPricingDialog from "@/components/analysis/settings/services-pricing/delete-services-pricing-dialog";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { settingsFieldClass } from "@/components/system-settings/settings-form-dialog";
import { useAdminServicesPricing } from "@/src/hooks/use-admin-services-pricing";
import { formatContractPeriodPrice } from "@/src/lib/contract-period-utils";
import { Search } from "lucide-react";

const PER_PAGE = 20;
const HEADERS = [
  "الخدمة",
  { label: "نوع العقد", className: "text-center" },
  { label: "السعر", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

function formatPrice(value) {
  return formatContractPeriodPrice(value) || "—";
}

export default function ServicesPricingPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [contractType, setContractType] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { items, pagination, isLoading } = useAdminServicesPricing({
    page: currentPage,
    perPage: PER_PAGE,
    search,
    contractType: contractType === "all" ? "" : contractType,
  });

  return (
    <SettingsPageShell>
      <SettingsListHeader
        title="أسعار الخدمات"
        action={
          <PermissionGate section={PERMISSION_SECTIONS.services_pricing} action="create">
            <ServicesPricingFormDialog />
          </PermissionGate>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-placeholder" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="بحث في اسم الخدمة..."
            className="h-11 pr-10 rounded-xl border-surface-border-soft bg-white"
          />
        </div>
        <div className="w-[180px]">
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
      </div>

      <SettingsTable headers={HEADERS} minWidth="720px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={4} />
        ) : items.length === 0 ? (
          <SettingsEmptyRow colSpan={4} />
        ) : (
          items.map((item) => (
            <SettingsTableRow key={item.id}>
              <SettingsTd>
                <div>
                  <p className="font-bold">{item.name_ar || item.name || "—"}</p>
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
              <SettingsTd className="text-center tabular-nums">
                {formatPrice(item.price)}
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <PermissionGate section={PERMISSION_SECTIONS.services_pricing} action="edit">
                    <ServicesPricingFormDialog item={item} />
                  </PermissionGate>
                  <PermissionGate section={PERMISSION_SECTIONS.services_pricing} action="delete">
                    <DeleteServicesPricingDialog item={item} />
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
