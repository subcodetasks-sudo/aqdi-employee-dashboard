"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_TABLE_DENSITY } from "./density";

function readStored(storageKey, fallback) {
  if (typeof window === "undefined" || !storageKey) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

/**
 * Persists column visibility + density for a controllable table.
 * @param {object} options
 * @param {string} options.storageKey
 * @param {{ id: string, hideable?: boolean }[]} options.columns
 * @param {string} [options.defaultDensity]
 */
export function useTablePreferences({
  storageKey,
  columns = [],
  defaultDensity = DEFAULT_TABLE_DENSITY,
}) {
  const hideableIds = columns.filter((c) => c.hideable !== false).map((c) => c.id);
  const defaultVisible = Object.fromEntries(hideableIds.map((id) => [id, true]));

  const defaults = {
    density: defaultDensity,
    visibleColumns: defaultVisible,
  };

  const [prefs, setPrefs] = useState(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(readStored(storageKey, defaults));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from storageKey
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(prefs));
    } catch {
      /* ignore quota */
    }
  }, [prefs, storageKey, hydrated]);

  const setDensity = useCallback((density) => {
    setPrefs((prev) => ({ ...prev, density }));
  }, []);

  const setColumnVisible = useCallback((columnId, visible) => {
    setPrefs((prev) => ({
      ...prev,
      visibleColumns: {
        ...prev.visibleColumns,
        [columnId]: visible,
      },
    }));
  }, []);

  const toggleColumn = useCallback((columnId) => {
    setPrefs((prev) => ({
      ...prev,
      visibleColumns: {
        ...prev.visibleColumns,
        [columnId]: !(prev.visibleColumns?.[columnId] ?? true),
      },
    }));
  }, []);

  const isColumnVisible = useCallback(
    (column) => {
      if (column.hideable === false) return true;
      return prefs.visibleColumns?.[column.id] !== false;
    },
    [prefs.visibleColumns]
  );

  return {
    density: prefs.density || defaultDensity,
    setDensity,
    visibleColumns: prefs.visibleColumns || defaultVisible,
    setColumnVisible,
    toggleColumn,
    isColumnVisible,
  };
}
