"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const t = useTranslations("nav");
  const { toggleDarkMode, resolvedTheme } = useTheme();
  const label = t("toggleTheme");

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className="text-muted hover:text-primary rounded-md p-2 text-sm font-medium transition-colors focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-2 flex items-center justify-center cursor-pointer"
    >
      {resolvedTheme === "light" ? (
        <svg suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2"/>
          <path d="M12 20v2"/>
          <path d="m4.93 4.93 1.41 1.41"/>
          <path d="m17.66 17.66 1.41 1.41"/>
          <path d="M2 12h2"/>
          <path d="M20 12h2"/>
          <path d="m6.34 17.66-1.41 1.41"/>
          <path d="m19.07 4.93-1.41 1.41"/>
        </svg>
      ) : (
        <svg suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
