import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { deleteNewsletterSubscriberAction } from "@/lib/admin/actions";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
    localeFilter?: string;
  }>;
};

const localeValues = ["fr", "en", "ar"] as const;

export default async function AdminNewslettersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const sp = await (searchParams ?? Promise.resolve({} as { q?: string; localeFilter?: string }));
  const q = (sp.q ?? "").trim();
  const selectedLocale = localeValues.includes(sp.localeFilter as (typeof localeValues)[number]) ? (sp.localeFilter as (typeof localeValues)[number]) : "";

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: {
      ...(q
        ? {
            email: { contains: q, mode: "insensitive" },
          }
        : {}),
      ...(selectedLocale ? { locale: selectedLocale } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const ui =
    locale === "fr"
      ? {
          search: "Rechercher (email)...",
          submit: "Chercher",
          reset: "R\u00E9initialiser",
          localeAll: "Toutes les langues",
          newSubscriber: "Abonn\u00E9s",
          email: "Email",
          localeLabel: "Langue",
          date: "Inscrit le",
          actions: "Actions",
          delete: "Supprimer",
          empty: "Aucun abonn\u00E9.",
        }
      : locale === "ar"
        ? {
            search: "\u0628\u062D\u062B (\u0627\u0644\u0628\u0631\u064A\u062F)...",
            submit: "\u0628\u062D\u062B",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            localeAll: "\u0643\u0644 \u0627\u0644\u0644\u063A\u0627\u062A",
            newSubscriber: "\u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0648\u0646",
            email: "\u0627\u0644\u0628\u0631\u064A\u062F",
            localeLabel: "\u0627\u0644\u0644\u063A\u0629",
            date: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0644\u062A\u062D\u0627\u0642",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            delete: "\u062D\u0630\u0641",
            empty: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0634\u062A\u0631\u0643\u0648\u0646.",
          }
        : {
            search: "Search (email)...",
            submit: "Search",
            reset: "Reset",
            localeAll: "All locales",
            newSubscriber: "Subscribers",
            email: "Email",
            localeLabel: "Locale",
            date: "Signed up",
            actions: "Actions",
            delete: "Delete",
            empty: "No subscriber.",
          };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">{t("newsletters")}</h1>
          <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_180px_auto]">
            <input name="q" defaultValue={q} placeholder={ui.search} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2" />
            <select name="localeFilter" defaultValue={selectedLocale} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.localeAll}</option>
              {localeValues.map((value) => (
                <option key={value} value={value}>
                  {value.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
                {ui.submit}
              </button>
              {q || selectedLocale ? (
                <Link href="/admin/newsletters" className="text-muted text-sm underline">
                  {ui.reset}
                </Link>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.email}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.localeLabel}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.date}</th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.actions}</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-foreground font-medium">{s.email}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{s.locale}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{s.createdAt.toISOString().slice(0, 10)}</span></td>
                <td className="border-border border-t px-3 py-3 align-top text-right">
                  <form action={deleteNewsletterSubscriberAction} className="inline">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-primary text-sm underline hover:opacity-90">
                      {ui.delete}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={4}>
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
