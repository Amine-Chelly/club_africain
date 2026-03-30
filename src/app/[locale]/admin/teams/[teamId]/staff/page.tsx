import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteStaffAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function TeamStaffPage({ params }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();

  const staff = await prisma.staff.findMany({
    where: { teamId },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">
          {t("teams")} — Staff
        </h1>
        <Link
          href={`/admin/teams/${teamId}/staff/new`}
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Ajouter un membre
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Nom
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Rôle
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-foreground font-medium">{s.name}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{s.role}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top text-right">
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={`/admin/teams/${teamId}/staff/${s.id}/edit`}
                      className="text-primary text-sm underline"
                    >
                      Modifier
                    </Link>
                    <form action={deleteStaffAction} method="post">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="teamId" value={teamId} />
                      <input type="hidden" name="id" value={s.id} />
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

            {staff.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={3}>
                  Aucun membre — ajoutez un coach/assistant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

