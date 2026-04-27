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
  await prisma.$executeRawUnsafe(`
    UPDATE "Fixture"
    SET "status" = CASE
      WHEN upper(trim("status")) = 'LIVE' THEN 'LIVE'
      WHEN upper(trim("status")) = 'FINISHED' THEN 'FINISHED'
      WHEN upper(trim("status")) IN ('CANCELLED', 'CANCELED', 'POSTPONED') THEN 'CANCELED'
      WHEN upper(trim("status")) = 'SCHEDULED' THEN 'SCHEDULED'
      ELSE 'SCHEDULED'
    END
    WHERE "status" IS NOT NULL;
  `);

  console.log(JSON.stringify({ normalizedFixtureStatuses: true }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
