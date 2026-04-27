import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteProductAction } from "@/lib/admin/actions";
import { MerchType, Sport } from "@/generated/prisma/enums";
import { localizeMerchType, localizeSport, sizesWord } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
    sport?: string;
    merchType?: string;
    active?: string;
  }>;
};

const sportValues = Object.values(Sport) as Sport[];
const merchTypeValues = Object.values(MerchType) as MerchType[];

export default async function AdminProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const sizesLabel = sizesWord(locale);
  const sp = await (searchParams ?? Promise.resolve({} as { q?: string; sport?: string; merchType?: string; active?: string }));
  const q = (sp.q ?? "").trim();
  const selectedSport = sportValues.includes(sp.sport as Sport) ? (sp.sport as Sport) : "";
  const selectedMerchType = merchTypeValues.includes(sp.merchType as MerchType) ? (sp.merchType as MerchType) : "";
  const selectedActive = sp.active === "true" ? "true" : sp.active === "false" ? "false" : "";

  const products = await prisma.product.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(selectedSport ? { sport: selectedSport } : {}),
      ...(selectedMerchType ? { merchType: selectedMerchType } : {}),
      ...(selectedActive ? { active: selectedActive === "true" } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const ui =
    locale === "fr"
      ? {
          search: "Rechercher (nom, slug, description)...",
          submit: "Chercher",
          reset: "R\u00E9initialiser",
          newProduct: "Nouveau produit",
          product: "Produit",
          price: "Prix",
          stock: "Stock",
          status: "Statut",
          sportAll: "Tous les sports",
          merchAll: "Tous les types",
          activeAll: "Tous",
          activeOnly: "Actifs",
          inactiveOnly: "Inactifs",
          actions: "Actions",
          active: "Actif",
          inactive: "Inactif",
          edit: "Modifier",
          delete: "Supprimer",
          empty: "Aucun produit - utilisez le bouton \"Nouveau produit\".",
        }
      : locale === "ar"
        ? {
            search: "\u0628\u062D\u062B (\u0627\u0644\u0627\u0633\u0645، \u0627\u0644\u0645\u0639\u0631\u0641، \u0627\u0644\u0648\u0635\u0641)...",
            submit: "\u0628\u062D\u062B",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            newProduct: "\u0645\u0646\u062A\u062C \u062C\u062F\u064A\u062F",
            product: "\u0627\u0644\u0645\u0646\u062A\u062C",
            price: "\u0627\u0644\u0633\u0639\u0631",
            stock: "\u0627\u0644\u0645\u062E\u0632\u0648\u0646",
            status: "\u0627\u0644\u062D\u0627\u0644\u0629",
            sportAll: "\u0643\u0644 \u0627\u0644\u0631\u064A\u0627\u0636\u0627\u062A",
            merchAll: "\u0643\u0644 \u0627\u0644\u0623\u0646\u0648\u0627\u0639",
            activeAll: "\u0627\u0644\u0643\u0644",
            activeOnly: "\u0646\u0634\u0637\u0629",
            inactiveOnly: "\u063A\u064A\u0631 \u0646\u0634\u0637\u0629",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            active: "\u0646\u0634\u0637",
            inactive: "\u063A\u064A\u0631 \u0646\u0634\u0637",
            edit: "\u062A\u0639\u062F\u064A\u0644",
            delete: "\u062D\u0630\u0641",
            empty: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A - \u0627\u0633\u062A\u062E\u062F\u0645 \u0632\u0631 \u0645\u0646\u062A\u062C \u062C\u062F\u064A\u062F.",
          }
        : {
            search: "Search (name, slug, description)...",
            submit: "Search",
            reset: "Reset",
            newProduct: "New product",
            product: "Product",
            price: "Price",
            stock: "Stock",
            status: "Status",
            sportAll: "All sports",
            merchAll: "All merch types",
            activeAll: "All",
            activeOnly: "Active",
            inactiveOnly: "Inactive",
            actions: "Actions",
            active: "Active",
            inactive: "Inactive",
            edit: "Edit",
            delete: "Delete",
            empty: "No product - use the \"New product\" button.",
          };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">{t("products")}</h1>
          <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_160px_160px_160px_auto]">
            <input name="q" defaultValue={q} placeholder={ui.search} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2" />
            <select name="sport" defaultValue={selectedSport} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.sportAll}</option>
              {sportValues.map((sport) => (
                <option key={sport} value={sport}>{localizeSport(sport, locale)}</option>
              ))}
            </select>
            <select name="merchType" defaultValue={selectedMerchType} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.merchAll}</option>
              {merchTypeValues.map((type) => (
                <option key={type} value={type}>{localizeMerchType(type, locale)}</option>
              ))}
            </select>
            <select name="active" defaultValue={selectedActive} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.activeAll}</option>
              <option value="true">{ui.activeOnly}</option>
              <option value="false">{ui.inactiveOnly}</option>
            </select>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background">{ui.submit}</button>
              {q || selectedSport || selectedMerchType || selectedActive ? (
                <Link href="/admin/products" className="text-muted text-sm underline">{ui.reset}</Link>
              ) : null}
            </div>
          </form>
        </div>

        <Link href="/admin/products/new" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          {ui.newProduct}
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.product}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.price}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.stock}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.status}</th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.actions}</th>
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
                      <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">{localizeMerchType(p.merchType, locale)}</span>
                      {p.sport ? <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">{localizeSport(p.sport, locale)}</span> : null}
                      {p.sizeOptions?.length ? <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">{p.sizeOptions.length} {sizesLabel}</span> : null}
                    </div>
                  </div>
                </td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-foreground font-medium">{formatTnd(p.priceCents)} TND</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{p.stock}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className={p.active ? "text-primary font-semibold" : "text-muted"}>{p.active ? ui.active : ui.inactive}</span></td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-primary text-sm underline">{ui.edit}</Link>
                    <form action={deleteProductAction} className="inline">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-primary text-sm underline hover:opacity-90">{ui.delete}</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={5}>{ui.empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
