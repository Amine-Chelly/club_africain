import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getAthleteImageSrc } from "../src/lib/athlete-images";
import { buildAthleteName } from "../src/lib/athlete-names";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL required");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const players = await prisma.player.findMany({
    include: {
      team: {
        select: { gender: true, name: true },
      },
    },
    orderBy: [{ team: { name: "asc" } }, { number: "asc" }, { name: "asc" }, { id: "asc" }],
  });

  const grouped = new Map<string, typeof players>();
  for (const player of players) {
    const roster = grouped.get(player.team.name) ?? [];
    roster.push(player);
    grouped.set(player.team.name, roster);
  }

  for (const [teamName, roster] of grouped.entries()) {
    for (const [index, player] of roster.entries()) {
      const gender = player.team.gender ?? player.gender ?? "MALE";
      await prisma.player.update({
        where: { id: player.id },
        data: {
          gender,
          name: buildAthleteName(index, gender, teamName),
          imageUrl: getAthleteImageSrc(gender),
        },
      });
    }
  }

  console.log(`Synced ${players.length} athletes with sex-based placeholder images and names.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
