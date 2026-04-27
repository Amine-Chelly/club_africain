"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
    setPending(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(t("forgotError"));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 py-16">
      <h1 className="text-foreground text-3xl font-bold">{t("forgotTitle")}</h1>

      {done ? (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-600 text-sm">
          {t("forgotSent")}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <p className="text-muted text-sm">{t("forgotIntro")}</p>
          {error && (
            <p className="text-destructive text-sm font-medium" role="alert">
              {error}
            </p>
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span>{t("email")}</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "…" : t("forgotSubmit")}
          </button>
          <p className="text-muted text-sm">
            <Link href="/auth/signin" className="text-primary font-medium underline">
              {t("backToSignIn")}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
