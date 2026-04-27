import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { localizeSport } from "@/lib/db-visual-labels";
import { upsertClubHistoryAction } from "@/lib/admin/club-actions";
import { notFound } from "next/navigation";
import { Sport } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; sport: string }> };

export default async function AdminClubHistoryPage({ params }: Props) {
  const { locale, sport } = await params;
  if (!Object.values(Sport).includes(sport as Sport)) notFound();

  const existing = await prisma.clubSportHistory.findUnique({ where: { sport: sport as Sport } });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-foreground text-2xl font-bold">
          {localizeSport(sport, locale)} — Historique
        </h1>
        <Link href={`/admin/club`} className="text-muted text-sm underline">← Retour</Link>
      </div>

      <form action={upsertClubHistoryAction} className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="sport" value={sport} />

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground font-medium">Contenu (texte libre, paragraphes, HTML accepté)</span>
          <textarea
            name="body"
            rows={14}
            required
            defaultValue={existing?.body ?? ""}
            className="border-border bg-background text-foreground focus-visible:ring-ring rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2"
          />
        </label>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
