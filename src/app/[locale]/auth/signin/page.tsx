import { SignInForm } from "@/components/auth/sign-in-form";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function SignInPage() {
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 py-16">
      <h1 className="text-foreground text-3xl font-bold">{t("signInTitle")}</h1>
      <Suspense fallback={<p className="text-muted text-sm">…</p>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
