/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

async function main() {
  const connectionString =
    process.env.DATABASE_URL || "postgresql://postgres:admin@localhost:5432/clubafrican";
  const client = new Client({ connectionString });

  await client.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Tournament" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "sport" "Sport" NOT NULL DEFAULT 'TENNIS',
        "category" "TennisTournamentCategory" NOT NULL,
        "tier" "TournamentTier" NOT NULL DEFAULT 'STANDARD',
        "createdAt" timestamp(3) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE "Fixture"
      ADD COLUMN IF NOT EXISTS "tournamentId" text;
    `);

    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE "Fixture"
        ADD CONSTRAINT "Fixture_tournamentId_fkey"
        FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "Fixture_tournamentId_idx" ON "Fixture"("tournamentId");
    `);

    const inserted = await client.query(`
      WITH tournament_rows AS (
        SELECT DISTINCT
          concat('tournament_', md5(coalesce(f."teamId", '') || '|' || coalesce(f."competition", '') || '|' || coalesce(f."tournamentCategory"::text, '') || '|' || coalesce(f."tournamentTier"::text, ''))) AS id,
          f."competition" AS name,
          COALESCE(f."tournamentCategory", 'ITF'::"TennisTournamentCategory") AS category,
          COALESCE(f."tournamentTier", 'STANDARD'::"TournamentTier") AS tier
        FROM "Fixture" f
        JOIN "Team" t ON t.id = f."teamId"
        WHERE t.sport = 'TENNIS'
      ),
      inserted_rows AS (
        INSERT INTO "Tournament" ("id", "name", "sport", "category", "tier")
        SELECT tr.id, tr.name, 'TENNIS', tr.category, tr.tier
        FROM tournament_rows tr
        WHERE NOT EXISTS (
          SELECT 1
          FROM "Tournament" existing
          WHERE existing."name" = tr.name
            AND existing."sport" = 'TENNIS'
            AND existing."category" = tr.category
            AND existing."tier" = tr.tier
        )
        RETURNING "id", "name", "category", "tier"
      )
      SELECT count(*)::int AS c FROM inserted_rows;
    `);

    await client.query(`
      WITH tennis_fixtures AS (
        SELECT
          f."id",
          f."competition",
          COALESCE(f."tournamentCategory", 'ITF'::"TennisTournamentCategory") AS category,
          COALESCE(f."tournamentTier", 'STANDARD'::"TournamentTier") AS tier
        FROM "Fixture" f
        JOIN "Team" team ON team.id = f."teamId"
        WHERE team.sport = 'TENNIS'
      )
      UPDATE "Fixture" f
      SET "tournamentId" = t."id",
          "matchdayId" = NULL
      FROM tennis_fixtures tf
      JOIN "Tournament" t
        ON t."name" = tf."competition"
       AND t."sport" = 'TENNIS'
       AND t."category" = tf.category
       AND t."tier" = tf.tier
      WHERE f."id" = tf."id";
    `);

    await client.query("COMMIT");

    console.log(
      JSON.stringify(
        {
          insertedTournamentRows: inserted.rows[0]?.c ?? 0,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
