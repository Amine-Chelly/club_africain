import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { localizeSport, localizeTeamCategory, shortLabels } from "@/lib/db-visual-labels";
import { getAthleteImageSrc } from "@/lib/athlete-images";
import { AthletesDirectory } from "@/components/athletes/athletes-directory";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

function localizeSex(gender: string | null | undefined, tAthletes: Awaited<ReturnType<typeof getTranslations>>) {
  if (gender === "MALE") return tAthletes("sexMale");
  if (gender === "FEMALE") return tAthletes("sexFemale");
  return tAthletes("sexUnknown");
}

function getSportStatLabel(sport: string, tAthletes: Awaited<ReturnType<typeof getTranslations>>) {
  if (sport === "TENNIS") return tAthletes("winsLabel");
  if (sport === "HANDBALL" || sport === "BASKETBALL" || sport === "VOLLEYBALL") return tAthletes("pointsLabel");
  return tAthletes("goalsLabel");
}

export default async function AthletesPage({ params }: Props) {
  const { locale } = await params;
  const [tAthletes, tTeams] = await Promise.all([getTranslations("athletes"), getTranslations("teams")]);
  const labels = shortLabels(locale);

  const players = await prisma.player.findMany({
    include: {
      team: {
        select: { id: true, name: true, sport: true, category: true, gender: true },
      },
    },
    orderBy: [{ team: { sport: "asc" } }, { team: { name: "asc" } }, { name: "asc" }],
  });

  const sexForPlayer = (playerGender: string | null | undefined, teamGender: string | null | undefined) =>
    playerGender ?? teamGender ?? "MALE";

  const athletes = players.map((player) => ({
    id: player.id,
    name: player.name,
    teamName: player.team.name,
    sport: player.team.sport,
    sportLabel: localizeSport(player.team.sport, locale),
    category: player.team.category,
    categoryLabel: localizeTeamCategory(player.team.category, locale),
    sex: sexForPlayer(player.gender, player.team.gender),
    sexLabel: localizeSex(sexForPlayer(player.gender, player.team.gender), tAthletes),
    position: player.position ?? tTeams("unknownPosition"),
    number: player.number,
    appearances: player.appearances,
    sportStatLabel: getSportStatLabel(player.team.sport, tAthletes),
    sportStatValue: player.goals,
    singlesRanking: player.singlesRanking,
    doublesRanking: player.doublesRanking,
    ranking: player.ranking,
    imageSrc: getAthleteImageSrc(sexForPlayer(player.gender, player.team.gender)),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <section className="border-border bg-card rounded-3xl border p-6 sm:p-8">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">{tAthletes("title")}</h1>
        <p className="text-muted mt-3 max-w-3xl leading-relaxed">{tAthletes("intro")}</p>
      </section>

      <AthletesDirectory
        athletes={athletes}
        labels={{
          searchPlaceholder: tAthletes("searchPlaceholder"),
          searchLabel: tAthletes("searchLabel"),
          categoryLabel: tAthletes("categoryLabel"),
          sportLabel: tAthletes("sportLabel"),
          sexLabel: tAthletes("sexLabel"),
          allCategories: tAthletes("allCategories"),
          allSports: tAthletes("allSports"),
          allSexes: tAthletes("allSexes"),
          sexMale: tAthletes("sexMale"),
          sexFemale: tAthletes("sexFemale"),
          empty: tAthletes("empty"),
          ranking: tAthletes("ranking"),
          singlesRanking: tAthletes("singlesRanking"),
          doublesRanking: tAthletes("doublesRanking"),
          apps: labels.apps,
        }}
      />
    </div>
  );
}
