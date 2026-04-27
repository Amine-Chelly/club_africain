import { FixturePlayerEventType, Sport } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type DerivedFixture = {
  playerId: string | null;
  isHome: boolean;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  events: Array<{
    playerId: string;
    type: FixturePlayerEventType;
  }>;
};

type PlayerStatsInput = {
  sport: Sport;
  fixtures: DerivedFixture[];
  playerId?: string | null;
};

export function derivePlayerStats({ sport, fixtures, playerId }: PlayerStatsInput) {
  const relevantFixtureEvents = fixtures.flatMap((fixture) =>
      fixture.status === "CANCELED"
      ? []
      : fixture.events.filter((event) => event.playerId === playerId),
  );

  return {
    appearances: relevantFixtureEvents.filter((event) => event.type === FixturePlayerEventType.APPEARANCE).length,
    sportStatValue: relevantFixtureEvents.filter((event) =>
      sport === Sport.FOOTBALL ? event.type === FixturePlayerEventType.GOAL : event.type === FixturePlayerEventType.POINT,
    ).length,
  };
}

export async function syncTeamPlayerStats(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      sport: true,
      fixtures: {
        select: {
          playerId: true,
          isHome: true,
          homeScore: true,
          awayScore: true,
          status: true,
          events: {
            select: {
              playerId: true,
              type: true,
            },
          },
        },
      },
      players: {
        select: { id: true },
      },
    },
  });

  if (!team) return;

  await prisma.$transaction(
    team.players.map((player) => {
      const stats = derivePlayerStats({
        sport: team.sport,
        fixtures: team.fixtures,
        playerId: player.id,
      });

      return prisma.player.update({
        where: { id: player.id },
        data: {
          appearances: stats.appearances,
          goals: stats.sportStatValue,
        },
      });
    }),
  );
}
