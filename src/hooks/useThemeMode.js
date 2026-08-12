"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/** True when resolved theme is dark (safe after mount). */
export function useIsDark() {
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return false;
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
