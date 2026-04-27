import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { OrderDeliveryType, OrderPaymentType, OrderStatus } from "@/generated/prisma/enums";
import { formatDateTime } from "@/lib/date-format";
import {
  localizeOrderDeliveryType,
  localizeOrderPaymentType,
  localizeOrderStatus,
} from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
    status?: string;
    paymentType?: string;
    deliveryType?: string;
    sort?: string;
  }>;
};

const orderStatusValues = Object.values(OrderStatus) as OrderStatus[];
const paymentTypeValues = Object.values(OrderPaymentType) as OrderPaymentType[];
const deliveryTypeValues = Object.values(OrderDeliveryType) as OrderDeliveryType[];
const sortValues = ["date_desc", "date_asc", "status"] as const;

export default async function AdminOrdersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const sp = await (searchParams ?? Promise.resolve({} as { q?: string; status?: string; paymentType?: string; deliveryType?: string; sort?: string }));
  const q = (sp.q ?? "").trim();
  const selectedStatus = orderStatusValues.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : "";
  const selectedPaymentType = paymentTypeValues.includes(sp.paymentType as OrderPaymentType)
    ? (sp.paymentType as OrderPaymentType)
    : "";
  const selectedDeliveryType = deliveryTypeValues.includes(sp.deliveryType as OrderDeliveryType)
    ? (sp.deliveryType as OrderDeliveryType)
    : "";
  const selectedSort = sortValues.includes(sp.sort as (typeof sortValues)[number]) ? (sp.sort as (typeof sortValues)[number]) : "date_desc";

  const orderBy =
    selectedSort === "date_asc"
      ? { createdAt: "asc" as const }
      : selectedSort === "status"
        ? [{ status: "asc" as const }, { createdAt: "desc" as const }]
        : { createdAt: "desc" as const };

  const orders = await prisma.order.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { stripePaymentIntentId: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(selectedStatus ? { status: selectedStatus } : {}),
      ...(selectedPaymentType ? { paymentType: selectedPaymentType } : {}),
      ...(selectedDeliveryType ? { deliveryType: selectedDeliveryType } : {}),
    },
    orderBy,
    take: 100,
    include: { user: true },
  });

  const ui =
    locale === "fr"
      ? {
          search: "Rechercher (commande, email, paiement, livraison)...",
          submit: "Chercher",
          reset: "R\u00E9initialiser",
          statusAll: "Tous les statuts",
          paymentAll: "Tous les paiements",
          deliveryAll: "Toutes les livraisons",
          sortDateDesc: "Date la plus r\u00E9cente",
          sortDateAsc: "Date la plus ancienne",
          sortStatus: "Statut",
          order: "Commande",
          client: "Client",
          total: "Total",
          status: "Statut",
          payment: "Paiement",
          delivery: "Livraison",
          validatedAt: "Valid\u00E9e le",
          actions: "Actions",
          details: "D\u00E9tails",
          empty: "Aucune commande.",
        }
      : locale === "ar"
        ? {
            search: "\u0628\u062D\u062B (\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628، \u0627\u0644\u0628\u0631\u064A\u062F، \u0627\u0644\u062F\u0641\u0639، \u0627\u0644\u062A\u0648\u0635\u064A\u0644)...",
            submit: "\u0628\u062D\u062B",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            statusAll: "\u0643\u0644 \u0627\u0644\u062D\u0627\u0644\u0627\u062A",
            paymentAll: "\u0643\u0644 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u062F\u0641\u0639",
            deliveryAll: "\u0643\u0644 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u062A\u0648\u0635\u064A\u0644",
            sortDateDesc: "\u0627\u0644\u0623\u062D\u062F\u062B \u0623\u0648\u0644\u0627\u064B",
            sortDateAsc: "\u0627\u0644\u0623\u0642\u062F\u0645 \u0623\u0648\u0644\u0627\u064B",
            sortStatus: "\u0627\u0644\u062D\u0627\u0644\u0629",
            order: "\u0627\u0644\u0637\u0644\u0628",
            client: "\u0627\u0644\u0639\u0645\u064A\u0644",
            total: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639",
            status: "\u0627\u0644\u062D\u0627\u0644\u0629",
            payment: "\u0627\u0644\u062F\u0641\u0639",
            delivery: "\u0627\u0644\u062A\u0648\u0635\u064A\u0644",
            validatedAt: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F\u0647 \u0641\u064A",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            details: "\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644",
            empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A.",
          }
        : {
            search: "Search (order id, email, payment, delivery)...",
            submit: "Search",
            reset: "Reset",
            statusAll: "All statuses",
            paymentAll: "All payments",
            deliveryAll: "All deliveries",
            sortDateDesc: "Newest first",
            sortDateAsc: "Oldest first",
            sortStatus: "Status",
            order: "Order",
            client: "Client",
            total: "Total",
            status: "Status",
            payment: "Payment",
            delivery: "Delivery",
            validatedAt: "Validated at",
            actions: "Actions",
            details: "Details",
            empty: "No orders.",
          };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">{t("orders")}</h1>
          <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_160px_160px_160px_160px_auto]">
            <input name="q" defaultValue={q} placeholder={ui.search} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2" />
            <select name="status" defaultValue={selectedStatus} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.statusAll}</option>
              {orderStatusValues.map((status) => (
                <option key={status} value={status}>
                  {localizeOrderStatus(status, locale)}
                </option>
              ))}
            </select>
            <select name="paymentType" defaultValue={selectedPaymentType} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.paymentAll}</option>
              {paymentTypeValues.map((type) => (
                <option key={type} value={type}>
                  {localizeOrderPaymentType(type, locale)}
                </option>
              ))}
            </select>
            <select name="deliveryType" defaultValue={selectedDeliveryType} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.deliveryAll}</option>
              {deliveryTypeValues.map((type) => (
                <option key={type} value={type}>
                  {localizeOrderDeliveryType(type, locale)}
                </option>
              ))}
            </select>
            <select name="sort" defaultValue={selectedSort} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="date_desc">{ui.sortDateDesc}</option>
              <option value="date_asc">{ui.sortDateAsc}</option>
              <option value="status">{ui.sortStatus}</option>
            </select>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {ui.submit}
              </button>
              {q || selectedStatus || selectedPaymentType || selectedDeliveryType || selectedSort !== "date_desc" ? (
                <Link href="/admin/orders" className="text-muted text-sm underline">
                  {ui.reset}
                </Link>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.order}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.client}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.total}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.status}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.payment}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.delivery}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.validatedAt}</th>
              <th className="border-border px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">{ui.actions}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="border-border border-t px-3 py-3 align-top font-mono text-xs text-muted">{o.id}</td>
                <td className="border-border border-t px-3 py-3 align-top text-muted">{o.user?.email}</td>
                <td className="border-border border-t px-3 py-3 align-top text-foreground font-medium">{(o.totalCents / 100).toFixed(2)} TND</td>
                <td className="border-border border-t px-3 py-3 align-top text-muted">{localizeOrderStatus(o.status, locale)}</td>
                <td className="border-border border-t px-3 py-3 align-top text-muted">{localizeOrderPaymentType(o.paymentType, locale)}</td>
                <td className="border-border border-t px-3 py-3 align-top text-muted">{localizeOrderDeliveryType(o.deliveryType, locale)}</td>
                <td className="border-border border-t px-3 py-3 align-top text-muted">{formatDateTime(o.validatedAt, locale)}</td>
                <td className="border-border border-t px-3 py-3 align-top text-right">
                  <Link href={`/admin/orders/${o.id}`} className="text-primary text-sm underline">
                    {ui.details}
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={8}>
                  {ui.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
