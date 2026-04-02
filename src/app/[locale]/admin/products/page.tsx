import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteProductAction } from "@/lib/admin/actions";
import { localizeMerchType, localizeSport, sizesWord } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const sizesLabel = sizesWord(locale);
  const ui =
    locale === "fr"
      ? {
          search: "Rechercher...",
          submit: "Chercher",
          reset: "R\u00E9initialiser",
          newProduct: "Nouveau produit",
          product: "Produit",
          price: "Prix",
          stock: "Stock",
          status: "Statut",
          actions: "Actions",
          active: "Actif",
          inactive: "Inactif",
          edit: "Modifier",
          delete: "Supprimer",
          empty: "Aucun produit - utilisez le bouton \"Nouveau produit\".",
        }
      : locale === "ar"
        ? {
            search: "\u0628\u062D\u062B...",
            submit: "\u0628\u062D\u062B",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            newProduct: "\u0645\u0646\u062A\u062C \u062C\u062F\u064A\u062F",
            product: "\u0627\u0644\u0645\u0646\u062A\u062C",
            price: "\u0627\u0644\u0633\u0639\u0631",
            stock: "\u0627\u0644\u0645\u062E\u0632\u0648\u0646",
            status: "\u0627\u0644\u062D\u0627\u0644\u0629",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            active: "\u0646\u0634\u0637",
            inactive: "\u063A\u064A\u0631 \u0646\u0634\u0637",
            edit: "\u062A\u0639\u062F\u064A\u0644",
            delete: "\u062D\u0630\u0641",
            empty: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A - \u0627\u0633\u062A\u062E\u062F\u0645 \u0632\u0631 \u0645\u0646\u062A\u062C \u062C\u062F\u064A\u062F.",
          }
        : {
            search: "Search...",
            submit: "Search",
            reset: "Reset",
            newProduct: "New product",
            product: "Product",
            price: "Price",
            stock: "Stock",
            status: "Status",
            actions: "Actions",
            active: "Active",
            inactive: "Inactive",
            edit: "Edit",
            delete: "Delete",
            empty: "No product - use the \"New product\" button.",
          };

  const sp: { q?: string } = await (searchParams ?? Promise.resolve({} as { q?: string }));
  const q = (sp.q ?? "").trim();

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">{t("products")}</h1>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder={ui.search}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {ui.submit}
            </button>
            {q ? (
              <Link href="/admin/products" className="text-muted text-sm underline">
                {ui.reset}
              </Link>
            ) : null}
          </form>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {ui.newProduct}
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.product}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.price}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.stock}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.status}
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium">{p.name}</span>
                    <span className="text-muted text-xs mt-1 font-mono">{p.slug}</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
                        {localizeMerchType(p.merchType, locale)}
                      </span>
                      {p.sport ? (
                        <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
                          {localizeSport(p.sport, locale)}
                        </span>
                      ) : null}
                      {p.sizeOptions?.length ? (
                        <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
                          {p.sizeOptions.length} {sizesLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-foreground font-medium">{formatTnd(p.priceCents)} TND</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{p.stock}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className={p.active ? "text-primary font-semibold" : "text-muted"}>{p.active ? ui.active : ui.inactive}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-primary text-sm underline">
                      {ui.edit}
                    </Link>
                    <form action={deleteProductAction} className="inline">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-primary text-sm underline hover:opacity-90">
                        {ui.delete}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={5}>
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
