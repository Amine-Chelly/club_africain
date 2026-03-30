import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");
  const [teams, products, orderCount, newsletterCount, matchdayCount, orders] = await Promise.all([
    prisma.team.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.newsletterSubscriber.count(),
    prisma.matchday.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: true } }),
  ]);

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">{t("title")}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("teams")}</p>
          <p className="text-foreground text-2xl font-bold">{teams}</p>
          <Link
            href="/admin/teams"
            className="text-primary mt-2 inline-block text-sm underline"
          >
            Gérer les équipes
          </Link>
        </div>
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("products")}</p>
          <p className="text-foreground text-2xl font-bold">{products}</p>
          <Link
            href="/admin/products"
            className="text-primary mt-2 inline-block text-sm underline"
          >
            Gérer la boutique
          </Link>
        </div>
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("orders")}</p>
          <p className="text-foreground text-2xl font-bold">{orderCount}</p>
        </div>

        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("newsletters")}</p>
          <p className="text-foreground text-2xl font-bold">{newsletterCount}</p>
          <Link
            href="/admin/newsletters"
            className="text-primary mt-2 inline-block text-sm underline"
          >
            Gérer la newsletter
          </Link>
        </div>

        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("matchdays")}</p>
          <p className="text-foreground text-2xl font-bold">{matchdayCount}</p>
          <Link
            href="/admin/matchdays"
            className="text-primary mt-2 inline-block text-sm underline"
          >
            Gérer les journées
          </Link>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-foreground text-lg font-semibold">{t("orders")}</h2>
        <ul className="border-border mt-4 divide-y rounded-lg border">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
              <span className="font-mono text-xs">{o.id}</span>
              <span className="text-muted">{o.user.email}</span>
              <span>{formatTnd(o.totalCents)} TND</span>
              <span className="text-muted">{o.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
