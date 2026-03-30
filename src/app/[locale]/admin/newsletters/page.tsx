import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { deleteNewsletterSubscriberAction } from "@/lib/admin/actions";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminNewslettersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");

  const sp: { q?: string } = await (searchParams ?? Promise.resolve({} as { q?: string }));
  const q = (sp.q ?? "").trim();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: q
      ? {
          email: {
            contains: q,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">{t("newsletters")}</h1>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher (email)…"
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Chercher
            </button>
            {q ? (
              <Link href="/admin/newsletters" className="text-muted text-sm underline">
                Réinitialiser
              </Link>
            ) : null}
          </form>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Email
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Locale
              </th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Inscrit le
              </th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-foreground font-medium">{s.email}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{s.locale}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{s.createdAt.toISOString().slice(0, 10)}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top text-right">
                  <form action={deleteNewsletterSubscriberAction} className="inline">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className="text-primary text-sm underline hover:opacity-90"
                    >
                      Supprimer
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={4}>
                  Aucun abonné.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

