import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { localizeSport } from "@/lib/db-visual-labels";
import { Sport } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

const SPORTS = Object.values(Sport);

export default async function AdminClubPage({ params }: Props) {
  const { locale } = await params;

  const [histories, titles, venues] = await Promise.all([
    prisma.clubSportHistory.findMany({ orderBy: { sport: "asc" } }),
    prisma.clubTitle.findMany({ orderBy: [{ sport: "asc" }, { sortOrder: "asc" }, { year: "desc" }] }),
    prisma.clubVenue.findMany({ orderBy: { sport: "asc" } }),
  ]);

  const historyMap = Object.fromEntries(histories.map((h) => [h.sport, h]));
  const venueMap = Object.fromEntries(venues.map((v) => [v.sport, v]));
  const titlesBySport = SPORTS.reduce<Record<string, typeof titles>>((acc, sport) => {
    acc[sport] = titles.filter((t) => t.sport === sport);
    return acc;
  }, {} as Record<string, typeof titles>);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">Club — Sections par sport</h1>
        <Link href="/admin" className="text-muted text-sm underline">← Dashboard</Link>
      </div>

      <div className="mt-8 space-y-12">
        {SPORTS.map((sport) => (
          <section key={sport} className="border-border rounded-2xl border p-6">
            <h2 className="text-foreground text-xl font-bold">{localizeSport(sport, locale)}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">

              {/* History */}
              <div className="border-border bg-card rounded-xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">Historique</p>
                {historyMap[sport] ? (
                  <p className="text-foreground mt-2 line-clamp-3 text-sm">{historyMap[sport].body.substring(0, 120)}…</p>
                ) : (
                  <p className="text-muted mt-2 text-sm italic">Aucun historique</p>
                )}
                <Link
                  href={`/admin/club/${sport}/history`}
                  className="text-primary mt-3 inline-block text-sm underline"
                >
                  {historyMap[sport] ? "Modifier" : "Ajouter"}
                </Link>
              </div>

              {/* Titles */}
              <div className="border-border bg-card rounded-xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">Palmarès ({titlesBySport[sport].length})</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {titlesBySport[sport].slice(0, 3).map((t) => (
                    <li key={t.id} className="text-foreground truncate">{t.year} — {t.competition}</li>
                  ))}
                  {titlesBySport[sport].length > 3 && (
                    <li className="text-muted">+{titlesBySport[sport].length - 3} autres…</li>
                  )}
                  {titlesBySport[sport].length === 0 && (
                    <li className="text-muted italic">Aucun titre</li>
                  )}
                </ul>
                <Link
                  href={`/admin/club/${sport}/titles`}
                  className="text-primary mt-3 inline-block text-sm underline"
                >
                  Gérer les titres
                </Link>
              </div>

              {/* Venue */}
              <div className="border-border bg-card rounded-xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">Enceinte</p>
                {venueMap[sport] ? (
                  <p className="text-foreground mt-2 text-sm font-medium">{venueMap[sport].name} — {venueMap[sport].city}</p>
                ) : (
                  <p className="text-muted mt-2 text-sm italic">Aucune enceinte</p>
                )}
                <Link
                  href={`/admin/club/${sport}/venue`}
                  className="text-primary mt-3 inline-block text-sm underline"
                >
                  {venueMap[sport] ? "Modifier" : "Ajouter"}
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
