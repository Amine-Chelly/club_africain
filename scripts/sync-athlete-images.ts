import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getAthleteImageSrc } from "../src/lib/athlete-images";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL required");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const players = await prisma.player.findMany({
    include: {
      team: {
        select: { gender: true },
      },
    },
  });

  for (const player of players) {
    const gender = player.team.gender ?? player.gender ?? "MALE";
    await prisma.player.update({
      where: { id: player.id },
      data: {
        gender,
        imageUrl: getAthleteImageSrc(gender),
      },
    });
  }

  console.log(`Synced ${players.length} athletes with sex-based placeholder images.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
