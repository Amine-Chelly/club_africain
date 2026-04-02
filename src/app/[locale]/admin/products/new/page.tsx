import { createProductAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { MerchType, Sport } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewProductPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  await auth(); // ensure cookies loaded; protection is handled in AdminLayout

  const merchTypeValues = Object.values(MerchType) as MerchType[];
  const sportValues = Object.values(Sport) as Sport[];

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

        <div className="grid gap-4 sm:grid-cols-1">
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
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>Type de merchandising</span>
          <select
            name="merchType"
            required
            defaultValue="OTHER"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            {merchTypeValues.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Sport (optionnel)</span>
          <select
            name="sport"
            defaultValue=""
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="">Aucun</option>
            {sportValues.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Taille(s) (séparées par des virgules)</span>
          <textarea
            name="sizeOptions"
            rows={3}
            placeholder="S,M,L,XL"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Catégorie (optionnel)</span>
          <input
            name="category"
            placeholder="Ex: Jerseys"
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

