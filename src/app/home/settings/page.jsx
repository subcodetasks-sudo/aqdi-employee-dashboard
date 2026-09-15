"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import SystemSettingsWrapper from "@/components/system-settings/system-settings-wrapper";

export default function SettingsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <SystemSettingsWrapper />;
}
