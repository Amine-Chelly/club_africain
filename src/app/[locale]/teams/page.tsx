import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { localizeAgeGroup, localizeSport, localizeTeamGender, shortLabels } from "@/lib/db-visual-labels";
import { getSportImageSrc } from "@/lib/sport-images";
import { TeamCategory } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function TeamsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("teams");
  const labels = shortLabels(locale);
  const teams = await prisma.team.findMany({
    where: { category: TeamCategory.TEAM_SPORT },
    include: {
      _count: {
        select: { players: true, staff: true, fixtures: true },
      },
    },
    orderBy: [{ sport: "asc" }, { ageGroup: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <section className="border-border bg-card rounded-3xl border p-6 sm:p-8">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted mt-3 max-w-3xl leading-relaxed">{t("intro")}</p>
      </section>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <li key={team.id}>
            <Link
              href={`/teams/${team.slug}`}
              className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring block overflow-hidden rounded-2xl border transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={getSportImageSrc(team.sport)}
                  alt={`${localizeSport(team.sport, locale)} team`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <p className="text-foreground text-lg font-semibold">{team.name}</p>
                <p className="text-muted mt-1 text-sm">
                  {localizeSport(team.sport, locale)} - {localizeTeamGender(team.gender, locale)} -{" "}
                  {localizeAgeGroup(team.ageGroup, locale)}
                </p>
                {team.description && <p className="text-muted mt-3 text-sm leading-relaxed">{team.description}</p>}
                <div className="text-muted mt-4 flex flex-wrap gap-3 text-xs">
                  <span>{team._count.players} {labels.players}</span>
                  <span>{team._count.staff} {labels.staff}</span>
                  <span>{team._count.fixtures} {labels.fixtures}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {teams.length === 0 && <p className="text-muted mt-8">{t("empty")}</p>}
    </div>
  );
}
