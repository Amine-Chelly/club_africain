import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteStaffAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
  searchParams?: Promise<{ q?: string }>;
};

export default async function TeamStaffPage({ params, searchParams }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();

  const sp = await (searchParams ?? Promise.resolve({} as { q?: string }));
  const q = (sp.q ?? "").trim();

  const staff = await prisma.staff.findMany({
    where: {
      teamId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { role: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  const ui =
    locale === "fr"
      ? {
          search: "Rechercher (nom, r\u00F4le)...",
          submit: "Chercher",
          reset: "R\u00E9initialiser",
          add: "Ajouter un membre",
          name: "Nom",
          role: "R\u00F4le",
          actions: "Actions",
          edit: "Modifier",
          delete: "Supprimer",
          empty: "Aucun membre - ajoutez un coach/assistant.",
        }
      : locale === "ar"
        ? {
            search: "\u0628\u062D\u062B (\u0627\u0644\u0627\u0633\u0645، \u0627\u0644\u062F\u0648\u0631)...",
            submit: "\u0628\u062D\u062B",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            add: "\u0625\u0636\u0627\u0641\u0629 \u0639\u0636\u0648",
            name: "\u0627\u0644\u0627\u0633\u0645",
            role: "\u0627\u0644\u062F\u0648\u0631",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            edit: "\u062A\u0639\u062F\u064A\u0644",
            delete: "\u062D\u0630\u0641",
            empty: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u0639\u0636\u0627\u0621.",
          }
        : {
            search: "Search (name, role)...",
            submit: "Search",
            reset: "Reset",
            add: "Add member",
            name: "Name",
            role: "Role",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            empty: "No staff - add a coach/assistant.",
          };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">
            {t("teams")} — Staff
          </h1>
          <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_auto]">
            <input name="q" defaultValue={q} placeholder={ui.search} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2" />
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
                {ui.submit}
              </button>
              {q ? (
                <Link href={`/admin/teams/${teamId}/staff`} className="text-muted text-sm underline">
                  {ui.reset}
                </Link>
              ) : null}
            </div>
          </form>
        </div>
        <Link href={`/admin/teams/${teamId}/staff/new`} className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          {ui.add}
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.name}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.role}</th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.actions}</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex items-center gap-3">
                    {s.imageUrl ? (
                      <Image src={s.imageUrl} alt={s.name} width={40} height={40} className="h-10 w-10 rounded-full border border-border object-cover" />
                    ) : (
                      <div className="bg-muted text-muted flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold">{s.name.slice(0, 1).toUpperCase()}</div>
                    )}
                    <span className="text-foreground font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{s.role}</span></td>
                <td className="border-border border-t px-3 py-3 align-top text-right">
                  <div className="flex flex-col items-end gap-2">
                    <Link href={`/admin/teams/${teamId}/staff/${s.id}/edit`} className="text-primary text-sm underline">{ui.edit}</Link>
                    <form action={deleteStaffAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="teamId" value={teamId} />
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="text-primary text-sm underline hover:opacity-90">{ui.delete}</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {staff.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={3}>
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
