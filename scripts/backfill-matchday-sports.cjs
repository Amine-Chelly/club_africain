/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../src/generated/prisma/client");

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const matchdays = await prisma.matchday.findMany({
    select: {
      id: true,
      label: true,
      sport: true,
      fixtures: {
        select: {
          team: {
            select: { sport: true },
          },
        },
      },
    },
  });

  const updates = [];
  const conflicts = [];

  for (const matchday of matchdays) {
    if (matchday.sport) continue;

    const sports = Array.from(new Set(matchday.fixtures.map((fixture) => fixture.team.sport)));
    if (sports.length === 1) {
      updates.push(
        prisma.matchday.update({
          where: { id: matchday.id },
          data: { sport: sports[0] },
        }),
      );
    } else if (sports.length > 1) {
      conflicts.push({ id: matchday.id, label: matchday.label, sports });
    }
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  console.log(
    JSON.stringify(
      {
        updatedMatchdays: updates.length,
        conflicts,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
