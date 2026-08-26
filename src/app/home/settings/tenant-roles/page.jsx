"use client";

import {
  useUnwrapPageProps
} from "@/src/hooks/use-unwrap-page-props";
import { useEffect, useState } from "react";
import TenantRoleFormDialog from "@/components/analysis/settings/tenant-roles/tenant-role-form-dialog";
import DeleteTenantRoleDialog from "@/components/analysis/settings/tenant-roles/delete-tenant-role-dialog";
import PermissionGate from "@/components/auth/PermissionGate";
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
} from "@/components/SystemSettings/shared";
import { Input } from "@/components/ui/input";
import { useAdminTenantRoles } from "@/src/hooks/use-admin-tenant-roles";
import { Search } from "lucide-react";

const PER_PAGE = 20;
const HEADERS = [
  "العنوان",
  { label: "حقل مستخدم", className: "text-center" },
  "ملخص الحقل",
  { label: "الإجراءات", className: "text-left" },
];

export default function TenantRolesPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { items, pagination, isLoading } = useAdminTenantRoles({
    search,
    page: currentPage,
    perPage: PER_PAGE,
    sortBy: "id",
    sortOrder: "asc",
  });

  return (
    <SettingsPageShell>
      <SettingsListHeader
        title="صلاحيات المستأجر"
        action={
          <PermissionGate section={PERMISSION_SECTIONS.tenant_roles} action="create">
            <TenantRoleFormDialog />
          </PermissionGate>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-placeholder" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="بحث في العنوان / التعريف / اسم الحقل..."
          className="h-11 pr-10 rounded-xl border-surface-border-soft bg-white"
        />
      </div>

      <SettingsTable headers={HEADERS} minWidth="860px">
        {isLoading ? (
          <SettingsLoadingRows colSpan={4} />
        ) : items.length === 0 ? (
          <SettingsEmptyRow colSpan={4} />
        ) : (
          items.map((role) => (
            <SettingsTableRow key={role.id}>
              <SettingsTd className="min-w-[220px]">
                <p className="font-bold">{role.text_of_reason || role.name || "—"}</p>
                {role.service_definition ? (
                  <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                    {String(role.service_definition)
                      .replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()}
                  </p>
                ) : null}
              </SettingsTd>
              <SettingsTd className="text-center">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-11 font-bold ${
                    role.has_user_input
                      ? "bg-[#E6F7EF] text-green-700"
                      : "bg-status-neutral-bg text-status-neutral"
                  }`}
                >
                  {role.has_user_input ? "نعم" : "لا"}
                </span>
              </SettingsTd>
              <SettingsTd>
                {role.has_user_input ? (
                  <div>
                    <p className="font-bold">{role.input_field_label || "—"}</p>
                    <p className="mt-0.5 text-11 text-gray-400">
                      النوع: {role.input_field_type || "—"}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </SettingsTd>
              <SettingsTd>
                <div className="flex items-center justify-end gap-2">
                  <PermissionGate section={PERMISSION_SECTIONS.tenant_roles} action="edit">
                    <TenantRoleFormDialog role={role} />
                  </PermissionGate>
                  <PermissionGate section={PERMISSION_SECTIONS.tenant_roles} action="delete">
                    <DeleteTenantRoleDialog role={role} />
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
