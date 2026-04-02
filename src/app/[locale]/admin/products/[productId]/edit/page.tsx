import { prisma } from "@/lib/prisma";
import { updateProductAction, deleteProductAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MerchType, Sport } from "@/generated/prisma/enums";
import { ProductImagesEditor } from "@/components/admin/product-images-editor";
import { localizeMerchType, localizeSport } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; productId: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { locale, productId } = await params;
  const t = await getTranslations("admin");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      sizeStocks: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!product) notFound();

  const merchTypeValues = Object.values(MerchType) as MerchType[];
  const sportValues = Object.values(Sport) as Sport[];

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">{t("products")}</h1>
      <p className="text-muted mt-2">Modifier un produit</p>

      <form
        action={updateProductAction}
        method="post"
        className="mt-8 space-y-4"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={product.id} />

        <label className="flex flex-col gap-1 text-sm">
          <span>Slug</span>
          <input
            name="slug"
            required
            defaultValue={product.slug}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Nom</span>
          <input
            name="name"
            required
            defaultValue={product.name}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Description</span>
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={product.description}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-1">
          <label className="flex flex-col gap-1 text-sm">
            <span>Prix (TND)</span>
            <input
              name="priceTnd"
              type="number"
              step="0.01"
              required
              defaultValue={(product.priceCents / 100).toFixed(2)}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>Type de merchandising</span>
          <select
            name="merchType"
            required
            defaultValue={product.merchType}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            {merchTypeValues.map((m) => (
              <option key={m} value={m}>
                {localizeMerchType(m, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Sport (optionnel)</span>
          <select
            name="sport"
            defaultValue={product.sport ?? ""}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="">Aucun</option>
            {sportValues.map((s) => (
              <option key={s} value={s}>
                {localizeSport(s, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Taille(s) (séparées par des virgules)</span>
          <textarea
            name="sizeOptions"
            rows={3}
            defaultValue={(product.sizeOptions ?? []).join(", ")}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        {product.sizeOptions?.length ? (
          <div className="border-border bg-card rounded-xl border p-4">
            <p className="text-muted text-sm mb-3">Stock par taille (ajouter/retirer).</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr] text-sm">
              <div className="font-semibold">Taille</div>
              <div className="font-semibold">Stock actuel</div>
              <div className="font-semibold">Ajustement (+ / -)</div>
              {product.sizeOptions.map((size) => {
                const row = product.sizeStocks.find((s) => s.sizeOption === size);
                const current = row?.stock ?? 0;
                return (
                  <span key={size} className="contents">
                    <div className="py-1">{size}</div>
                    <div className="py-1 text-muted">{current}</div>
                    <div className="py-1 flex gap-2">
                      <input
                        type="number"
                        name={`sizeDelta_${size}`}
                        placeholder="0"
                        className="border-border bg-background w-24 rounded-md border px-2 py-1 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
                      />
                    </div>
                  </span>
                );
              })}
            </div>
            <p className="text-muted mt-2 text-xs">
              Les valeurs positives augmentent le stock, les valeurs négatives le réduisent. Les tailles restent
              visibles même avec un stock à 0.
            </p>
          </div>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span>Catégorie (optionnel)</span>
          <input
            name="category"
            defaultValue={product.category}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="mt-6">
          <ProductImagesEditor
            productId={product.id}
            initialImages={product.images.map((img) => ({
              url: img.url,
              altText: img.altText,
              isCover: img.isCover,
              sortOrder: img.sortOrder,
            }))}
          />
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="active" defaultChecked={product.active} />
          <span>Produit actif</span>
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Enregistrer
          </button>
        </div>
      </form>

      <form
        action={deleteProductAction}
        method="post"
        className="mt-8 inline"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={product.id} />
        <button
          type="submit"
          className="border-border hover:border-primary rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Supprimer ce produit
        </button>
      </form>
    </div>
  );
}
