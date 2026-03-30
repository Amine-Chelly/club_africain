"use client";

import { useEffect } from "react";

/** Sets `<html lang>` and `dir` for accessibility & SEO (locale lives in the URL). */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
