import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteProductAction } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminProductsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">{t("products")}</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Nouveau produit
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Produit
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Prix
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Stock
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
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium">{p.name}</span>
                    <span className="text-muted text-xs mt-1 font-mono">{p.slug}</span>
                  </div>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-foreground font-medium">{formatTnd(p.priceCents)} TND</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{p.stock}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className={p.active ? "text-primary font-semibold" : "text-muted"}>
                    {p.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-primary text-sm underline"
                    >
                      Modifier
                    </Link>
                    <form action={deleteProductAction} className="inline">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="text-primary text-sm underline hover:opacity-90"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  className="border-border border-t px-3 py-6 text-muted"
                  colSpan={5}
                >
                  Aucun produit — utilisez le bouton “Nouveau produit”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

