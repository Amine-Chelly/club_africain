import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import {
  localizeAgeGroup,
  localizeMatchdayLabel,
  localizeSport,
  localizeTeamGender,
  localizeTournamentCategory,
  localizeTeamCategory,
  shortLabels,
} from "@/lib/db-visual-labels";
import { getSportImageSrc } from "@/lib/sport-images";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }> };

function getMetricLabels(sport: string) {
  if (sport === "FOOTBALL") {
    return { summary: "Goals", row: "goals", against: "Goals Against" };
  }

  if (sport === "TENNIS") {
    return { summary: "Wins", row: "wins", against: "Losses" };
  }

  if (sport === "HANDBALL" || sport === "BASKETBALL" || sport === "VOLLEYBALL") {
    return { summary: "Points", row: "points", against: "Points Against" };
  }

  return { summary: "Stats", row: "stats", against: "Against" };
}

function localizeMetricLabels(
  locale: string,
  labels: { summary: string; row: string; against: string },
) {
  if (locale === "fr") {
    const map: Record<string, string> = {
      Goals: "Buts",
      goals: "buts",
      "Goals Against": "Buts encaisses",
      Wins: "Victoires",
      wins: "victoires",
      Losses: "Defaites",
      Points: "Points",
      points: "points",
      "Points Against": "Points encaisses",
      Stats: "Stats",
      stats: "stats",
      Against: "Contre",
    };
    return {
      summary: map[labels.summary] ?? labels.summary,
      row: map[labels.row] ?? labels.row,
      against: map[labels.against] ?? labels.against,
    };
  }
  if (locale === "ar") {
    const map: Record<string, string> = {
      Goals: "أهداف",
      goals: "أهداف",
      "Goals Against": "أهداف ضده",
      Wins: "انتصارات",
      wins: "انتصارات",
      Losses: "هزائم",
      Points: "نقاط",
      points: "نقاط",
      "Points Against": "نقاط ضده",
      Stats: "إحصائيات",
      stats: "إحصائيات",
      Against: "ضد",
    };
    return {
      summary: map[labels.summary] ?? labels.summary,
      row: map[labels.row] ?? labels.row,
      against: map[labels.against] ?? labels.against,
    };
  }
  return labels;
}

