"use client";

import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

export function SignInForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? `/${locale}/shop`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid credentials");
      return;
    }
    await fetch("/api/cart/merge", { method: "POST", credentials: "include" });
    router.push(callbackUrl.startsWith("/") ? callbackUrl : `/${locale}/shop`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-md flex-col gap-4">
      {error && (
        <p className="text-primary text-sm font-medium" role="alert">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span>{t("email")}</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2"
        />
      </label>
      <div className="flex items-center justify-between">
        <label className="flex flex-col gap-1 text-sm flex-1">
          <span>{t("password")}</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2"
          />
        </label>
      </div>
      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-primary text-xs font-medium underline">
          {t("forgotPassword")}
        </Link>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {t("submit")}
      </button>
      <p className="text-muted text-sm">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="text-primary font-medium underline">
          {t("registerTitle")}
        </Link>
      </p>
    </form>
  );
}
