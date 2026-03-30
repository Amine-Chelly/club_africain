import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteTeamAction } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminTeamsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">{t("teams")}</h1>
        <Link
          href="/admin/teams/new"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Nouvelle équipe
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Équipe
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Sport
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Âge
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Catégorie
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium">{team.name}</span>
                    <span className="text-muted text-xs mt-1 font-mono">{team.slug}</span>
                  </div>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{team.sport}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{team.ageGroup}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{team.category}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={`/admin/teams/${team.id}/edit`}
                      className="text-primary text-sm underline"
                    >
                      Modifier
                    </Link>
                    <Link
                      href={`/admin/teams/${team.id}/players`}
                      className="text-primary text-sm underline"
                    >
                      Joueurs
                    </Link>
                    <Link
                      href={`/admin/teams/${team.id}/staff`}
                      className="text-primary text-sm underline"
                    >
                      Staff
                    </Link>
                    <form action={deleteTeamAction} method="post" className="inline">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={team.id} />
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
            {teams.length === 0 && (
              <tr>
                <td
                  className="border-border border-t px-3 py-6 text-muted"
                  colSpan={5}
                >
                  Aucune équipe — créez-en une.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

