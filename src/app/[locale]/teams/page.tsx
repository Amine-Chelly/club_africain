import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const t = await getTranslations("teams");
  const teams = await prisma.team.findMany({
    orderBy: [{ sport: "asc" }, { ageGroup: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-foreground text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Sports collectifs et individuels, catégories d’âge (U8 à seniors) — aligné sur le schéma tunisien.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <li key={team.id}>
            <Link
              href={`/teams/${team.slug}`}
              className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring block rounded-xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              <p className="text-foreground font-semibold">{team.name}</p>
              <p className="text-muted text-sm">
                {team.sport} · {team.ageGroup}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {teams.length === 0 && (
        <p className="text-muted mt-8">Aucune équipe en base — lancez le seed Prisma.</p>
      )}
    </div>
  );
}
