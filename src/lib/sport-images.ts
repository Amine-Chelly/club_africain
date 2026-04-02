export const sportImageSrc: Record<string, string> = {
  FOOTBALL: "/sports/football.avif",
  HANDBALL: "/sports/handball.avif",
  BASKETBALL: "/sports/basketball.avif",
  VOLLEYBALL: "/sports/volleyball.avif",
  TENNIS: "/sports/tennis.avif",
  OTHER: "/sports/football.avif",
};

export function getSportImageSrc(sport: string | null | undefined) {
  if (!sport) return sportImageSrc.OTHER;
  return sportImageSrc[sport] ?? sportImageSrc.OTHER;
}

