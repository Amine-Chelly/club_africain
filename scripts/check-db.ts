import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const [teams, players, staff, fixtures, products, sizeStocks, images] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.staff.count(),
    prisma.fixture.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.productSizeStock.count(),
    prisma.productImage.count(),
  ]);

  const teamRows = await prisma.team.findMany({
    orderBy: [{ sport: "asc" }, { name: "asc" }],
    select: {
      name: true,
      sport: true,
      ageGroup: true,
      _count: { select: { players: true, staff: true, fixtures: true } },
    },
  });

  console.log("COUNTS");
  console.log(JSON.stringify({ teams, players, staff, fixtures, products, sizeStocks, images }, null, 2));
  console.log("TEAMS");
  for (const t of teamRows) {
    console.log(
      `${t.sport} | ${t.name} | ${t.ageGroup} | players=${t._count.players} staff=${t._count.staff} fixtures=${t._count.fixtures}`,
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
