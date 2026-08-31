"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Lightweight multi-row selection state for tables.
 * Keys are row ids (whatever `getRowKey` yields in the table).
 */
export function useRowSelection() {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleMany = useCallback((ids = [], checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedIds((prev) => (prev.size ? new Set() : prev));
  }, []);

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectedIds,
    selectedArray,
    selectedCount: selectedIds.size,
    toggle,
    toggleMany,
    clear,
  };
}
