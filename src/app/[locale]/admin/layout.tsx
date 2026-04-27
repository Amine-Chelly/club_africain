import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/admin`);
  }

  const t = await getTranslations("admin");

  const nav = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/teams", label: t("teams") },
    { href: "/admin/products", label: t("products") },
    { href: "/admin/orders", label: t("orders") },
    { href: "/admin/newsletters", label: t("newsletters") },
    { href: "/admin/matchdays", label: t("matchdays") },
    { href: "/admin/subscriptions", label: t("subscriptions") },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border-border border bg-card p-4">
          <p className="text-muted text-sm font-medium">{t("title")}</p>
          <nav className="mt-4 space-y-1" aria-label={t("title")}>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary block rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
