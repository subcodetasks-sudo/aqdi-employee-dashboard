"use client";

import { useReferenceListQuery } from "@/src/hooks/use-reference-list";

/** Standard list fetch for settings CRUD pages backed by `/admin/*` list endpoints. */
export function useSettingsList({ queryKey, endpoint, params, enabled = true }) {
  return useReferenceListQuery({ queryKey, endpoint, params, enabled });
}
