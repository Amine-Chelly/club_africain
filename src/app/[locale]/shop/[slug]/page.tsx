import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductImageGallery } from "@/components/shop/product-image-gallery";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { localizeMerchType, localizeSport, sizesWord } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("shop");
  const sizesLabel = sizesWord(locale);

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      sizeStocks: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="bg-secondary relative aspect-square overflow-hidden rounded-xl">
        {product.images.length > 0 ? (
          <ProductImageGallery images={product.images.map((img) => ({ url: img.url, altText: img.altText, isCover: img.isCover }))} />
        ) : product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-muted flex h-full items-center justify-center">{product.name}</div>
        )}
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
            {localizeMerchType(product.merchType, locale)}
          </span>
          {product.sport && (
            <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
              {localizeSport(product.sport, locale)}
            </span>
          )}
          {product.sizeOptions?.length ? (
            <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
              {product.sizeOptions.length} {sizesLabel}
            </span>
          ) : (
            <span className="text-muted text-xs border-border border rounded-full px-2 py-0.5">
              {t("noSize")}
            </span>
          )}
        </div>
        <h1 className="text-foreground mt-2 text-3xl font-bold">{product.name}</h1>
        <p className="text-primary mt-4 text-2xl font-semibold">
          {t("price", { price: formatTnd(product.priceCents) })}
        </p>
        <p className="text-muted mt-6 leading-relaxed">{product.description}</p>
        <div className="mt-8 space-y-2">
          <AddToCartButton
            productId={product.id}
            label={t("addToCart")}
            sizeOptions={product.sizeOptions ?? []}
            disabledSizes={(product.sizeOptions ?? []).filter((s) => {
              const row = product.sizeStocks.find((ss) => ss.sizeOption === s);
              return !row || row.stock <= 0;
            })}
          />
          <p className="text-muted text-sm">{t("loginToBuy")}</p>
        </div>
      </div>
    </div>
  );
}
