import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { createMatchdayAction } from "@/lib/admin/actions";
import { Sport } from "@/generated/prisma/enums";
import { localizeSport } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewMatchdayPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  await auth();
  const ui =
    locale === "fr"
      ? {
          back: "Retour",
          label: "Libell\u00E9",
          seasonOptional: "Saison (optionnel)",
          sportOptional: "Sport (optionnel)",
          none: "Aucun",
          create: "Cr\u00E9er la journ\u00E9e",
        }
      : locale === "ar"
        ? {
            back: "\u0631\u062C\u0648\u0639",
            label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
            seasonOptional: "\u0627\u0644\u0645\u0648\u0633\u0645 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            sportOptional: "\u0627\u0644\u0631\u064A\u0627\u0636\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            none: "\u0628\u062F\u0648\u0646",
            create: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062C\u0648\u0644\u0629",
          }
        : {
            back: "Back",
            label: "Label",
            seasonOptional: "Season (optional)",
            sportOptional: "Sport (optional)",
            none: "None",
            create: "Create matchday",
          };

  const sportValues = Object.values(Sport) as Sport[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">{t("matchdays")}</h1>
        <Link href="/admin/matchdays" className="text-muted text-sm underline">
          {ui.back}
        </Link>
      </div>

      <form action={createMatchdayAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.label}</span>
          <input
            name="label"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder="Ex: Matchday 1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.seasonOptional}</span>
          <input
            name="season"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder="Ex: 2025/2026"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.sportOptional}</span>
          <select
            name="sport"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            defaultValue=""
          >
            <option value="">{ui.none}</option>
            {sportValues.map((sport) => (
              <option key={sport} value={sport}>
                {localizeSport(sport, locale)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {ui.create}
        </button>
      </form>
    </div>
  );
}
