import { RegisterForm } from "@/components/auth/register-form";
import { getTranslations } from "next-intl/server";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 py-16">
      <h1 className="text-foreground text-3xl font-bold">{t("registerTitle")}</h1>
      <RegisterForm />
    </div>
  );
}
