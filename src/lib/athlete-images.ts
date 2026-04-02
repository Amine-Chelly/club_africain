export const MALE_ATHLETE_IMAGE_SRC = "/players/placeholders/male.webp";
export const FEMALE_ATHLETE_IMAGE_SRC = "/players/placeholders/female.webp";

export function getAthleteImageSrc(gender: string | null | undefined) {
  return gender === "FEMALE" ? FEMALE_ATHLETE_IMAGE_SRC : MALE_ATHLETE_IMAGE_SRC;
}
