type LocaleCode = "fr" | "en" | "ar";

function normalizedLocale(locale: string): LocaleCode {
  if (locale === "fr" || locale === "ar") return locale;
  return "en";
}

export function formatDateTime(value: Date | string | null | undefined, locale: string) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(normalizedLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}
