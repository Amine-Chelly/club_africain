import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  localizeAthleteGender,
  localizeSport,
  localizeTeamCategory,
} from "@/lib/db-visual-labels";
import { getAthleteImageSrc } from "@/lib/athlete-images";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; athleteId: string }>;
};

export default async function AthletePage({ params }: Props) {
  const { locale, athleteId } = await params;
  const [tAthletes, tTeams] = await Promise.all([getTranslations("athletes"), getTranslations("teams")]);

  const player = await prisma.player.findUnique({
    where: { id: athleteId },
    include: {
      team: {
        select: { id: true, name: true, slug: true, sport: true, category: true },
      },
    },
  });

  if (!player) notFound();

  const isTennis = player.team.sport === "TENNIS";
  const imageSrc = getAthleteImageSrc(player.gender);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/athletes" className="text-primary text-sm font-semibold underline">
          {tAthletes("backToAthletes")}
        </Link>
      </div>

      <section className="border-border bg-card overflow-hidden rounded-3xl border">
        <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
          <div className="relative min-h-[320px] bg-muted/20">
            <Image src={imageSrc} alt={player.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 340px" />
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-muted text-sm uppercase tracking-[0.2em]">{tAthletes("profileTitle")}</p>
            <h1 className="text-foreground mt-2 text-3xl font-bold">{player.name}</h1>
            <p className="text-muted mt-3 text-base">
              {localizeSport(player.team.sport, locale)} - {localizeTeamCategory(player.team.category, locale)} -{" "}
              {localizeAthleteGender(player.gender, locale)}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">{tAthletes("teamLabel")}</p>
                <p className="text-foreground mt-1 font-semibold">{player.team.name}</p>
              </div>
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">{tAthletes("sexLabel")}</p>
                <p className="text-foreground mt-1 font-semibold">{localizeAthleteGender(player.gender, locale)}</p>
              </div>
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">{tAthletes("nationalityLabel")}</p>
                <p className="text-foreground mt-1 font-semibold">{player.nationality ?? "-"}</p>
              </div>
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">{tAthletes("positionLabel")}</p>
                <p className="text-foreground mt-1 font-semibold">{isTennis ? "-" : player.position ?? tTeams("unknownPosition")}</p>
              </div>
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">{tAthletes("numberLabel")}</p>
                <p className="text-foreground mt-1 font-semibold">{player.number != null ? `#${player.number}` : "-"}</p>
              </div>
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">{tAthletes("categoryLabel")}</p>
                <p className="text-foreground mt-1 font-semibold">{localizeTeamCategory(player.team.category, locale)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">{tAthletes("appearancesLabel")}</p>
                <p className="text-foreground mt-1 text-2xl font-bold">{player.appearances}</p>
              </div>
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">{tAthletes("goalsLabel")}</p>
                <p className="text-foreground mt-1 text-2xl font-bold">{player.goals}</p>
              </div>
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">
                  {isTennis ? tAthletes("singlesRanking") : tAthletes("ranking")}
                </p>
                <p className="text-foreground mt-1 text-2xl font-bold">
                  {isTennis ? player.singlesRanking ?? "-" : player.ranking ?? "-"}
                </p>
              </div>
              <div className="border-border bg-background rounded-2xl border p-4">
                <p className="text-muted text-xs uppercase tracking-wide">
                  {isTennis ? tAthletes("doublesRanking") : tAthletes("nationalityLabel")}
                </p>
                <p className="text-foreground mt-1 text-2xl font-bold">
                  {isTennis ? player.doublesRanking ?? "-" : player.nationality ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
