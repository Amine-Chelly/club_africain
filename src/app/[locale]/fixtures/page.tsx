import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AgeGroup, Sport, TeamCategory, TeamGender } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/date-format";
import {
  localizeFixtureStatus,
  localizeAgeGroup,
  localizeMatchdayLabel,
  localizeSport,
  localizeTeamCategory,
  localizeTournamentCategory,
  localizeTournamentTier,
} from "@/lib/db-visual-labels";
import { getSportImageSrc } from "@/lib/sport-images";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
    sport?: string;
    ageGroup?: string;
    gender?: string;
    status?: string;
  }>;
};

const fixtureStatuses = ["SCHEDULED", "LIVE", "FINISHED", "CANCELED"] as const;

function getFixtureTitle(fixture: {
  team: { category: TeamCategory; name: string };
  player: { name: string } | null;
}) {
  if (fixture.team.category === "INDIVIDUAL" && fixture.player) {
    return fixture.player.name;
  }

  return fixture.team.name;
}

export default async function FixturesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const tFixtures = await getTranslations("fixtures");
  const sp = await (
    searchParams ??
    Promise.resolve({} as { q?: string; sport?: string; ageGroup?: string; gender?: string; status?: string })
  );

  const sportValues = Object.values(Sport) as Sport[];
  const ageGroupValues = Object.values(AgeGroup) as AgeGroup[];
  const teamGenderValues = ["MALE", "FEMALE"] as const;
  const selectedSport = sportValues.includes(sp.sport as Sport) ? (sp.sport as Sport) : Sport.FOOTBALL;
  const selectedAgeGroup = ageGroupValues.includes(sp.ageGroup as AgeGroup) ? (sp.ageGroup as AgeGroup) : "";
  const selectedGender = teamGenderValues.includes(sp.gender as (typeof teamGenderValues)[number]) ? sp.gender : "";
  const selectedStatus = fixtureStatuses.includes(sp.status as (typeof fixtureStatuses)[number])
    ? (sp.status as (typeof fixtureStatuses)[number])
    : "";
  const q = (sp.q ?? "").trim();

  const fixtures = await prisma.fixture.findMany({
    where: {
      ...(selectedSport || selectedAgeGroup || selectedGender
        ? {
            team: {
              ...(selectedSport ? { sport: selectedSport } : {}),
              ...(selectedAgeGroup ? { ageGroup: selectedAgeGroup } : {}),
              ...(selectedGender ? { gender: selectedGender as TeamGender } : {}),
            },
          }
        : {}),
      ...(selectedStatus ? { status: selectedStatus } : {}),
      ...(q
        ? {
            OR: [
              { opponent: { contains: q, mode: "insensitive" } },
              { competition: { contains: q, mode: "insensitive" } },
              { team: { name: { contains: q, mode: "insensitive" } } },
              { player: { name: { contains: q, mode: "insensitive" } } },
              { matchday: { label: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      team: {
        select: {
          id: true,
          slug: true,
          name: true,
          sport: true,
          category: true,
          gender: true,
        },
      },
      player: {
        select: {
          id: true,
          name: true,
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
    orderBy: [{ kickoffAt: "desc" }],
    take: 500,
  });

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <section className="border-border bg-card rounded-3xl border p-6 sm:p-8">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">{tFixtures("title")}</h1>
        <p className="text-muted mt-3 max-w-3xl leading-relaxed">{tFixtures("intro")}</p>
        <p className="text-muted mt-5 text-sm">
          {fixtures.length} {tFixtures("results")}
        </p>
      </section>

      <form
        method="get"
        className="border-border bg-card mt-8 grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_180px_180px_180px_auto]"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder={tFixtures("searchPlaceholder")}
          aria-label={tFixtures("searchLabel")}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        />
        <select
          name="sport"
          defaultValue={selectedSport}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          <option value="">{tFixtures("allSports")}</option>
          {sportValues.map((sport) => (
            <option key={sport} value={sport}>
              {localizeSport(sport, locale)}
            </option>
          ))}
        </select>
        <select
          name="ageGroup"
          defaultValue={selectedAgeGroup}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          <option value="">{tFixtures("allAgeGroups")}</option>
          {ageGroupValues.map((ageGroup) => (
            <option key={ageGroup} value={ageGroup}>
              {localizeAgeGroup(ageGroup, locale)}
            </option>
          ))}
        </select>
        <select
          name="gender"
          defaultValue={selectedGender}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          <option value="">{tFixtures("allGenders")}</option>
          <option value="MALE">{tFixtures("male")}</option>
          <option value="FEMALE">{tFixtures("female")}</option>
        </select>
        <select
          name="status"
          defaultValue={selectedStatus}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          <option value="">{tFixtures("allStatuses")}</option>
          {fixtureStatuses.map((status) => (
            <option key={status} value={status}>
              {localizeFixtureStatus(status, locale)}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {tFixtures("filter")}
          </button>
          {q || selectedSport || selectedAgeGroup || selectedGender || selectedStatus ? (
            <Link href="/fixtures" className="text-muted text-sm underline">
              {tFixtures("reset")}
            </Link>
          ) : null}
        </div>
      </form>

      <ul className="border-border bg-card mt-8 divide-y overflow-hidden rounded-2xl border">
        {fixtures.map((fixture) => {
          const displayName = getFixtureTitle(fixture);

          return (
            <li key={fixture.id}>
              <Link
                href={`/fixtures/${fixture.id}`}
                className="hover:bg-muted/25 focus-visible:ring-ring flex flex-col gap-3 px-4 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full border">
                    <Image
                      src={getSportImageSrc(fixture.team.sport)}
                      alt={`${localizeSport(fixture.team.sport, locale)} fixture`}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground truncate font-semibold">{displayName}</p>
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-medium">
                        {localizeFixtureStatus(fixture.status, locale)}
                      </span>
                    </div>
                    <p className="text-muted mt-1 text-sm">
                      {localizeSport(fixture.team.sport, locale)} - {localizeTeamCategory(fixture.team.category, locale)}
                      {fixture.matchday ? ` - ${localizeMatchdayLabel(fixture.matchday.label, locale)}` : ""}
                    </p>
                    <p className="text-muted mt-1 text-sm">
                      {fixture.matchday ? `${localizeMatchdayLabel(fixture.matchday.label, locale)} - ` : ""}
                      {fixture.team.category === "INDIVIDUAL" && fixture.player ? `${fixture.player.name} ` : `${fixture.team.name} `}
                      {fixture.isHome ? "vs" : "@"} {fixture.opponent}
                    </p>
                    <p className="text-muted mt-1 text-xs">
                      {fixture.competition}
                      {fixture.matchday?.tennisCategory ? ` - ${localizeTournamentCategory(fixture.matchday.tennisCategory, locale)}` : ""}
                      {fixture.matchday?.tournamentTier ? ` - ${localizeTournamentTier(fixture.matchday.tournamentTier, locale)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-muted shrink-0 text-sm sm:text-right">
                  <div>{formatDateTime(fixture.kickoffAt, locale)}</div>
                  {fixture.homeScore != null && fixture.awayScore != null ? (
                    <div className="text-foreground mt-1 font-semibold">
                      {fixture.homeScore} - {fixture.awayScore}
                    </div>
                  ) : (
                    <div className="mt-1">{tFixtures("viewFixture")}</div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {fixtures.length === 0 && <p className="text-muted mt-8">{tFixtures("empty")}</p>}
    </div>
  );
}
