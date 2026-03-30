import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  deleteFixtureAction,
  deleteMatchdayAction,
  updateMatchdayAction,
} from "@/lib/admin/actions";
import { Sport } from "@/generated/prisma/enums";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; matchdayId: string }>;
};

export default async function MatchdayDetailPage({ params }: Props) {
  const { locale, matchdayId } = await params;
  const t = await getTranslations("admin");

  const matchday = await prisma.matchday.findUnique({
    where: { id: matchdayId },
    include: {
      fixtures: {
        orderBy: { kickoffAt: "desc" },
        include: { team: true },
      },
    },
  });

  if (!matchday) notFound();

  const sportValues = Object.values(Sport) as Sport[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold">
            {matchday.label}{" "}
            <span className="text-muted text-sm font-normal">
              ({matchday.season ?? "—"})
            </span>
          </h1>
          <p className="text-muted text-sm">
            Sport: {matchday.sport ?? "—"} · {matchday.fixtures.length} match(s)
          </p>
        </div>
        <Link
          href="/admin/matchdays"
          className="text-muted text-sm underline"
        >
          Retour
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-foreground text-xl font-semibold">Modifier la journée</h2>

          <form action={updateMatchdayAction} method="post" className="mt-4 space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={matchday.id} />

            <label className="flex flex-col gap-1 text-sm">
              <span>Libellé</span>
              <input
                name="label"
                required
                defaultValue={matchday.label}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>Saison (optionnel)</span>
              <input
                name="season"
                defaultValue={matchday.season ?? ""}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>Sport (optionnel)</span>
              <select
                name="sport"
                defaultValue={matchday.sport ?? ""}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              >
                <option value="">Aucun</option>
                {sportValues.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Enregistrer
            </button>
          </form>

          <form
            action={deleteMatchdayAction}
            method="post"
            className="mt-8"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={matchday.id} />
            <button
              type="submit"
              className="border-border hover:border-primary rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Supprimer cette journée
            </button>
          </form>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-foreground text-xl font-semibold">{t("fixtures")}</h2>
            <Link
              href={`/admin/matchdays/${matchdayId}/fixtures/new`}
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Ajouter un match
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    Équipe
                  </th>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    Opposant
                  </th>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    Date
                  </th>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    Compétition
                  </th>
                  <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {matchday.fixtures.map((f) => (
                  <tr key={f.id}>
                    <td className="border-border border-t px-3 py-3 align-top">
                      <span className="text-foreground font-medium">{f.team.name}</span>
                      <div className="text-muted text-xs mt-1">
                        {f.isHome ? "vs" : "@"}
                      </div>
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top">
                      <span className="text-muted">{f.opponent}</span>
                      {f.homeScore != null && f.awayScore != null ? (
                        <div className="text-primary text-xs font-semibold mt-1">
                          {f.homeScore} – {f.awayScore}
                        </div>
                      ) : null}
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top">
                      <span className="text-muted">
                        {new Date(f.kickoffAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top">
                      <span className="text-muted">{f.competition}</span>
                      <div className="text-muted text-xs mt-1">{f.status}</div>
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        <Link
                          href={`/admin/matchdays/${matchdayId}/fixtures/${f.id}/edit`}
                          className="text-primary text-sm underline"
                        >
                          Modifier
                        </Link>
                        <form action={deleteFixtureAction} method="post" className="inline">
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="matchdayId" value={matchdayId} />
                          <input type="hidden" name="id" value={f.id} />
                          <button
                            type="submit"
                            className="text-primary text-sm underline hover:opacity-90"
                          >
                            Supprimer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {matchday.fixtures.length === 0 && (
                  <tr>
                    <td className="border-border border-t px-3 py-6 text-muted" colSpan={5}>
                      Aucun match pour cette journée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

