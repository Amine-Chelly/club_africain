import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const ui =
    locale === "fr"
      ? {
          manageTeams: "G\u00E9rer les \u00E9quipes",
          manageShop: "G\u00E9rer la boutique",
          manageNewsletters: "G\u00E9rer la newsletter",
          manageMatchdays: "G\u00E9rer les journ\u00E9es",
          recentOrders: "Commandes r\u00E9centes",
        }
      : locale === "ar"
        ? {
            manageTeams: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u0642",
            manageShop: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062A\u062C\u0631",
            manageNewsletters: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0646\u0634\u0631\u0629",
            manageMatchdays: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062C\u0648\u0644\u0627\u062A",
            recentOrders: "\u0622\u062E\u0631 \u0627\u0644\u0637\u0644\u0628\u0627\u062A",
          }
        : {
            manageTeams: "Manage teams",
            manageShop: "Manage store",
            manageNewsletters: "Manage newsletter",
            manageMatchdays: "Manage matchdays",
            recentOrders: "Recent orders",
          };

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
          <Link href="/admin/teams" className="text-primary mt-2 inline-block text-sm underline">
            {ui.manageTeams}
          </Link>
        </div>
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("products")}</p>
          <p className="text-foreground text-2xl font-bold">{products}</p>
          <Link href="/admin/products" className="text-primary mt-2 inline-block text-sm underline">
            {ui.manageShop}
          </Link>
        </div>
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("orders")}</p>
          <p className="text-foreground text-2xl font-bold">{orderCount}</p>
        </div>

        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("newsletters")}</p>
          <p className="text-foreground text-2xl font-bold">{newsletterCount}</p>
          <Link href="/admin/newsletters" className="text-primary mt-2 inline-block text-sm underline">
            {ui.manageNewsletters}
          </Link>
        </div>

        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{t("matchdays")}</p>
          <p className="text-foreground text-2xl font-bold">{matchdayCount}</p>
          <Link href="/admin/matchdays" className="text-primary mt-2 inline-block text-sm underline">
            {ui.manageMatchdays}
          </Link>
        </div>

        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">Club</p>
          <p className="text-foreground text-2xl font-bold">⚙</p>
          <Link href="/admin/club" className="text-primary mt-2 inline-block text-sm underline">
            {locale === "fr" ? "Gérer le club" : locale === "ar" ? "إدارة النادي" : "Manage club"}
          </Link>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-foreground text-lg font-semibold">{ui.recentOrders}</h2>
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
