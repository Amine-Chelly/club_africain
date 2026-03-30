import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const t = await getTranslations("shop");
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-foreground text-3xl font-bold">{t("title")}</h1>
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
