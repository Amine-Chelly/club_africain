"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const localeOptions = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
] as const;

export function LocaleSwitcher() {
  const pathname = usePathname();
  const activeLocale = useLocale();

  return (
    <div className="border-border bg-card/80 flex items-center overflow-hidden rounded-md border">
      {localeOptions.map((locale) => {
        const isActive = activeLocale === locale.code;

        return (
          <Link
            key={locale.code}
            href={pathname}
            locale={locale.code}
            className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-primary hover:bg-secondary"
            }`}
            aria-label={`Switch language to ${locale.label}`}
          >
            {locale.label}
          </Link>
        );
      })}
    </div>
  );
}
