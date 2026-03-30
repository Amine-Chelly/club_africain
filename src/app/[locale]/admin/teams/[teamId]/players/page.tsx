import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deletePlayerAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function TeamPlayersPage({ params }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();

  const players = await prisma.player.findMany({
    where: { teamId },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">{t("teams")} — {team.name}</h1>
        <Link
          href={`/admin/teams/${teamId}/players/new`}
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Ajouter un joueur
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Joueur
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Poste
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                # / Nation.
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Ap.
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Buts
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-foreground font-medium">{p.name}</span>
                  {p.number != null && (
                    <div className="text-muted text-xs font-mono mt-1">#{p.number}</div>
                  )}
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{p.position ?? "—"}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{p.nationality ?? "—"}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{p.appearances}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{p.goals}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={`/admin/teams/${teamId}/players/${p.id}/edit`}
                      className="text-primary text-sm underline"
                    >
                      Modifier
                    </Link>
                    <form action={deletePlayerAction} method="post">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="teamId" value={teamId} />
                      <input type="hidden" name="id" value={p.id} />
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
            {players.length === 0 && (
              <tr>
                <td
                  className="border-border border-t px-3 py-6 text-muted"
                  colSpan={6}
                >
                  Aucun joueur — ajoutez-en un.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

