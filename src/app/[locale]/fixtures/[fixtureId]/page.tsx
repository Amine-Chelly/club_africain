import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/date-format";
import { FixturePlayerEventType } from "@/generated/prisma/enums";
import {
  localizeFixtureStatus,
  localizeMatchdayLabel,
  localizeSport,
  localizeTeamCategory,
  localizeTournamentCategory,
  localizeTournamentTier,
} from "@/lib/db-visual-labels";
import { getSportImageSrc } from "@/lib/sport-images";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; fixtureId: string }> };

export default async function FixturePage({ params }: Props) {
  const { locale, fixtureId } = await params;
  const [tFixtures, tTeams] = await Promise.all([getTranslations("fixtures"), getTranslations("teams")]);

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: {
        team: {
          select: {
            id: true,
            slug: true,
            name: true,
            sport: true,
            category: true,
            gender: true,
            ageGroup: true,
            imageUrl: true,
          },
        },
      player: {
        select: {
          id: true,
          name: true,
        },
      },
      events: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      matchday: {
        select: {
          id: true,
          label: true,
          season: true,
          sport: true,
          tennisCategory: true,
          tournamentTier: true,
        },
      },
    },
  });

  if (!fixture) notFound();

  const title =
    fixture.team.category === "INDIVIDUAL" && fixture.player ? fixture.player.name : fixture.team.name;
  const participantHref =
    fixture.team.category === "INDIVIDUAL" && fixture.player ? `/athletes/${fixture.player.id}` : `/teams/${fixture.team.slug}`;
  const scoringType =
    fixture.team.sport === "FOOTBALL" ? FixturePlayerEventType.GOAL : FixturePlayerEventType.POINT;
  const scorerCounts = fixture.events
    .filter((event) => event.type === scoringType)
    .reduce<Map<string, { id: string; name: string; count: number }>>((map, event) => {
      const existing = map.get(event.player.id);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(event.player.id, { id: event.player.id, name: event.player.name, count: 1 });
      }
      return map;
    }, new Map());

  const appearancePlayers = fixture.events
    .filter((event) => event.type === FixturePlayerEventType.APPEARANCE)
    .map((e) => e.player);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/fixtures" className="text-muted text-sm underline">
        {tFixtures("backToFixtures")}
      </Link>

      <section className="border-border bg-card mt-4 overflow-hidden rounded-3xl border">
        <div className="relative aspect-[16/7]">
          <Image
            src={fixture.imageUrl ?? fixture.team.imageUrl ?? getSportImageSrc(fixture.team.sport)}
            alt={`${localizeSport(fixture.team.sport, locale)} fixture`}
            fill
            className="object-contain bg-muted/10"
            priority
          />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-muted text-sm uppercase tracking-wide">{localizeSport(fixture.team.sport, locale)}</p>
              <h1 className="text-foreground mt-1 text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted mt-2 text-sm">
                {localizeTeamCategory(fixture.team.category, locale)}
                {fixture.matchday ? ` · ${localizeMatchdayLabel(fixture.matchday.label, locale)}` : ""}
              </p>
            </div>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              {localizeFixtureStatus(fixture.status, locale)}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border-border bg-background rounded-2xl border p-4">
              <p className="text-muted text-xs uppercase tracking-wide">{tFixtures("details")}</p>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{tFixtures("competition")}</dt>
                  <dd className="text-foreground text-right font-medium">
                    {fixture.competition}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{tFixtures("venue")}</dt>
                  <dd className="text-foreground text-right font-medium">{fixture.venue}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{tFixtures("kickoffAt")}</dt>
                  <dd className="text-foreground text-right font-medium">{formatDateTime(fixture.kickoffAt, locale)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{tFixtures("status")}</dt>
                  <dd className="text-foreground text-right font-medium">{localizeFixtureStatus(fixture.status, locale)}</dd>
                </div>
                {fixture.team.sport === "TENNIS" ? (
                  <>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">{tFixtures("tournamentCategory")}</dt>
                      <dd className="text-foreground text-right font-medium">
                        {localizeTournamentCategory(fixture.matchday?.tennisCategory, locale)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">{tFixtures("tournamentTier")}</dt>
                      <dd className="text-foreground text-right font-medium">
                        {localizeTournamentTier(fixture.matchday?.tournamentTier, locale)}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
            </div>

            <div className="border-border bg-background rounded-2xl border p-4">
              <p className="text-muted text-xs uppercase tracking-wide">{tFixtures("participants")}</p>
              <div className="mt-3 space-y-4 text-sm">
                <div>
                  <p className="text-muted text-xs">{fixture.team.category === "INDIVIDUAL" ? tFixtures("athlete") : tFixtures("team")}</p>
                  <Link href={participantHref} className="text-primary mt-1 inline-flex font-semibold underline">
                    {title}
                  </Link>
                  <p className="text-muted mt-1 text-xs">
                    {fixture.team.category === "INDIVIDUAL" && fixture.player
                      ? `${tTeams("teamLabel")}: ${fixture.team.name}`
                      : `${localizeTeamCategory(fixture.team.category, locale)} · ${fixture.team.gender ?? "-"}`}
                  </p>
                </div>

                <div className="border-border border-t pt-4">
                  <p className="text-muted text-xs">{tFixtures("opponent")}</p>
                  <p className="text-foreground mt-1 font-semibold">{fixture.opponent}</p>
                </div>
              </div>
            </div>
          </div>

          {fixture.homeScore != null && fixture.awayScore != null ? (
            <div className="border-border bg-background mt-4 rounded-2xl border p-4 text-center">
              <p className="text-muted text-xs uppercase tracking-wide">{tFixtures("score")}</p>
              <p className="text-foreground mt-2 text-3xl font-bold">
                {fixture.homeScore} - {fixture.awayScore}
              </p>
              <p className="text-muted mt-1 text-sm">
                {fixture.isHome ? tFixtures("homeSide") : tFixtures("awaySide")}
              </p>
            </div>
          ) : null}

            <div className="border-border bg-background mt-4 rounded-2xl border p-4">
              <p className="text-muted text-xs uppercase tracking-wide">
                {fixture.team.sport === "FOOTBALL" ? tFixtures("goalscorers") : tFixtures("pointScorers")}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {Array.from(scorerCounts.values()).map((scorer) => (
                  <li key={scorer.id} className="flex items-center justify-between gap-3">
                    <span className="text-foreground font-medium">{scorer.name}</span>
                    <span className="text-muted">
                      {scorer.count} {fixture.team.sport === "FOOTBALL" ? tFixtures("goalCount") : tFixtures("pointCount")}
                    </span>
                  </li>
                ))}
              </ul>
              {scorerCounts.size === 0 ? (
                <p className="text-muted mt-3 text-sm">{tFixtures("noScorers")}</p>
              ) : null}
            </div>

          {appearancePlayers.length > 0 ? (
            <div className="border-border bg-background mt-4 rounded-2xl border p-4">
              <p className="text-muted text-xs uppercase tracking-wide">{tTeams("squad")}</p>
              <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                {appearancePlayers.map((player) => (
                  <li key={player.id}>
                    <Link
                      href={`/athletes/${player.id}`}
                      className="hover:bg-muted focus-visible:ring-ring bg-muted/40 text-foreground inline-flex rounded-lg border border-transparent px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2"
                    >
                      {player.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {fixture.matchday ? (
            <p className="text-muted mt-4 text-sm">
              {tFixtures("matchday")}: {localizeMatchdayLabel(fixture.matchday.label, locale)}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
