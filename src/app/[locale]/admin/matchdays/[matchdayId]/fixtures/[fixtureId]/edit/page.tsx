import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteFixtureAction, updateFixtureAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";
import { FixturePlayerEventType } from "@/generated/prisma/enums";
import { localizeFixtureStatus, localizeMatchdayLabel, localizeSport } from "@/lib/db-visual-labels";
import { AdminImageUrlField } from "@/components/admin/image-url-field";
import { FixtureTeamPlayerFields } from "@/components/admin/fixture-team-player-fields";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    locale: string;
    matchdayId: string;
    fixtureId: string;
  }>;
};

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

export default async function EditFixturePage({ params }: Props) {
  const { locale, matchdayId, fixtureId } = await params;
  const t = await getTranslations("admin");
  const ui =
    locale === "fr"
      ? {
          edit: "Modifier",
          back: "Retour",
          team: "\u00C9quipe",
          datetime: "Date et heure",
          opponent: "Adversaire",
          venue: "Lieu",
          home: "\u00C0 domicile (vs)",
          competition: "Comp\u00E9tition",
          homeScore: "Score domicile (optionnel)",
          awayScore: "Score ext\u00E9rieur (optionnel)",
          status: "Statut (optionnel)",
          image: "Photo du match",
          imageEmpty: "Aucune photo pour le moment.",
          fixturePlayersTitle: "Joueurs impliqu\u00E9s",
          fixturePlayersHelp:
            "Ajoutez chaque joueur ayant pris part au match. Mettez 0 pour un joueur apparu sans marquer.",
          fixturePlayersPlayer: "Joueur",
          fixturePlayersCount: "Buts / points",
          fixturePlayersAdd: "Ajouter un joueur",
          fixturePlayersRemove: "Retirer",
          fixturePlayersEmpty: "S\u00E9lectionner un joueur",
          save: "Enregistrer",
          deleteFixture: "Supprimer ce match",
        }
      : locale === "ar"
        ? {
            edit: "\u062A\u0639\u062F\u064A\u0644",
            back: "\u0631\u062C\u0648\u0639",
            team: "\u0627\u0644\u0641\u0631\u064A\u0642",
            datetime: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u0648\u0642\u062A",
            opponent: "\u0627\u0644\u0645\u0646\u0627\u0641\u0633",
            venue: "\u0627\u0644\u0645\u0644\u0639\u0628",
            home: "\u0639\u0644\u0649 \u0623\u0631\u0636\u0647 (vs)",
            competition: "\u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629",
            homeScore: "\u0646\u062A\u064A\u062C\u0629 \u0635\u0627\u062D\u0628 \u0627\u0644\u0623\u0631\u0636 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            awayScore: "\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0636\u064A\u0641 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            status: "\u0627\u0644\u062D\u0627\u0644\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            image: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629",
            imageEmpty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.",
            fixturePlayersTitle: "\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0648\u0646",
            fixturePlayersHelp:
              "\u0623\u0636\u0641 \u0643\u0644 \u0644\u0627\u0639\u0628 \u0634\u0627\u0631\u0643 \u0641\u064A \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629. \u0627\u0643\u062A\u0628 0 \u0644\u0644\u0627\u0639\u0628 \u062D\u0636\u0631 \u062F\u0648\u0646 \u062A\u0633\u062C\u064A\u0644.",
            fixturePlayersPlayer: "\u0627\u0644\u0644\u0627\u0639\u0628",
            fixturePlayersCount: "\u0627\u0644\u0623\u0647\u062F\u0627\u0641 / \u0627\u0644\u0646\u0642\u0627\u0637",
            fixturePlayersAdd: "\u0625\u0636\u0627\u0641\u0629 \u0644\u0627\u0639\u0628",
            fixturePlayersRemove: "\u0625\u0632\u0627\u0644\u0629",
            fixturePlayersEmpty: "\u0627\u062E\u062A\u0631 \u0644\u0627\u0639\u0628\u0627\u064B",
            save: "\u062D\u0641\u0638",
            deleteFixture: "\u062D\u0630\u0641 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629",
          }
        : {
            edit: "Edit",
            back: "Back",
            team: "Team",
            datetime: "Date & time",
            opponent: "Opponent",
            venue: "Venue",
            home: "Home (vs)",
            competition: "Competition",
            homeScore: "Home score (optional)",
            awayScore: "Away score (optional)",
            status: "Status (optional)",
            image: "Fixture image",
            imageEmpty: "No image set yet.",
            fixturePlayersTitle: "Players involved",
            fixturePlayersHelp:
              "Add every player who featured in the fixture. Use 0 for players who appeared without scoring.",
            fixturePlayersPlayer: "Player",
            fixturePlayersCount: "Goals / points",
            fixturePlayersAdd: "Add player",
            fixturePlayersRemove: "Remove",
            fixturePlayersEmpty: "Select a player",
            save: "Save",
            deleteFixture: "Delete fixture",
          };

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { team: true, matchday: true, player: true, events: { include: { player: true } } },
  });
  if (!fixture || fixture.matchdayId !== matchdayId) notFound();

  const teams = await prisma.team.findMany({
    where: fixture.matchday?.sport ? { OR: [{ sport: fixture.matchday.sport }, { id: fixture.teamId }] } : undefined,
    orderBy: { name: "asc" },
  });
  const players = await prisma.player.findMany({
    where: {
      OR: [
        { isActive: true },
        { fixtureEvents: { some: { fixtureId } } },
        { fixtureStats: { some: { fixtureId } } }
      ]
    },
    include: { team: true },
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
  });
  const appearancePlayers = new Set(
    fixture.events.filter((event) => event.type === FixturePlayerEventType.APPEARANCE).map((event) => event.playerId),
  );
  const scoringCounts = fixture.events
    .filter((event) => event.type !== FixturePlayerEventType.APPEARANCE)
    .reduce<Map<string, number>>((map, event) => {
      map.set(event.playerId, (map.get(event.playerId) ?? 0) + 1);
      return map;
    }, new Map());
  const defaultRows = Array.from(
    new Set([...appearancePlayers, ...Array.from(scoringCounts.keys())]),
    (playerId) => ({
      playerId,
      count: scoringCounts.get(playerId) ?? 0,
    }),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">
          {t("fixtures")} - {ui.edit}{" "}
          <span className="text-muted text-base font-normal">
            ({fixture.matchday ? localizeMatchdayLabel(fixture.matchday.label, locale) : matchdayId})
          </span>
        </h1>
        <Link href={`/admin/matchdays/${matchdayId}`} className="text-muted text-sm underline">
          {ui.back}
        </Link>
      </div>

      <form action={updateFixtureAction} encType="multipart/form-data" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={fixture.id} />
        <input type="hidden" name="matchdayId" value={matchdayId} />


        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.datetime}</span>
          <input
            name="kickoffAt"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocalValue(fixture.kickoffAt)}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.opponent}</span>
            <input
              name="opponent"
              required
              defaultValue={fixture.opponent}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.venue}</span>
            <input
              name="venue"
              required
              defaultValue={fixture.venue}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="isHome" defaultChecked={fixture.isHome} />
            <span>{ui.home}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.competition}</span>
            <input
              name="competition"
              required
              defaultValue={fixture.competition}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.homeScore}</span>
            <input
              name="homeScore"
              type="number"
              min={0}
              step={1}
              defaultValue={fixture.homeScore ?? ""}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.awayScore}</span>
            <input
              name="awayScore"
              type="number"
              min={0}
              step={1}
              defaultValue={fixture.awayScore ?? ""}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.status}</span>
          <select
            name="status"
            defaultValue={fixture.status ?? "SCHEDULED"}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="SCHEDULED">{localizeFixtureStatus("SCHEDULED", locale)}</option>
            <option value="LIVE">{localizeFixtureStatus("LIVE", locale)}</option>
            <option value="FINISHED">{localizeFixtureStatus("FINISHED", locale)}</option>
            <option value="CANCELED">{localizeFixtureStatus("CANCELED", locale)}</option>
          </select>
        </label>

        <AdminImageUrlField
          label={ui.image}
          name="imageUrl"
          defaultValue={fixture.imageUrl}
          placeholder=""
          emptyText={ui.imageEmpty}
          previewAlt={`${fixture.opponent} fixture image preview`}
          helpText="Optional. Paste a local path or external image URL."
        />

        <FixtureTeamPlayerFields
          teamLabel={ui.team}
          playerEditorTitle={ui.fixturePlayersTitle}
          playerEditorHelpText={ui.fixturePlayersHelp}
          playerLabel={ui.fixturePlayersPlayer}
          countLabel={ui.fixturePlayersCount}
          addLabel={ui.fixturePlayersAdd}
          removeLabel={ui.fixturePlayersRemove}
          emptyText={ui.fixturePlayersEmpty}
          teams={teams.map((team) => ({
            id: team.id,
            label: `${team.name} (${localizeSport(team.sport, locale)} - ${team.category} / ${team.gender} / ${team.ageGroup})`,
            sport: team.sport,
          }))}
          players={players.map((player) => ({
            id: player.id,
            name: player.name,
            teamId: player.teamId,
            teamName: player.team.name,
          }))}
          defaultTeamId={fixture.teamId}
          defaultRows={defaultRows}
        />

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {ui.save}
        </button>
      </form>

      <form action={deleteFixtureAction} encType="multipart/form-data" className="mt-8">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="matchdayId" value={matchdayId} />
        <input type="hidden" name="id" value={fixture.id} />
        <button
          type="submit"
          className="border-border hover:border-primary rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ui.deleteFixture}
        </button>
      </form>
    </div>
  );
}
