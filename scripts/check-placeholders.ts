import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const [teams, players, fixtures, products] = await Promise.all([
    prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: "mock", mode: "insensitive" } },
          { description: { contains: "mock", mode: "insensitive" } },
          { description: { contains: "fictif", mode: "insensitive" } },
        ],
      },
      select: { id: true, slug: true, name: true },
    }),
    prisma.player.findMany({
      where: {
        OR: [
          { name: { contains: "joueur", mode: "insensitive" } },
          { name: { contains: "player", mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, teamId: true },
    }),
    prisma.fixture.findMany({
      where: {
        OR: [
          { opponent: { contains: "adversaire", mode: "insensitive" } },
          { competition: { contains: "mock", mode: "insensitive" } },
        ],
      },
      select: { id: true, opponent: true, competition: true, teamId: true },
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { slug: "maillot-domicile" },
          { slug: "echarpe" },
          { name: { contains: "mock", mode: "insensitive" } },
          { description: { contains: "mock", mode: "insensitive" } },
        ],
      },
      select: { id: true, slug: true, name: true },
    }),
  ]);

  console.log(
    JSON.stringify(
      {
        teams,
        players,
        fixtures,
        products,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
