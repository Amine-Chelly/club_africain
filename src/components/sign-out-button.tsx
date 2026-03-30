"use client";

import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

export function SignOutButton() {
  const locale = useLocale();
  const t = useTranslations("nav");
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `/${locale}` })}
      className="text-muted hover:text-primary rounded-md px-2 py-2 text-sm font-medium sm:px-3"
    >
      {t("signOut")}
    </button>
  );
}
