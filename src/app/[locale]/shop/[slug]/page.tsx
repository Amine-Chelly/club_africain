import { prisma } from "@/lib/prisma";
import { formatTnd } from "@/lib/money";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("shop");

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="bg-secondary relative aspect-square overflow-hidden rounded-xl">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        ) : (
          <div className="text-muted flex h-full items-center justify-center">{product.name}</div>
        )}
      </div>
      <div>
        <p className="text-muted text-sm uppercase">{product.category}</p>
        <h1 className="text-foreground mt-2 text-3xl font-bold">{product.name}</h1>
        <p className="text-primary mt-4 text-2xl font-semibold">
          {t("price", { price: formatTnd(product.priceCents) })}
        </p>
        <p className="text-muted mt-6 leading-relaxed">{product.description}</p>
        <div className="mt-8 space-y-2">
          <AddToCartButton productId={product.id} label={t("addToCart")} />
          <p className="text-muted text-sm">{t("loginToBuy")}</p>
        </div>
      </div>
    </div>
  );
}
