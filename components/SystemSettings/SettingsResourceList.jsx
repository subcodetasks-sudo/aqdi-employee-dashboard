"use client";

import PermissionGate from "@/components/auth/PermissionGate";
import { useSettingsList } from "@/src/hooks/use-settings-list";
import {
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsLoadingRows,
  SettingsPageShell,
  SettingsTable,
  SettingsTableRow,
} from "./shared";

/**
 * Generic settings list scaffold — pass columns, row renderer, and CRUD dialog slots.
 * Use for simple reference-data admin pages (regions, cities, unit types, etc.).
 */
export default function SettingsResourceList({
  title,
  subtitle = "قائمة",
  backHref = "/home/settings",
  permissionSection,
  queryKey,
  endpoint,
  params,
  headers,
  minWidth = "480px",
  getRowKey = (row) => row.id,
  renderCreateAction,
  renderRow,
  emptyMessage,
}) {
  const { items, isLoading } = useSettingsList({ queryKey, endpoint, params });
  const colSpan = Array.isArray(headers) ? headers.length : 2;

  return (
    <SettingsPageShell>
      <SettingsListHeader
        title={title}
        subtitle={subtitle}
        backHref={backHref}
        action={
          permissionSection && renderCreateAction ? (
            <PermissionGate section={permissionSection} action="create">
              {renderCreateAction()}
            </PermissionGate>
          ) : (
            renderCreateAction?.()
          )
        }
      />

      <SettingsTable headers={headers} minWidth={minWidth}>
        {isLoading ? (
          <SettingsLoadingRows colSpan={colSpan} />
        ) : items.length === 0 ? (
          <SettingsEmptyRow colSpan={colSpan} message={emptyMessage} />
        ) : (
          items.map((row) => (
            <SettingsTableRow key={getRowKey(row)}>{renderRow(row)}</SettingsTableRow>
          ))
        )}
      </SettingsTable>
    </SettingsPageShell>
  );
}
