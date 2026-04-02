import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteTeamAction } from "@/lib/admin/actions";
import { localizeAgeGroup, localizeSport, localizeTeamCategory, localizeTeamGender } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminTeamsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const ui =
    locale === "fr"
      ? {
          newTeam: "Nouvelle \u00E9quipe",
          team: "\u00C9quipe",
          sport: "Sport",
          age: "\u00C2ge",
          sex: "Sexe",
          category: "Cat\u00E9gorie",
          actions: "Actions",
          edit: "Modifier",
          players: "Joueurs",
          staff: "Staff",
          delete: "Supprimer",
          empty: "Aucune \u00E9quipe - cr\u00E9ez-en une.",
        }
      : locale === "ar"
        ? {
            newTeam: "\u0641\u0631\u064A\u0642 \u062C\u062F\u064A\u062F",
            team: "\u0627\u0644\u0641\u0631\u064A\u0642",
            sport: "\u0627\u0644\u0631\u064A\u0627\u0636\u0629",
            age: "\u0627\u0644\u0639\u0645\u0631",
            sex: "\u0627\u0644\u062c\u0646\u0633",
            category: "\u0627\u0644\u0641\u0626\u0629",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            edit: "\u062A\u0639\u062F\u064A\u0644",
            players: "\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646",
            staff: "\u0627\u0644\u0625\u0637\u0627\u0631",
            delete: "\u062D\u0630\u0641",
            empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0641\u0631\u0642 - \u0623\u0646\u0634\u0626 \u0641\u0631\u064A\u0642\u0627.",
          }
        : {
            newTeam: "New team",
            team: "Team",
            sport: "Sport",
            age: "Age",
            sex: "Sex",
            category: "Category",
            actions: "Actions",
            edit: "Edit",
            players: "Players",
            staff: "Staff",
            delete: "Delete",
            empty: "No team - create one.",
          };

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
          {ui.newTeam}
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.team}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.sport}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.age}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.sex}
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.category}
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                {ui.actions}
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
                  <span className="text-muted">{localizeSport(team.sport, locale)}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{localizeAgeGroup(team.ageGroup, locale)}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{localizeTeamGender(team.gender, locale)}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{localizeTeamCategory(team.category, locale)}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link href={`/admin/teams/${team.id}/edit`} className="text-primary text-sm underline">
                      {ui.edit}
                    </Link>
                    <Link href={`/admin/teams/${team.id}/players`} className="text-primary text-sm underline">
                      {ui.players}
                    </Link>
                    <Link href={`/admin/teams/${team.id}/staff`} className="text-primary text-sm underline">
                      {ui.staff}
                    </Link>
                    <form action={deleteTeamAction} method="post" className="inline">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={team.id} />
                      <button type="submit" className="text-primary text-sm underline hover:opacity-90">
                        {ui.delete}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={6}>
                  {ui.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
