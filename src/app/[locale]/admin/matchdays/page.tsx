import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Sport } from "@/generated/prisma/enums";
import { localizeMatchdayLabel, localizeSport } from "@/lib/db-visual-labels";
import Image from "next/image";
import { getSportImageSrc } from "@/lib/sport-images";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
    sport?: string;
    season?: string;
  }>;
};

export default async function AdminMatchdaysPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const ui =
    locale === "fr"
      ? {
          search: "Rechercher...",
          allSports: "Tous les sports",
          allSeasons: "Toutes les saisons",
          filter: "Filtrer",
          reset: "R\u00E9initialiser",
          newMatchday: "Nouvelle journ\u00E9e",
          colMatchday: "Journ\u00E9e",
          colSport: "Sport",
          colSeason: "Saison",
          colFixtures: "Matchs",
          empty: "Aucune journ\u00E9e trouv\u00E9e pour ces filtres.",
        }
      : locale === "ar"
        ? {
            search: "\u0628\u062D\u062B...",
            allSports: "\u0643\u0644 \u0627\u0644\u0631\u064A\u0627\u0636\u0627\u062A",
            allSeasons: "\u0643\u0644 \u0627\u0644\u0645\u0648\u0627\u0633\u0645",
            filter: "\u062A\u0635\u0641\u064A\u0629",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            newMatchday: "\u062C\u0648\u0644\u0629 \u062C\u062F\u064A\u062F\u0629",
            colMatchday: "\u0627\u0644\u062C\u0648\u0644\u0629",
            colSport: "\u0627\u0644\u0631\u064A\u0627\u0636\u0629",
            colSeason: "\u0627\u0644\u0645\u0648\u0633\u0645",
            colFixtures: "\u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A",
            empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0648\u0644\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0641\u0644\u0627\u062A\u0631.",
          }
        : {
            search: "Search...",
            allSports: "All sports",
            allSeasons: "All seasons",
            filter: "Filter",
            reset: "Reset",
            newMatchday: "New matchday",
            colMatchday: "Matchday",
            colSport: "Sport",
            colSeason: "Season",
            colFixtures: "Fixtures",
            empty: "No matchday found for your filters.",
          };

  const sp = await (searchParams ?? Promise.resolve({} as { q?: string; sport?: string; season?: string }));
  const q = (sp.q ?? "").trim();
  const sportValues = Object.values(Sport) as Sport[];
  const selectedSport = sportValues.includes(sp.sport as Sport) ? (sp.sport as Sport) : "";
  const selectedSeason = (sp.season ?? "").trim();

  const seasons = await prisma.matchday.findMany({
    where: { season: { not: null } },
    distinct: ["season"],
    select: { season: true },
    orderBy: { season: "desc" },
  });

  const matchdays = await prisma.matchday.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { label: { contains: q, mode: "insensitive" } },
              { season: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(selectedSport ? { sport: selectedSport } : {}),
      ...(selectedSeason ? { season: selectedSeason } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { fixtures: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">{t("matchdays")}</h1>
          <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_160px_180px_auto]">
            <input
              name="q"
              defaultValue={q}
              placeholder={ui.search}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />

            <select
              name="sport"
              defaultValue={selectedSport}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="">{ui.allSports}</option>
              {sportValues.map((sport) => (
                <option key={sport} value={sport}>
                  {localizeSport(sport, locale)}
                </option>
              ))}
            </select>

            <select
              name="season"
              defaultValue={selectedSeason}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="">{ui.allSeasons}</option>
              {seasons
                .map((item) => item.season)
                .filter((value): value is string => Boolean(value))
                .map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
            </select>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {ui.filter}
              </button>
              {q || selectedSport || selectedSeason ? (
                <Link href="/admin/matchdays" className="text-muted text-sm underline">
                  {ui.reset}
                </Link>
              ) : null}
            </div>
          </form>
        </div>

        <Link
          href="/admin/matchdays/new"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {ui.newMatchday}
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.colMatchday}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.colSport}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.colSeason}
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.colFixtures}
              </th>
            </tr>
          </thead>
          <tbody>
            {matchdays.map((matchday) => (
              <tr key={matchday.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex items-center gap-3">
                    <Image
                      src={matchday.imageUrl ?? getSportImageSrc(matchday.sport)}
                      alt={localizeMatchdayLabel(matchday.label, locale)}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-lg object-cover border border-border"
                    />
                    <div>
                      <Link href={`/admin/matchdays/${matchday.id}`} className="text-primary text-sm underline">
                        {localizeMatchdayLabel(matchday.label, locale)}
                      </Link>
                      <div className="text-muted text-xs font-mono mt-1">{matchday.id}</div>
                    </div>
                  </div>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{localizeSport(matchday.sport, locale)}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{matchday.season ?? "-"}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top text-right">
                  <span className="text-muted">{matchday._count.fixtures}</span>
                </td>
              </tr>
            ))}
            {matchdays.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={4}>
                  {ui.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
