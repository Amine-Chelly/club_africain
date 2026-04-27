import { FixturePlayerEventType, Sport } from "@/generated/prisma/enums";

export type FixturePlayerScoreInput = {
  playerId: string;
  count: number;
};

export type FixturePlayerEventInput = {
  playerId: string;
  type: FixturePlayerEventType;
};

export function buildFixturePlayerEvents(
  entries: FixturePlayerScoreInput[],
  sport: Sport,
): FixturePlayerEventInput[] {
  const scoringType =
    sport === Sport.FOOTBALL ? FixturePlayerEventType.GOAL : FixturePlayerEventType.POINT;

  return entries.flatMap((entry) => [
    { playerId: entry.playerId, type: FixturePlayerEventType.APPEARANCE },
    ...Array.from({ length: entry.count }, () => ({
      playerId: entry.playerId,
      type: scoringType,
    })),
  ]);
}
