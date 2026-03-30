"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const t = useTranslations("nav");
  const { resolvedTheme, toggleDarkMode } = useTheme();

  const isDark = resolvedTheme === "dark";
  const label = isDark ? t("themeLight") : t("themeDark");

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={label}
      title={label}
      className="text-muted hover:text-primary rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2"
    >
      {label}
    </button>
  );
}

