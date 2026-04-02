import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

function teamScore(fixture: { isHome: boolean; homeScore: number | null; awayScore: number | null }) {
  return fixture.isHome ? (fixture.homeScore ?? 0) : (fixture.awayScore ?? 0);
}

async function main() {
  const slugs = [
    "football-seniors",
    "handball-seniors",
    "basketball-seniors",
    "volleyball-seniors",
    "tennis-seniors",
  ];

  for (const slug of slugs) {
    const team = await prisma.team.findUnique({
      where: { slug },
      include: { players: true, fixtures: true },
    });
    if (!team) continue;

    const finished = team.fixtures.filter(
      (fixture) => fixture.status === "FINISHED" && fixture.homeScore != null && fixture.awayScore != null,
    );
    const fixtureMetric = finished.reduce((sum, fixture) => sum + teamScore(fixture), 0);
    const playerMetric = team.players.reduce((sum, player) => sum + player.goals, 0);

    console.log(
      `${team.sport} | ${team.name} | finishedMetric=${fixtureMetric} | playerMetric=${playerMetric} | finishedMatches=${finished.length}`,
    );
    console.log(
      finished
        .map((fixture) => `${fixture.isHome ? "H" : "A"}:${fixture.homeScore}-${fixture.awayScore}`)
        .join(" | "),
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
