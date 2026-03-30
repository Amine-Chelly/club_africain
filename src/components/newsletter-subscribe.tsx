"use client";

import { useLocale, useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

export function NewsletterSubscribe() {
  const t = useTranslations("home");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const isValid = useMemo(() => {
    const v = email.trim();
    return v.length >= 5 && v.includes("@") && v.includes(".");
  }, [email]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });

    if (res.ok) setStatus("success");
    else setStatus("error");
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-xl border-border border bg-card p-6 sm:p-8">
        <h2 className="text-foreground text-2xl font-bold">{t("newsletterTitle")}</h2>
        <p className="text-muted mt-2 max-w-2xl">{t("newsletterSubtitle")}</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
          <label className="flex-1">
            <span className="sr-only">{t("newsletterEmailPlaceholder")}</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("newsletterEmailPlaceholder")}
              className="w-full border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={!isValid || status === "loading"}
            className="bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("newsletterCta")}
          </button>
        </form>

        {status === "success" && <p className="text-primary mt-4 text-sm">{t("newsletterSuccess")}</p>}
        {status === "error" && (
          <p className="text-primary mt-4 text-sm">
            {t("newsletterError")}
          </p>
        )}
      </div>
    </section>
  );
}

