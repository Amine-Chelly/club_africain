"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemePref = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  pref: ThemePref;
  resolvedTheme: ResolvedTheme;
  setPref: (pref: ThemePref) => void;
  toggleDarkMode: () => void;
};

const KEY = "clubafricain-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemDark() {
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeToDocument(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
  // Helps browser/OS render form controls consistently.
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(() => {
    if (typeof window === "undefined") return "system";
    try {
      const stored = window.localStorage.getItem(KEY);
      if (stored === "light" || stored === "dark" || stored === "system") return stored;
    } catch {
      // ignore
    }
    return "system";
  });
  const [systemDark, setSystemDark] = useState<boolean>(() => getSystemDark());

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;

    const onChange = () => {
      setSystemDark(mq.matches);
    };
    onChange();

    // Modern API
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (pref === "dark") return "dark";
    if (pref === "light") return "light";
    return systemDark ? "dark" : "light";
  }, [pref, systemDark]);

  useEffect(() => {
    applyThemeToDocument(resolvedTheme === "dark");
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      pref,
      resolvedTheme,
      setPref: (next) => {
        setPrefState(next);
        try {
          window.localStorage.setItem(KEY, next);
        } catch {
          // Ignore write errors.
        }
      },
      toggleDarkMode: () => {
        const next: ThemePref = resolvedTheme === "dark" ? "light" : "dark";
        setPrefState(next);
        try {
          window.localStorage.setItem(KEY, next);
        } catch {
          // Ignore write errors.
        }
      },
    };
  }, [pref, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

