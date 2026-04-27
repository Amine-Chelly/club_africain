import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { deleteFixtureAction, deleteMatchdayAction, updateMatchdayAction } from "@/lib/admin/actions";
import { AgeGroup, Sport, TeamCategory, FixtureStatus } from "@/generated/prisma/enums";
import { notFound } from "next/navigation";
import { formatDateTime } from "@/lib/date-format";
import {
  localizeAgeGroup,
  localizeFixtureStatus,
  localizeMatchdayLabel,
  localizeSport,
  localizeTournamentCategory,
  localizeTeamCategory,
} from "@/lib/db-visual-labels";
import { getSportImageSrc } from "@/lib/sport-images";
import { AdminImageUrlField } from "@/components/admin/image-url-field";
import { MatchdayTypeFields } from "@/components/admin/matchday-type-fields";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; matchdayId: string }>;
  searchParams?: Promise<{
    q?: string;
    category?: string;
    ageGroup?: string;
    status?: string;
  }>;
};

export default async function MatchdayDetailPage({ params, searchParams }: Props) {
  const { locale, matchdayId } = await params;
  const t = await getTranslations("admin");
  const ui =
    locale === "fr"
      ? {
          sport: "Sport",
          matches: "matchs",
          back: "Retour",
          editMatchday: "Modifier la journ\u00E9e",
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
          imageEmpty: "Aucune photo pour le moment.",
          save: "Enregistrer",
          deleteMatchday: "Supprimer cette journ\u00E9e",
          addFixture: "Ajouter un match",
          searchFixture: "Rechercher un match...",
          allCategories: "Toutes les cat\u00E9gories",
          allAgeGroups: "Toutes les tranches d'\u00E2ge",
          allStatuses: "Tous les statuts",
          filter: "Filtrer",
          reset: "R\u00E9initialiser",
          team: "\u00C9quipe",
          category: "Cat\u00E9gorie",
          opponent: "Adversaire",
          date: "Date",
          competition: "Comp\u00E9tition",
          actions: "Actions",
          edit: "Modifier",
          delete: "Supprimer",
          noMatch: "Aucun match ne correspond aux filtres.",
        }
      : locale === "ar"
        ? {
            sport: "\u0627\u0644\u0631\u064A\u0627\u0636\u0629",
            matches: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A",
            back: "\u0631\u062C\u0648\u0639",
            editMatchday: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062C\u0648\u0644\u0629",
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
            imageEmpty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.",
            save: "\u062D\u0641\u0638",
            deleteMatchday: "\u062D\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u062C\u0648\u0644\u0629",
            addFixture: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0628\u0627\u0631\u0627\u0629",
            searchFixture: "\u0628\u062D\u062B \u0639\u0646 \u0645\u0628\u0627\u0631\u0627\u0629...",
            allCategories: "\u0643\u0644 \u0627\u0644\u0641\u0626\u0627\u062A",
            allAgeGroups: "\u0643\u0644 \u0627\u0644\u0623\u0639\u0645\u0627\u0631",
            allStatuses: "\u0643\u0644 \u0627\u0644\u062D\u0627\u0644\u0627\u062A",
            filter: "\u062A\u0635\u0641\u064A\u0629",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            team: "\u0627\u0644\u0641\u0631\u064A\u0642",
            category: "\u0627\u0644\u0641\u0626\u0629",
            opponent: "\u0627\u0644\u0645\u0646\u0627\u0641\u0633",
            date: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E",
            competition: "\u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            edit: "\u062A\u0639\u062F\u064A\u0644",
            delete: "\u062D\u0630\u0641",
            noMatch: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0641\u0644\u0627\u062A\u0631.",
          }
        : {
            sport: "Sport",
            matches: "matches",
            back: "Back",
            editMatchday: "Edit matchday",
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
            imageEmpty: "No image set yet.",
            save: "Save",
            deleteMatchday: "Delete this matchday",
            addFixture: "Add fixture",
            searchFixture: "Search fixture...",
            allCategories: "All categories",
            allAgeGroups: "All age groups",
            allStatuses: "All statuses",
            filter: "Filter",
            reset: "Reset",
            team: "Team",
            category: "Category",
            opponent: "Opponent",
            date: "Date",
            competition: "Competition",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            noMatch: "No fixture matches your filters.",
          };

  const sp = await (searchParams ??
    Promise.resolve({} as { q?: string; category?: string; ageGroup?: string; status?: string }));
  const q = (sp.q ?? "").trim();

  const categoryValues = Object.values(TeamCategory) as TeamCategory[];
  const ageGroupValues = Object.values(AgeGroup) as AgeGroup[];
  const selectedCategory = categoryValues.includes(sp.category as TeamCategory) ? (sp.category as TeamCategory) : "";
  const selectedAgeGroup = ageGroupValues.includes(sp.ageGroup as AgeGroup) ? (sp.ageGroup as AgeGroup) : "";
  const selectedStatus = Object.values(FixtureStatus).includes(sp.status as FixtureStatus) ? (sp.status as FixtureStatus) : undefined;

  const matchday = await prisma.matchday.findUnique({
    where: { id: matchdayId },
  });
  if (!matchday) notFound();

  const fixtures = await prisma.fixture.findMany({
    where: {
      matchdayId,
      ...(q
        ? {
            OR: [
              { opponent: { contains: q, mode: "insensitive" } },
              { competition: { contains: q, mode: "insensitive" } },
              { team: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(selectedStatus ? { status: selectedStatus } : {}),
      ...((selectedCategory || selectedAgeGroup)
        ? {
            team: {
              ...(selectedCategory ? { category: selectedCategory } : {}),
              ...(selectedAgeGroup ? { ageGroup: selectedAgeGroup } : {}),
            },
          }
        : {}),
    },
    orderBy: { kickoffAt: "desc" },
    include: { team: true, player: true },
    take: 300,
  });

  const totalFixtureCount = await prisma.fixture.count({ where: { matchdayId } });
  const sportValues = Object.values(Sport) as Sport[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold">
            {localizeMatchdayLabel(matchday.label, locale)}{" "}
            <span className="text-muted text-sm font-normal">({matchday.season ?? "-"})</span>
          </h1>
          <p className="text-muted text-sm">
            {ui.sport}: {localizeSport(matchday.sport, locale)} | {fixtures.length}/{totalFixtureCount} {ui.matches}
          </p>
        </div>
        <Link href="/admin/matchdays" className="text-muted text-sm underline">
          {ui.back}
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-foreground text-xl font-semibold">{ui.editMatchday}</h2>

          <form action={updateMatchdayAction} encType="multipart/form-data" className="mt-4 space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={matchday.id} />

            <label className="flex flex-col gap-1 text-sm">
              <span>{ui.label}</span>
              <input
                name="label"
                required
                defaultValue={matchday.label}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>{ui.seasonOptional}</span>
              <input
                name="season"
                defaultValue={matchday.season ?? ""}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
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
              defaultSport={matchday.sport ?? ""}
              defaultType={matchday.type}
              defaultTennisCategory={matchday.tennisCategory ?? ""}
              defaultTournamentTier={matchday.tournamentTier ?? "STANDARD"}
            />

            <AdminImageUrlField
              label={ui.image}
              name="imageUrl"
              defaultValue={matchday.imageUrl}
              placeholder=""
              emptyText={ui.imageEmpty}
              previewAlt={`${matchday.label} image preview`}
              helpText="Optional. Paste a local path or external image URL."
            />

            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {ui.save}
            </button>
          </form>

          <form action={deleteMatchdayAction} encType="multipart/form-data" className="mt-8">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={matchday.id} />
            <button
              type="submit"
              className="border-border hover:border-primary rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ui.deleteMatchday}
            </button>
          </form>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-foreground text-xl font-semibold">{t("fixtures")}</h2>
            <Link
              href={`/admin/matchdays/${matchdayId}/fixtures/new`}
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {ui.addFixture}
            </Link>
          </div>

          <form
            method="get"
            className="mt-4 grid gap-3 rounded-xl border-border border bg-card p-3 md:grid-cols-[1fr_180px_160px_160px_auto]"
          >
            <input
              name="q"
              defaultValue={q}
              placeholder={ui.searchFixture}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />

            <select
              name="category"
              defaultValue={selectedCategory}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="">{ui.allCategories}</option>
              {categoryValues.map((c) => (
                <option key={c} value={c}>
                  {localizeTeamCategory(c, locale)}
                </option>
              ))}
            </select>

            <select
              name="ageGroup"
              defaultValue={selectedAgeGroup}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="">{ui.allAgeGroups}</option>
              {ageGroupValues.map((a) => (
                <option key={a} value={a}>
                  {localizeAgeGroup(a, locale)}
                </option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={selectedStatus}
              className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="">{ui.allStatuses}</option>
          <option value="SCHEDULED">{localizeFixtureStatus("SCHEDULED", locale)}</option>
          <option value="LIVE">{localizeFixtureStatus("LIVE", locale)}</option>
          <option value="FINISHED">{localizeFixtureStatus("FINISHED", locale)}</option>
          <option value="CANCELED">{localizeFixtureStatus("CANCELED", locale)}</option>
            </select>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ui.filter}
              </button>
              {q || selectedCategory || selectedAgeGroup || selectedStatus ? (
                <Link href={`/admin/matchdays/${matchdayId}`} className="text-muted text-sm underline">
                  {ui.reset}
                </Link>
              ) : null}
            </div>
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    {ui.team}
                  </th>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    {ui.category}
                  </th>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    {ui.opponent}
                  </th>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    {ui.date}
                  </th>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    {ui.competition}
                  </th>
                  <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">
                    {ui.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {fixtures.map((fixture) => (
                  <tr key={fixture.id}>
                    <td className="border-border border-t px-3 py-3 align-top">
                      <span className="inline-flex items-center gap-2">
                        <Image
                          src={getSportImageSrc(fixture.team.sport)}
                          alt={`${localizeSport(fixture.team.sport, locale)} icon`}
                          width={18}
                          height={18}
                          className="rounded object-cover"
                        />
                        <span className="text-foreground font-medium">
                          {fixture.team.category === "INDIVIDUAL" && fixture.player ? fixture.player.name : fixture.team.name}
                        </span>
                      </span>
                      {fixture.team.category === "INDIVIDUAL" && fixture.player ? (
                        <div className="text-muted text-xs mt-1">{fixture.team.name}</div>
                      ) : null}
                      <div className="text-muted text-xs mt-1">{fixture.isHome ? "vs" : "@"}</div>
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top">
                      <div className="text-muted text-xs">{localizeTeamCategory(fixture.team.category, locale)}</div>
                      <div className="text-muted text-xs">{localizeAgeGroup(fixture.team.ageGroup, locale)}</div>
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top">
                      <span className="text-muted">{fixture.opponent}</span>
                      {fixture.homeScore != null && fixture.awayScore != null ? (
                        <div className="text-primary text-xs font-semibold mt-1">
                          {fixture.homeScore} - {fixture.awayScore}
                        </div>
                      ) : null}
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top">
                    <span className="text-muted">{formatDateTime(fixture.kickoffAt, locale)}</span>
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top">
                      <span className="text-muted">{fixture.competition}</span>
                      {matchday.tennisCategory && matchday.type === "TOURNAMENT" ? (
                        <div className="text-muted text-xs mt-1">{localizeTournamentCategory(matchday.tennisCategory, locale)}</div>
                      ) : null}
                      <div className="text-muted text-xs mt-1">{localizeFixtureStatus(fixture.status, locale)}</div>
                    </td>
                    <td className="border-border border-t px-3 py-3 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        <Link href={`/admin/matchdays/${matchdayId}/fixtures/${fixture.id}/edit`} className="text-primary text-sm underline">
                          {ui.edit}
                        </Link>
                        <form action={deleteFixtureAction} encType="multipart/form-data" className="inline">
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="matchdayId" value={matchdayId} />
                          <input type="hidden" name="id" value={fixture.id} />
                          <button type="submit" className="text-primary text-sm underline hover:opacity-90">
                            {ui.delete}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {fixtures.length === 0 && (
                  <tr>
                    <td className="border-border border-t px-3 py-6 text-muted" colSpan={6}>
                      {ui.noMatch}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
