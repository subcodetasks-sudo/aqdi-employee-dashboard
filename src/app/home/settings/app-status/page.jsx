"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import PermissionGate from "@/components/auth/PermissionGate";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  SettingsListHeader,
  SettingsPageShell,
} from "@/components/SystemSettings/shared";
import AppStatusPanel from "@/components/SystemSettings/app-status/app-status-panel";

export default function AppStatusPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return (
    <SettingsPageShell>
      <SettingsListHeader
        title="حالة التطبيق والإصدارات"
        subtitle="تشغيل/إيقاف الموقع والتطبيق وإدارة إصدارات الجوال"
      />

      <PermissionGate
        section={PERMISSION_SECTIONS.settings}
        action="view"
        fallback={
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-13 font-bold text-[#98A39E] dark:border-white/10 dark:bg-card dark:text-white/45">
            لا تملك صلاحية عرض هذه الإعدادات.
          </div>
        }
      >
        <AppStatusPanel />
      </PermissionGate>
    </SettingsPageShell>
  );
}
