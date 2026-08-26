"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import SystemSettingsWrapper from "@/components/SystemSettings/SystemSettingsWrapper";

export default function SettingsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <SystemSettingsWrapper />;
}
