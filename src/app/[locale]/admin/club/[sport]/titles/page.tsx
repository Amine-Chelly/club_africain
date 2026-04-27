import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { localizeSport } from "@/lib/db-visual-labels";
import { createClubTitleAction, deleteClubTitleAction } from "@/lib/admin/club-actions";
import { notFound } from "next/navigation";
import { Sport } from "@/generated/prisma/enums";
import { TitleImageEditor } from "@/components/admin/title-image-editor";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; sport: string }> };

export default async function AdminClubTitlesPage({ params }: Props) {
  const { locale, sport } = await params;
  if (!Object.values(Sport).includes(sport as Sport)) notFound();

  const titles = await prisma.clubTitle.findMany({
    where: { sport: sport as Sport },
    orderBy: [{ year: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-foreground text-2xl font-bold">
          {localizeSport(sport, locale)} — Palmarès
        </h1>
        <Link href={`/admin/club`} className="text-muted text-sm underline">← Retour</Link>
      </div>

      {/* Add new title */}
      <form action={createClubTitleAction} className="border-border bg-card mt-8 rounded-2xl border p-5 space-y-3">
        <p className="text-foreground font-semibold">Ajouter un titre</p>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="sport" value={sport} />

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Compétition</span>
            <input name="competition" required placeholder="Championnat de Tunisie"
              className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Année</span>
            <input name="year" type="number" required min={1900} max={2100} placeholder="2024"
              className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Détail (optionnel)</span>
            <input name="detail" placeholder="Vice-champion…"
              className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2" />
          </label>
        </div>

        <button type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold">
          Ajouter
        </button>
      </form>

      {/* Existing titles */}
      <ul className="mt-6 divide-y divide-border">
        {titles.length === 0 && (
          <li className="text-muted py-4 text-sm italic">Aucun titre pour ce sport.</li>
        )}
        {titles.map((title) => (
          <li key={title.id} className="py-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-foreground font-semibold">{title.year}</span>
                {" — "}
                <span className="text-foreground">{title.competition}</span>
                {title.detail && <span className="text-muted ml-2">({title.detail})</span>}
              </div>
              <form action={deleteClubTitleAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={title.id} />
                <input type="hidden" name="sport" value={sport} />
                <button type="submit" className="text-primary text-sm underline hover:opacity-70 shrink-0">
                  Supprimer
                </button>
              </form>
            </div>
            {/* Image editor */}
            <TitleImageEditor titleId={title.id} initialImageUrl={title.imageUrl} />
          </li>
        ))}
      </ul>
    </div>
  );
}
