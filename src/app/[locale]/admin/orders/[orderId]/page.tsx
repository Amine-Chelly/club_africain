import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { updateOrderStatusAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; orderId: string }>;
};

const orderStatusOptions = [
  { value: "PENDING", label: "PENDING" },
  { value: "PAID", label: "PAID" },
  { value: "SHIPPED", label: "SHIPPED" },
  { value: "CANCELLED", label: "CANCELLED" },
] as const;

export default async function AdminOrderDetailPage({ params }: Props) {
  const { locale, orderId } = await params;
  const t = await getTranslations("admin");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">
          {t("orders")} — Détail
        </h1>
        <span className="text-muted text-sm font-mono">{order.id}</span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">Client</p>
          <p className="text-foreground font-semibold mt-1">{order.user?.email}</p>
          <p className="text-muted text-sm mt-4">Statut actuel</p>
          <p className="text-primary font-semibold mt-1">{order.status}</p>
          <p className="text-muted text-sm mt-4">Date</p>
          <p className="text-muted mt-1 text-sm">
            {order.createdAt.toLocaleString()}
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">Mettre à jour le statut</p>
          <form
            action={updateOrderStatusAction}
            method="post"
            className="mt-4 space-y-3"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="orderId" value={order.id} />

            <label className="flex flex-col gap-1 text-sm">
              <span>Nouveau statut</span>
              <select
                name="status"
                required
                defaultValue={order.status}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              >
                {orderStatusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Enregistrer
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 border-border rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-border border-b bg-card">
          <p className="text-muted text-sm">Articles</p>
        </div>
        <div className="divide-y">
          {order.items.map((i) => (
            <div
              key={i.id}
              className="flex flex-wrap items-start justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="text-foreground font-medium">{i.product?.name}</p>
                <p className="text-muted text-xs mt-1 font-mono">{i.product?.slug}</p>
              </div>
              <div className="text-right">
                <p className="text-muted text-sm">Qté: {i.quantity}</p>
                <p className="text-primary font-semibold mt-1">
                  {(i.priceCents / 100).toFixed(2)} TND
                </p>
              </div>
            </div>
          ))}
          {order.items.length === 0 && (
            <div className="px-4 py-6 text-muted text-sm">Aucun article.</div>
          )}
        </div>
      </div>
    </div>
  );
}

