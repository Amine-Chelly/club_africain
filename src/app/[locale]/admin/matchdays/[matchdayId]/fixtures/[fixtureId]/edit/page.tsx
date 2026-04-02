import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteFixtureAction, updateFixtureAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";
import { localizeMatchdayLabel, localizeSport } from "@/lib/db-visual-labels";

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
          tournamentCategory: "Cat\u00E9gorie tournoi (tennis)",
          tournamentTier: "Niveau tournoi",
          playerOptional: "Joueur (tennis optionnel)",
          itf: "ITF",
          atp: "ATP",
          wta: "WTA",
          standard: "Standard",
          grandSlam: "Grand Chelem",
          homeScore: "Score domicile (optionnel)",
          awayScore: "Score ext\u00E9rieur (optionnel)",
          status: "Statut (optionnel)",
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
            tournamentCategory: "\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0628\u0637\u0648\u0644\u0629 (\u062A\u0646\u0633)",
            tournamentTier: "\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0628\u0637\u0648\u0644\u0629",
            playerOptional: "\u0627\u0644\u0644\u0627\u0639\u0628 (\u062A\u0646\u0633 \u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            itf: "ITF",
            atp: "ATP",
            wta: "WTA",
            standard: "\u0639\u0627\u062F\u064A",
            grandSlam: "\u062C\u0631\u0627\u0646\u062F \u0633\u0644\u0627\u0645",
            homeScore: "\u0646\u062A\u064A\u062C\u0629 \u0635\u0627\u062D\u0628 \u0627\u0644\u0623\u0631\u0636 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            awayScore: "\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0636\u064A\u0641 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
            status: "\u0627\u0644\u062D\u0627\u0644\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
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
            tournamentCategory: "Tournament category (tennis)",
            tournamentTier: "Tournament tier",
            playerOptional: "Player (tennis optional)",
            itf: "ITF",
            atp: "ATP",
            wta: "WTA",
            standard: "Standard",
            grandSlam: "Grand Slam",
            homeScore: "Home score (optional)",
            awayScore: "Away score (optional)",
            status: "Status (optional)",
            save: "Save",
            deleteFixture: "Delete fixture",
          };

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { team: true, matchday: true, player: true },
  });
  if (!fixture || fixture.matchdayId !== matchdayId) notFound();

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const players = await prisma.player.findMany({
    include: { team: true },
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
  });

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

      <form action={updateFixtureAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={fixture.id} />
        <input type="hidden" name="matchdayId" value={matchdayId} />

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.team}</span>
          <select
            name="teamId"
            required
            defaultValue={fixture.teamId}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({localizeSport(team.sport, locale)})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.playerOptional}</span>
          <select
            name="playerId"
            defaultValue={fixture.playerId ?? ""}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="">-</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.team.name})
              </option>
            ))}
          </select>
        </label>

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

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.tournamentCategory}</span>
          <select
            name="tournamentCategory"
            defaultValue={fixture.tournamentCategory ?? ""}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="">-</option>
            <option value="ITF">{ui.itf}</option>
            <option value="ATP">{ui.atp}</option>
            <option value="WTA">{ui.wta}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.tournamentTier}</span>
          <select
            name="tournamentTier"
            defaultValue={fixture.tournamentTier}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            <option value="STANDARD">{ui.standard}</option>
            <option value="GRAND_SLAM">{ui.grandSlam}</option>
          </select>
        </label>

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
          <input
            name="status"
            defaultValue={fixture.status ?? ""}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {ui.save}
        </button>
      </form>

      <form action={deleteFixtureAction} method="post" className="mt-8">
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
