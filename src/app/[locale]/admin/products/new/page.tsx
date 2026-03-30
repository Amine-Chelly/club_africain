import { createProductAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewProductPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  await auth(); // ensure cookies loaded; protection is handled in AdminLayout

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">{t("products")}</h1>
      <p className="text-muted mt-2">Créer un produit</p>

      <form action={createProductAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="flex flex-col gap-1 text-sm">
          <span>Slug</span>
          <input
            name="slug"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Nom</span>
          <input
            name="name"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Description</span>
          <textarea
            name="description"
            required
            rows={4}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Prix (TND)</span>
            <input
              name="priceTnd"
              type="number"
              step="0.01"
              required
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Stock</span>
            <input
              name="stock"
              type="number"
              required
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>Catégorie</span>
          <input
            name="category"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Image URL (optionnel)</span>
          <input
            name="imageUrl"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder="https://..."
          />
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="active" defaultChecked />
          <span>Produit actif</span>
        </label>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Créer
        </button>
      </form>
    </div>
  );
}

