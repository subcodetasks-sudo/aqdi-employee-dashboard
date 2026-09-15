"use client";

import { useTheme } from "next-themes";
import { useIsClient } from "@/src/hooks/use-is-client";

/** True when resolved theme is dark (safe after mount). */
export function useIsDark() {
  const { resolvedTheme, theme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) return false;
  return (resolvedTheme ?? theme) === "dark";
}

export function useToggleTheme() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return { isDark, toggleTheme, setTheme, theme, resolvedTheme };
}
