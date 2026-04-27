import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { updateOrderStatusAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";
import { OrderStatus } from "@/generated/prisma/enums";
import { formatDateTime } from "@/lib/date-format";
import {
  localizeOrderDeliveryType,
  localizeOrderPaymentType,
  localizeOrderStatus,
} from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; orderId: string }>;
};

const orderStatusOptions = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.SHIPPED] as const;

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

  const ui =
    locale === "fr"
      ? {
          client: "Client",
          status: "Statut actuel",
          payment: "Type de paiement",
          delivery: "Type de livraison",
          createdAt: "Date de cr\u00E9ation",
          validatedAt: "Date de validation",
          updateStatus: "Mettre \u00E0 jour le statut",
          newStatus: "Nouveau statut",
          save: "Enregistrer",
          items: "Articles",
          noItems: "Aucun article.",
          ordered: "Command\u00E9e",
          paid: "Pay\u00E9e",
          delivered: "Livr\u00E9e",
        }
      : locale === "ar"
        ? {
            client: "\u0627\u0644\u0639\u0645\u064A\u0644",
            status: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629",
            payment: "\u0646\u0648\u0639 \u0627\u0644\u062F\u0641\u0639",
            delivery: "\u0646\u0648\u0639 \u0627\u0644\u062A\u0648\u0635\u064A\u0644",
            createdAt: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621",
            validatedAt: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u0623\u0643\u064A\u062F",
            updateStatus: "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062D\u0627\u0644\u0629",
            newStatus: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629",
            save: "\u062D\u0641\u0638",
            items: "\u0627\u0644\u0639\u0646\u0627\u0635\u0631",
            noItems: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0639\u0646\u0627\u0635\u0631.",
            ordered: "\u0645\u0637\u0644\u0648\u0628\u0629",
            paid: "\u0645\u062F\u0641\u0648\u0639\u0629",
            delivered: "\u0645\u0633\u0644\u0645\u0629",
          }
        : {
            client: "Client",
            status: "Current status",
            payment: "Payment type",
            delivery: "Delivery type",
            createdAt: "Created at",
            validatedAt: "Validated at",
            updateStatus: "Update status",
            newStatus: "New status",
            save: "Save",
            items: "Items",
            noItems: "No items.",
            ordered: "Ordered",
            paid: "Payed",
            delivered: "Delivered",
          };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">{t("orders")} — Detail</h1>
        <span className="text-muted text-sm font-mono">{order.id}</span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{ui.client}</p>
          <p className="text-foreground font-semibold mt-1">{order.user?.email}</p>
          <p className="text-muted text-sm mt-4">{ui.status}</p>
          <p className="text-primary font-semibold mt-1">{localizeOrderStatus(order.status, locale)}</p>
          <p className="text-muted text-sm mt-4">{ui.payment}</p>
          <p className="text-muted mt-1 text-sm">{localizeOrderPaymentType(order.paymentType, locale)}</p>
          <p className="text-muted text-sm mt-4">{ui.delivery}</p>
          <p className="text-muted mt-1 text-sm">{localizeOrderDeliveryType(order.deliveryType, locale)}</p>
          <p className="text-muted text-sm mt-4">{ui.createdAt}</p>
          <p className="text-muted mt-1 text-sm">{formatDateTime(order.createdAt, locale)}</p>
          <p className="text-muted text-sm mt-4">{ui.validatedAt}</p>
          <p className="text-muted mt-1 text-sm">{formatDateTime(order.validatedAt, locale)}</p>
        </div>

        <div className="border-border bg-card rounded-xl border p-4">
          <p className="text-muted text-sm">{ui.updateStatus}</p>
          <form action={updateOrderStatusAction} className="mt-4 space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="orderId" value={order.id} />

            <label className="flex flex-col gap-1 text-sm">
              <span>{ui.newStatus}</span>
              <select
                name="status"
                required
                defaultValue={order.status}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              >
                {orderStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {localizeOrderStatus(status, locale)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {ui.save}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 border-border rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-border border-b bg-card">
          <p className="text-muted text-sm">{ui.items}</p>
        </div>
        <div className="divide-y">
          {order.items.map((i) => (
            <div key={i.id} className="flex flex-wrap items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-foreground font-medium">{i.product?.name}</p>
                <p className="text-muted text-xs mt-1 font-mono">{i.product?.slug}</p>
              </div>
              <div className="text-right">
                <p className="text-muted text-sm">Qté: {i.quantity}</p>
                <p className="text-primary font-semibold mt-1">{(i.priceCents / 100).toFixed(2)} TND</p>
              </div>
            </div>
          ))}
          {order.items.length === 0 && <div className="px-4 py-6 text-muted text-sm">{ui.noItems}</div>}
        </div>
      </div>
    </div>
  );
}
