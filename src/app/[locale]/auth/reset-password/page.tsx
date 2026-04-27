"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Link } from "@/i18n/navigation";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <p className="text-destructive text-sm">{t("resetInvalidToken")}</p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t("resetPasswordMismatch"));
      return;
    }

    setPending(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setPending(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => {
        router.push(`/${locale}/auth/signin`);
      }, 2500);
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? t("resetError"));
    }
  }

  return (
    <>
      {done ? (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-600 text-sm">
          {t("resetSuccess")}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <p className="text-muted text-sm">{t("resetIntro")}</p>
          {error && (
            <p className="text-destructive text-sm font-medium" role="alert">
              {error}
            </p>
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span>{t("newPassword")}</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{t("confirmPassword")}</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "…" : t("resetSubmit")}
          </button>
          <p className="text-muted text-sm">
            <Link href="/auth/signin" className="text-primary font-medium underline">
              {t("backToSignIn")}
            </Link>
          </p>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 py-16">
      <h1 className="text-foreground text-3xl font-bold">{t("resetTitle")}</h1>
      <Suspense fallback={<p className="text-muted text-sm">…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
