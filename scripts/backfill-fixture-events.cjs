/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

async function main() {
  const connectionString =
    process.env.DATABASE_URL || "postgresql://postgres:admin@localhost:5432/clubafrican";
  const client = new Client({ connectionString });

  await client.connect();

  try {
    await client.query("BEGIN");

    const insertResult = await client.query(`
      WITH eligible AS (
        SELECT
          fs."fixtureId",
          fs."playerId",
          fs."count",
          t.sport
        FROM "FixturePlayerStat" fs
        JOIN "Fixture" f ON f.id = fs."fixtureId"
        JOIN "Team" t ON t.id = f."teamId"
        WHERE t.sport <> 'TENNIS'
          AND NOT EXISTS (
            SELECT 1
            FROM "FixturePlayerEvent" fe
            WHERE fe."fixtureId" = fs."fixtureId"
          )
      ),
      appearance_rows AS (
        SELECT
          concat('evt_', md5(random()::text || clock_timestamp()::text || e."fixtureId" || e."playerId")) AS id,
          e."fixtureId",
          e."playerId",
          'APPEARANCE'::"FixturePlayerEventType" AS type
        FROM eligible e
      ),
      score_rows AS (
        SELECT
          concat('evt_', md5(random()::text || clock_timestamp()::text || e."fixtureId" || e."playerId" || gs::text)) AS id,
          e."fixtureId",
          e."playerId",
          CASE WHEN e.sport = 'FOOTBALL' THEN 'GOAL' ELSE 'POINT' END::"FixturePlayerEventType" AS type
        FROM eligible e
        JOIN generate_series(1, e."count") gs ON true
      )
      INSERT INTO "FixturePlayerEvent" ("id", "fixtureId", "playerId", "type")
      SELECT id, "fixtureId", "playerId", type FROM appearance_rows
      UNION ALL
      SELECT id, "fixtureId", "playerId", type FROM score_rows;
    `);

    const deleteResult = await client.query('DELETE FROM "FixturePlayerStat";');

    await client.query("COMMIT");

    console.log(
      JSON.stringify(
        {
          backfilledEventRows: insertResult.rowCount,
          deletedLegacyRows: deleteResult.rowCount,
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
