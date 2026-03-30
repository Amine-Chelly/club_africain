import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOrdersPage({ params }: Props) {
  await params;
  const t = await getTranslations("admin");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">{t("orders")}</h1>
        <p className="text-muted text-sm">Dernières commandes</p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Commande
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Client
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Total
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Statut
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="font-mono text-xs text-muted">{o.id}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{o.user?.email}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-foreground font-medium">
                    {(o.totalCents / 100).toFixed(2)} TND
                  </span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{o.status}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-primary text-sm underline"
                  >
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  className="border-border border-t px-3 py-6 text-muted"
                  colSpan={5}
                >
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

