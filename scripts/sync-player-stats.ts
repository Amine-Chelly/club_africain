import { prisma } from "@/lib/prisma";
import { syncTeamPlayerStats } from "@/lib/player-stats";

async function main() {
  const teams = await prisma.team.findMany({ select: { id: true, name: true } });

  for (const team of teams) {
    await syncTeamPlayerStats(team.id);
    console.log(`Synced: ${team.name}`);
  }

  const activePlayers = await prisma.player.findMany({
    where: { OR: [{ appearances: { gt: 0 } }, { goals: { gt: 0 } }] },
    select: { name: true, appearances: true, goals: true },
    orderBy: { appearances: "desc" },
  });

  console.log(JSON.stringify({ syncedTeams: teams.length, activePlayers }, null, 2));
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
