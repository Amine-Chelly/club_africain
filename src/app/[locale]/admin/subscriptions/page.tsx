import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ q?: string }>;
};

export default async function AdminSubscriptionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const sp = await (searchParams ?? Promise.resolve({}));
  const q = (sp.q ?? "").trim();

  const subscriptions = await prisma.seasonSubscription.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { id: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const ui =
    locale === "fr"
      ? {
          search: "Rechercher (Nom)...",
          submit: "Chercher",
          fullName: "Nom complet",
          birthDate: "Date de Naissance",
          seatType: "Siège",
          seatType: "Siège",
          status: "Statut",
          date: "Date demande",
          price: "Prix (TND)",
          empty: "Aucun abonnement.",
        }
      : locale === "ar"
        ? {
            search: "بحث (الاسم)...",
            submit: "بحث",
            fullName: "الاسم الكامل",
            birthDate: "تاريخ الولادة",
            seatType: "المدرج",
            status: "الحالة",
            date: "تاريخ الطلب",
            price: "السعر (د.ت)",
            empty: "لا يوجد اشتراكات.",
          }
        : {
            search: "Search (Name)...",
            submit: "Search",
            fullName: "Full Name",
            birthDate: "Date of Birth",
            seatType: "Seat Type",
            status: "Status",
            date: "Requested at",
            price: "Price (TND)",
            empty: "No subscriptions.",
          };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">{t("subscriptions")}</h1>
        <form method="get" className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
          <input name="q" defaultValue={q} placeholder={ui.search} className="border-border bg-background rounded-md border px-3 py-1.5 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2" />
          <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-3 py-1.5 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
            {ui.submit}
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[800px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.fullName}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.seatType}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.price}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.birthDate}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.status}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.date}</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id}>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-foreground font-medium">{s.fullName}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{s.seatType}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{s.priceCents / 100}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{s.birthDate.toISOString().slice(0, 10)}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className={`text-xs px-2 py-1 rounded-full ${s.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-green-500/20 text-green-600'}`}>{s.status}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{s.createdAt.toISOString().slice(0, 10)}</span></td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
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
