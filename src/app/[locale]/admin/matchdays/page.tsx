import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminMatchdaysPage({ params, searchParams }: Props) {
  await params;
  const t = await getTranslations("admin");

  const sp: { q?: string } = await (searchParams ?? Promise.resolve({} as { q?: string }));
  const q = (sp.q ?? "").trim();

  const matchdays = await prisma.matchday.findMany({
    where: q
      ? {
          OR: [
            { label: { contains: q, mode: "insensitive" } },
            { season: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { fixtures: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">{t("matchdays")}</h1>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher…"
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Chercher
            </button>
            {q ? (
              <Link href="/admin/matchdays" className="text-muted text-sm underline">
                Réinitialiser
              </Link>
            ) : null}
          </form>
        </div>

        <Link
          href="/admin/matchdays/new"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Nouvelle journée
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Journée
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Sport
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Saison
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Matchs
              </th>
            </tr>
          </thead>
          <tbody>
            {matchdays.map((m) => (
              <tr key={m.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <Link href={`/admin/matchdays/${m.id}`} className="text-primary text-sm underline">
                    {m.label}
                  </Link>
                  <div className="text-muted text-xs font-mono mt-1">{m.id}</div>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{m.sport ?? "—"}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{m.season ?? "—"}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top text-right">
                  <span className="text-muted">{m._count.fixtures}</span>
                </td>
              </tr>
            ))}
            {matchdays.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={4}>
                  Aucune journée — créez-en une.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

