import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

function normalizeLabel(label: string) {
  const clean = label.trim();
  const lower = clean.toLowerCase();
  const numberMatch = clean.match(/(\d+)/);
  const number = numberMatch ? numberMatch[1] : null;

  if (lower.includes("journee") || lower.includes("journée") || lower.includes("matchay")) {
    return number ? `Matchday ${number}` : "Matchday";
  }

  return clean;
}

async function main() {
  const all = await prisma.matchday.findMany({
    include: { _count: { select: { fixtures: true } } },
    orderBy: { createdAt: "asc" },
  });

  for (const row of all) {
    const target = normalizeLabel(row.label);
    if (target === row.label) continue;

    const conflict = await prisma.matchday.findFirst({
      where: {
        id: { not: row.id },
        label: target,
        season: row.season,
        sport: row.sport,
      },
      select: { id: true, _count: { select: { fixtures: true } } },
    });

    // If normalized row already exists, merge fixtures and remove duplicate.
    if (conflict) {
      if (row._count.fixtures > 0) {
        await prisma.fixture.updateMany({
          where: { matchdayId: row.id },
          data: { matchdayId: conflict.id },
        });
      }
      await prisma.matchday.delete({ where: { id: row.id } });
      continue;
    }

    await prisma.matchday.update({
      where: { id: row.id },
      data: { label: target },
    });
  }

  const after = await prisma.matchday.findMany({
    select: { label: true, season: true, sport: true, _count: { select: { fixtures: true } } },
    orderBy: [{ sport: "asc" }, { season: "asc" }, { label: "asc" }],
  });

  console.log("Normalized matchday labels:");
  for (const row of after) {
    console.log(`${row.label} | ${row.season ?? "-"} | ${row.sport ?? "-"} | fixtures=${row._count.fixtures}`);
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
