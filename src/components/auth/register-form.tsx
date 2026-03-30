"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

export function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(typeof data.error === "string" ? data.error : "Registration failed");
      return;
    }
    router.push(`/${locale}/auth/signin`);
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
        <span>{t("name")}</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2"
        />
      </label>
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
      <label className="flex flex-col gap-1 text-sm">
        <span>{t("password")}</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-border bg-background focus-visible:ring-ring rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {t("submit")}
      </button>
      <p className="text-muted text-sm">
        {t("hasAccount")}{" "}
        <Link href="/auth/signin" className="text-primary font-medium underline">
          {t("signInTitle")}
        </Link>
      </p>
    </form>
  );
}
