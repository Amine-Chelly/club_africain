import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { createMatchdayAction } from "@/lib/admin/actions";
import { Sport } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewMatchdayPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  await auth(); // ensure cookies loaded; protection is handled in AdminLayout

  const sportValues = Object.values(Sport) as Sport[];
  // Optional: could prefill sport from teams later, but keep it simple for MVP.

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">{t("matchdays")}</h1>
        <Link
          href="/admin/matchdays"
          className="text-muted text-sm underline"
        >
          Retour
        </Link>
      </div>

      <form action={createMatchdayAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="flex flex-col gap-1 text-sm">
          <span>Libellé</span>
          <input
            name="label"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder="Ex: Journée 1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Saison (optionnel)</span>
          <input
            name="season"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder="Ex: 2025/2026"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Sport (optionnel)</span>
          <select
            name="sport"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            defaultValue=""
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
          Créer la journée
        </button>
      </form>
    </div>
  );
}

