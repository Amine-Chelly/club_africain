import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { MerchType, Sport } from "@/generated/prisma/enums";
import { localizeMerchType, localizeSport, sizesWord } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    sport?: string;
    merchType?: string;
  }>;
};

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("shop");
  const sizesLabel = sizesWord(locale);
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const sportRaw = (sp.sport ?? "").trim();
  const merchTypeRaw = (sp.merchType ?? "").trim();

  const sports = Object.values(Sport) as Sport[];
  const merchTypes = Object.values(MerchType) as MerchType[];

  const sportFilter = sports.includes(sportRaw as Sport) ? (sportRaw as Sport) : null;
  const merchTypeFilter = merchTypes.includes(merchTypeRaw as MerchType)
    ? (merchTypeRaw as MerchType)
    : null;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(sportFilter ? { sport: sportFilter } : {}),
      ...(merchTypeFilter ? { merchType: merchTypeFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-foreground text-3xl font-bold">{t("title")}</h1>
      <form
        method="get"
        className="mt-6 grid gap-3 rounded-xl border-border border bg-card p-4 md:grid-cols-[1fr_220px_220px_auto]"
      >
        <label className="flex flex-col gap-1">
          <span className="text-muted text-sm font-medium">{t("searchLabel")}</span>
          <input
            name="q"
            defaultValue={q}
            placeholder={t("searchPlaceholder")}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-muted text-sm font-medium">{t("filterSportAll")}</span>
          <select
            name="sport"
            defaultValue={sportFilter ?? ""}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="">{t("filterSportAll")}</option>
            {sports.map((s) => (
              <option key={s} value={s}>
                {localizeSport(s, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-muted text-sm font-medium">{t("filterMerchTypeAll")}</span>
          <select
            name="merchType"
            defaultValue={merchTypeFilter ?? ""}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="">{t("filterMerchTypeAll")}</option>
            {merchTypes.map((m) => (
              <option key={m} value={m}>
                {localizeMerchType(m, locale)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("searchButton")}
          </button>
        </div>
      </form>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={`/shop/${p.slug}`}
              className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring block overflow-hidden rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              <div className="bg-secondary relative aspect-[4/3]">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                ) : (
                  <div className="text-muted flex h-full items-center justify-center text-sm">{p.name}</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
                    {localizeMerchType(p.merchType, locale)}
                  </span>
                  {p.sport && (
                    <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
                      {localizeSport(p.sport, locale)}
                    </span>
                  )}
                  {p.sizeOptions?.length ? (
                    <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
                      {p.sizeOptions.length} {sizesLabel}
                    </span>
                  ) : (
                    <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
                      {t("noSize")}
                    </span>
                  )}
                </div>
                <p className="text-foreground font-semibold">{p.name}</p>
                <p className="text-primary mt-1 font-medium">
                  {t("price", { price: formatTnd(p.priceCents) })}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {products.length === 0 && (
        <p className="text-muted mt-8">Aucun produit — exécutez le seed Prisma.</p>
      )}
    </div>
  );
}
