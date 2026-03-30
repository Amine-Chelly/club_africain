import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("teams");

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      players: { orderBy: { name: "asc" } },
      staff: { orderBy: { name: "asc" } },
      fixtures: {
        orderBy: { kickoffAt: "desc" },
        take: 8,
        include: { matchday: true },
      },
    },
  });

  if (!team) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-foreground text-3xl font-bold">{team.name}</h1>
      <p className="text-muted mt-2">
        {team.sport} · {team.category} · {team.ageGroup}
      </p>
      {team.description && <p className="text-muted mt-6 max-w-3xl leading-relaxed">{team.description}</p>}

      <section className="mt-12">
        <h2 className="text-foreground text-xl font-semibold">{t("squad")}</h2>
        <ul className="border-border mt-4 divide-y rounded-lg border">
          {team.players.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span className="text-foreground font-medium">{p.name}</span>
              <span className="text-muted">
                {p.position ?? "—"} {p.number != null ? `· #${p.number}` : ""}
              </span>
            </li>
          ))}
        </ul>
        {team.players.length === 0 && <p className="text-muted mt-2 text-sm">Effectif à compléter.</p>}
      </section>

      <section className="mt-12">
        <h2 className="text-foreground text-xl font-semibold">{t("staff")}</h2>
        <ul className="border-border mt-4 divide-y rounded-lg border">
          {team.staff.map((s) => (
            <li key={s.id} className="flex justify-between gap-2 px-4 py-3 text-sm">
              <span className="text-foreground font-medium">{s.name}</span>
              <span className="text-muted">{s.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-foreground text-xl font-semibold">{t("fixtures")}</h2>
        <ul className="border-border mt-4 divide-y rounded-lg border">
          {team.fixtures.map((f) => (
            <li key={f.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span>
                  {f.matchday ? `${f.matchday.label} · ` : ""}
                  {f.isHome ? "vs" : "@"} {f.opponent}
                </span>
                <span className="text-muted">
                  {new Date(f.kickoffAt).toLocaleString()}
                </span>
              </div>
              <p className="text-muted text-xs">{f.competition} · {f.venue}</p>
              {f.homeScore != null && f.awayScore != null && (
                <p className="text-foreground mt-1 font-semibold">
                  {f.homeScore} – {f.awayScore}
                </p>
              )}
            </li>
          ))}
        </ul>
        {team.fixtures.length === 0 && (
          <p className="text-muted mt-2 text-sm">Calendrier fictif — données mock.</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-foreground text-xl font-semibold">{t("stats")}</h2>
        <p className="text-muted mt-2 text-sm">
          Totaux indicatifs :{" "}
          {team.players.reduce((s, p) => s + p.appearances, 0)} apparitions,{" "}
          {team.players.reduce((s, p) => s + p.goals, 0)} buts (mock).
        </p>
      </section>
    </div>
  );
}
