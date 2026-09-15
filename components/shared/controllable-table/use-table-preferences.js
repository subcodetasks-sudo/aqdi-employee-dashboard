"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsClient } from "@/src/hooks/use-is-client";
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

  const isClient = useIsClient();
  // `key` is the storageKey the prefs were loaded from (null until hydrated).
  const [state, setState] = useState({ key: null, prefs: defaults });

  // localStorage is client-only: load after hydration, and again if the key changes.
  if (isClient && state.key !== storageKey) {
    setState({ key: storageKey, prefs: readStored(storageKey, defaults) });
  }

  const { prefs } = state;
  const hydrated = isClient && state.key === storageKey;

  useEffect(() => {
    if (!storageKey || !hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(prefs));
    } catch {
      /* ignore quota */
    }
  }, [prefs, storageKey, hydrated]);

  const setDensity = useCallback((density) => {
    setState((current) => ({
      ...current,
      prefs: { ...current.prefs, density },
    }));
  }, [setState]);

  const setColumnVisible = useCallback((columnId, visible) => {
    setState((current) => ({
      ...current,
      prefs: {
        ...current.prefs,
        visibleColumns: {
          ...current.prefs.visibleColumns,
          [columnId]: visible,
        },
      },
    }));
  }, [setState]);

  const toggleColumn = useCallback((columnId) => {
    setState((current) => ({
      ...current,
      prefs: {
        ...current.prefs,
        visibleColumns: {
          ...current.prefs.visibleColumns,
          [columnId]: !(current.prefs.visibleColumns?.[columnId] ?? true),
        },
      },
    }));
  }, [setState]);

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
