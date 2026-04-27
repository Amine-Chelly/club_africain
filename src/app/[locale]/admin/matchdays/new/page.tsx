import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { createMatchdayAction } from "@/lib/admin/actions";
import { Sport } from "@/generated/prisma/enums";
import { localizeSport } from "@/lib/db-visual-labels";
import { AdminImageUrlField } from "@/components/admin/image-url-field";
import { MatchdayTypeFields } from "@/components/admin/matchday-type-fields";

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
          type: "Type de l'\u00E9v\u00E9nement",
          league: "Championnat",
          cup: "Coupe",
          tournament: "Tournoi (tennis)",
          tournamentCategory: "Cat\u00E9gorie tournoi (optionnel)",
          tournamentTier: "Niveau tournoi",
          itf: "ITF",
          atp: "ATP",
          wta: "WTA",
          standard: "Standard",
          grandSlam: "Grand Chelem",
          none: "Aucun",
          image: "Photo de la journ\u00E9e",
          labelPlaceholder: "Ex: Matchday 1",
          seasonPlaceholder: "Ex: 2025/2026",
          imageEmpty: "Aucune photo pour le moment.",
          create: "Cr\u00E9er la journ\u00E9e",
        }
      : locale === "ar"
        ? {
            back: "\u0631\u062C\u0648\u0639",
            label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
            seasonOptional: "\u0627\u0644\u0645\u0648\u0633\u0645 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            sportOptional: "\u0627\u0644\u0631\u064A\u0627\u0636\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            type: "\u0646\u0648\u0639 \u0627\u0644\u062D\u062F\u062B",
            league: "\u0628\u0637\u0648\u0644\u0629 \u0627\u0644\u062F\u0648\u0631\u064A",
            cup: "\u0643\u0623\u0633",
            tournament: "\u062F\u0648\u0631\u0629 (\u062A\u0646\u0633)",
            tournamentCategory: "\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0628\u0637\u0648\u0644\u0629",
            tournamentTier: "\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0628\u0637\u0648\u0644\u0629",
            itf: "ITF",
            atp: "ATP",
            wta: "WTA",
            standard: "\u0639\u0627\u062F\u064A",
            grandSlam: "\u062C\u0631\u0627\u0646\u062F \u0633\u0644\u0627\u0645",
            none: "\u0628\u062F\u0648\u0646",
            image: "\u0635\u0648\u0631\u0629 \u0627\u0644\u062C\u0648\u0644\u0629",
            labelPlaceholder: "Ex: Matchday 1",
            seasonPlaceholder: "Ex: 2025/2026",
            imageEmpty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.",
            create: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062C\u0648\u0644\u0629",
          }
        : {
            back: "Back",
            label: "Label",
            seasonOptional: "Season (optional)",
            sportOptional: "Sport (optional)",
            type: "Event type",
            league: "League",
            cup: "Cup",
            tournament: "Tournament (tennis)",
            tournamentCategory: "Tournament category (optional)",
            tournamentTier: "Tournament tier",
            itf: "ITF",
            atp: "ATP",
            wta: "WTA",
            standard: "Standard",
            grandSlam: "Grand Slam",
            none: "None",
            image: "Matchday image",
            labelPlaceholder: "Ex: Matchday 1",
            seasonPlaceholder: "Ex: 2025/2026",
            imageEmpty: "No image set yet.",
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

      <form action={createMatchdayAction} encType="multipart/form-data" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.label}</span>
          <input
            name="label"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder={ui.labelPlaceholder}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.seasonOptional}</span>
          <input
            name="season"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder={ui.seasonPlaceholder}
          />
        </label>

        <MatchdayTypeFields
          sportLabel={ui.sportOptional}
          typeLabel={ui.type}
          tournamentCategoryLabel={ui.tournamentCategory}
          tournamentTierLabel={ui.tournamentTier}
          noneLabel={ui.none}
          sports={sportValues.map((s) => ({ value: s, label: localizeSport(s, locale) }))}
          types={[
            { value: "LEAGUE", label: ui.league },
            { value: "CUP", label: ui.cup },
            { value: "TOURNAMENT", label: ui.tournament },
          ]}
          tennisCategories={[
            { value: "ITF", label: ui.itf },
            { value: "ATP", label: ui.atp },
            { value: "WTA", label: ui.wta },
          ]}
          tournamentTiers={[
            { value: "STANDARD", label: ui.standard },
            { value: "GRAND_SLAM", label: ui.grandSlam },
          ]}
        />

        <AdminImageUrlField
          label={ui.image}
          name="imageUrl"
          placeholder=""
          emptyText={ui.imageEmpty}
          previewAlt="Matchday image preview"
          helpText="Optional. Paste a local path or external image URL."
        />

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