export default async function TeamDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("teams");
  const labels = shortLabels(locale);

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      players: { orderBy: [{ number: "asc" }, { name: "asc" }] },
      staff: { orderBy: { name: "asc" } },
      fixtures: {
        orderBy: { kickoffAt: "desc" },
        take: 8,
        include: { matchday: true, player: true },
      },
    },
  });

  if (!team) notFound();
  if (team.category === "INDIVIDUAL") notFound();

  const metricLabels = localizeMetricLabels(locale, getMetricLabels(team.sport));
  const finishedFixtures = team.fixtures.filter(
    (fixture) => fixture.status === "FINISHED" && fixture.homeScore != null && fixture.awayScore != null,
  );
  const matchStats = finishedFixtures.reduce(
    (acc, fixture) => {
      const teamMetric = fixture.isHome ? (fixture.homeScore ?? 0) : (fixture.awayScore ?? 0);
      const oppMetric = fixture.isHome ? (fixture.awayScore ?? 0) : (fixture.homeScore ?? 0);

      acc.played += 1;
      acc.metricFor += teamMetric;
      acc.metricAgainst += oppMetric;

      if (teamMetric > oppMetric) {
        acc.wins += 1;
      } else if (teamMetric < oppMetric) {
        acc.losses += 1;
      } else {
        acc.draws += 1;
      }

      return acc;
    },
    { played: 0, wins: 0, draws: 0, losses: 0, metricFor: 0, metricAgainst: 0 },
  );
  const tennisFixturesByTournament =
    team.sport === "TENNIS"
      ? team.fixtures.reduce<Record<string, typeof team.fixtures>>((acc, fixture) => {
          const key = fixture.competition;
          if (!acc[key]) acc[key] = [];
          acc[key].push(fixture);
          return acc;
        }, {})
      : {};

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <section className="border-border bg-card rounded-3xl border p-6 sm:p-8">
        <div className="relative mb-6 aspect-[16/6] overflow-hidden rounded-2xl">
          <Image
            src={getSportImageSrc(team.sport)}
            alt={`${localizeSport(team.sport, locale)} team banner`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1200px"
          />
        </div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">{team.name}</h1>
        <p className="text-muted mt-2">
          {localizeSport(team.sport, locale)} - {localizeTeamGender(team.gender, locale)} -{" "}
          {localizeTeamCategory(team.category, locale)} -{" "}
          {localizeAgeGroup(team.ageGroup, locale)}
        </p>
        {team.description && <p className="text-muted mt-5 max-w-3xl leading-relaxed">{team.description}</p>}

        <dl className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="border-border rounded-2xl border px-4 py-4">
            <dt className="text-muted text-sm">{t("summaryPlayers")}</dt>
            <dd className="text-foreground mt-1 text-2xl font-bold">{team.players.length}</dd>
          </div>
          <div className="border-border rounded-2xl border px-4 py-4">
            <dt className="text-muted text-sm">{t("summaryStaff")}</dt>
            <dd className="text-foreground mt-1 text-2xl font-bold">{team.staff.length}</dd>
          </div>
          <div className="border-border rounded-2xl border px-4 py-4">
            <dt className="text-muted text-sm">{labels.played}</dt>
            <dd className="text-foreground mt-1 text-2xl font-bold">{matchStats.played}</dd>
          </div>
          <div className="border-border rounded-2xl border px-4 py-4">
            <dt className="text-muted text-sm">{metricLabels.summary}</dt>
            <dd className="text-foreground mt-1 text-2xl font-bold">{matchStats.metricFor}</dd>
          </div>
          <div className="border-border rounded-2xl border px-4 py-4">
            <dt className="text-muted text-sm">{metricLabels.against}</dt>
            <dd className="text-foreground mt-1 text-2xl font-bold">{matchStats.metricAgainst}</dd>
          </div>
          <div className="border-border rounded-2xl border px-4 py-4">
            <dt className="text-muted text-sm">{labels.wdl}</dt>
            <dd className="text-foreground mt-1 text-2xl font-bold">
              {matchStats.wins}-{matchStats.draws}-{matchStats.losses}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-foreground text-xl font-semibold">{t("squad")}</h2>
        <ul className="border-border mt-4 divide-y rounded-2xl border">
          {team.players.map((player) => (
            <li key={player.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <Image
                  src={player.imageUrl ?? getSportImageSrc(team.sport)}
                  alt={player.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-foreground font-medium">{player.name}</p>
                  <p className="text-muted text-xs">{player.nationality ?? t("unknownNationality")}</p>
                  {team.sport === "TENNIS" ? (
                    <p className="text-muted text-xs">
                      {t("singlesRanking")}: {player.singlesRanking != null ? `#${player.singlesRanking}` : "-"} -{" "}
                      {t("doublesRanking")}: {player.doublesRanking != null ? `#${player.doublesRanking}` : "-"}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="text-muted text-right">
                <p>
                  {team.sport === "TENNIS" ? "-" : (player.position ?? t("unknownPosition"))}
                  {player.number != null ? ` - #${player.number}` : ""}
                </p>
                <p className="text-xs">
                  {player.appearances} {labels.apps} - {player.goals} {metricLabels.row}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {team.players.length === 0 && <p className="text-muted mt-2 text-sm">{t("emptySquad")}</p>}
      </section>

      <section className="mt-12">
        <h2 className="text-foreground text-xl font-semibold">{t("staff")}</h2>
        <ul className="border-border mt-4 divide-y rounded-2xl border">
          {team.staff.map((staff) => (
            <li key={staff.id} className="flex justify-between gap-2 px-4 py-3 text-sm">
              <span className="text-foreground font-medium">{staff.name}</span>
              <span className="text-muted">{staff.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-foreground text-xl font-semibold">{t("fixtures")}</h2>
        {team.sport === "TENNIS" ? (
          <div className="mt-4 space-y-4">
            {Object.entries(tennisFixturesByTournament).map(([tournament, fixtures]) => (
              <section key={tournament} className="border-border rounded-2xl border">
                <div className="border-border border-b px-4 py-3">
                  <h3 className="text-foreground text-base font-semibold">
                    {tournament}{" "}
                    <span className="text-muted text-sm font-normal">
                      ({localizeTournamentCategory(fixtures[0]?.tournamentCategory, locale)})
                    </span>
                  </h3>
                </div>
                <ul className="divide-y divide-border">
                  {fixtures.map((fixture) => (
                    <li key={fixture.id} className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="inline-flex items-center gap-2">
                          <Image
                            src={getSportImageSrc(team.sport)}
                            alt={`${localizeSport(team.sport, locale)} icon`}
                            width={18}
                            height={18}
                            className="rounded object-cover"
                          />
                          <span>
                            {fixture.matchday ? `${localizeMatchdayLabel(fixture.matchday.label, locale)} - ` : ""}
                            {fixture.player ? `${fixture.player.name} vs ` : "vs "}
                            {fixture.opponent}
                          </span>
                        </span>
                        <span className="text-muted">{new Date(fixture.kickoffAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted text-xs">{fixture.venue}</p>
                      {fixture.homeScore != null && fixture.awayScore != null ? (
                        <p className="text-foreground mt-1 font-semibold">
                          {fixture.homeScore} - {fixture.awayScore}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <ul className="border-border mt-4 divide-y rounded-2xl border">
            {team.fixtures.map((fixture) => (
              <li key={fixture.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="inline-flex items-center gap-2">
                    <Image
                      src={getSportImageSrc(team.sport)}
                      alt={`${localizeSport(team.sport, locale)} icon`}
                      width={18}
                      height={18}
                      className="rounded object-cover"
                    />
                    <span>
                      {fixture.matchday ? `${localizeMatchdayLabel(fixture.matchday.label, locale)} - ` : ""}
                      {fixture.isHome ? "vs" : "@"} {fixture.opponent}
                    </span>
                  </span>
                  <span className="text-muted">{new Date(fixture.kickoffAt).toLocaleString()}</span>
                </div>
                <p className="text-muted text-xs">
                  {fixture.competition} - {fixture.venue}
                </p>
                {fixture.homeScore != null && fixture.awayScore != null && (
                  <p className="text-foreground mt-1 font-semibold">
                    {fixture.homeScore} - {fixture.awayScore}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {team.fixtures.length === 0 && <p className="text-muted mt-2 text-sm">{t("emptyFixtures")}</p>}
      </section>
    </div>
  );
}
