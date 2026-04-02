import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { localizeSport, localizeTeamCategory, shortLabels } from "@/lib/db-visual-labels";
import { getSportImageSrc } from "@/lib/sport-images";
import { AthletesDirectory } from "@/components/athletes/athletes-directory";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

function getPlayerImage({
  imageUrl,
  gender,
  sport,
}: {
  imageUrl: string | null;
  gender: string | null;
  sport: string;
}) {
  if (imageUrl) return imageUrl;
  if (gender === "FEMALE") return "/players/placeholders/female.jpg";
  if (gender === "MALE") return "/players/placeholders/male.webp";
  return getSportImageSrc(sport);
}

function localizeSex(gender: string | null | undefined, tAthletes: Awaited<ReturnType<typeof getTranslations>>) {
  if (gender === "MALE") return tAthletes("sexMale");
  if (gender === "FEMALE") return tAthletes("sexFemale");
  return tAthletes("sexUnknown");
}

export default async function AthletesPage({ params }: Props) {
  const { locale } = await params;
  const [tAthletes, tTeams] = await Promise.all([getTranslations("athletes"), getTranslations("teams")]);
  const labels = shortLabels(locale);

  const players = await prisma.player.findMany({
    include: {
      team: {
        select: { id: true, name: true, sport: true, category: true },
      },
    },
    orderBy: [{ team: { sport: "asc" } }, { team: { name: "asc" } }, { name: "asc" }],
  });

  const athletes = players.map((player) => ({
    id: player.id,
    name: player.name,
    teamName: player.team.name,
    sport: player.team.sport,
    sportLabel: localizeSport(player.team.sport, locale),
    category: player.team.category,
    categoryLabel: localizeTeamCategory(player.team.category, locale),
    sex: player.gender ?? "UNKNOWN",
    sexLabel: localizeSex(player.gender, tAthletes),
    position: player.position ?? tTeams("unknownPosition"),
    number: player.number,
    appearances: player.appearances,
    goals: player.goals,
    singlesRanking: player.singlesRanking,
    doublesRanking: player.doublesRanking,
    ranking: player.ranking,
    imageSrc: getPlayerImage({
      imageUrl: player.imageUrl,
      gender: player.gender,
      sport: player.team.sport,
    }),
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
          empty: tAthletes("empty"),
          ranking: tAthletes("ranking"),
          singlesRanking: tAthletes("singlesRanking"),
          doublesRanking: tAthletes("doublesRanking"),
          apps: labels.apps,
          goals: tTeams("summaryGoals"),
        }}
      />
    </div>
  );
}
