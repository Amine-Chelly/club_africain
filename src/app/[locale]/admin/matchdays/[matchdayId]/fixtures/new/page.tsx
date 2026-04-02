import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createFixtureAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";
import { localizeMatchdayLabel, localizeSport } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; matchdayId: string }>;
};

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

export default async function NewFixturePage({ params }: Props) {
  const { locale, matchdayId } = await params;
  const t = await getTranslations("admin");
  const ui =
    locale === "fr"
      ? {
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
          statusHint: "PROGRAMM\u00C9 / TERMIN\u00C9 / etc.",
          add: "Ajouter le match",
        }
      : locale === "ar"
        ? {
            back: "\u0631\u062c\u0648\u0639",
            team: "\u0627\u0644\u0641\u0631\u064a\u0642",
            datetime: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0648\u0627\u0644\u0648\u0642\u062a",
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
            homeScore: "\u0646\u062a\u064a\u062c\u0629 \u0635\u0627\u062d\u0628 \u0627\u0644\u0623\u0631\u0636 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
            awayScore: "\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0636\u064a\u0641 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
            status: "\u0627\u0644\u062d\u0627\u0644\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
            statusHint: "SCHEDULED / FINISHED / ...",
            add: "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629",
          }
        : {
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
            statusHint: "SCHEDULED / FINISHED / etc.",
            add: "Add fixture",
          };

  const matchday = await prisma.matchday.findUnique({ where: { id: matchdayId } });
  if (!matchday) notFound();

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const players = await prisma.player.findMany({
    include: { team: true },
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">
          {t("fixtures")} - {localizeMatchdayLabel(matchday.label, locale)}
        </h1>
        <Link href={`/admin/matchdays/${matchdayId}`} className="text-muted text-sm underline">
          {ui.back}
        </Link>
      </div>

      <form action={createFixtureAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="matchdayId" value={matchdayId} />

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.team}</span>
          <select
            name="teamId"
            required
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
            defaultValue=""
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
            defaultValue={toDatetimeLocalValue(new Date())}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.opponent}</span>
            <input
              name="opponent"
              required
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.venue}</span>
            <input
              name="venue"
              required
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="isHome" defaultChecked />
            <span>{ui.home}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.competition}</span>
            <input
              name="competition"
              required
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.tournamentCategory}</span>
          <select
            name="tournamentCategory"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            defaultValue=""
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
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            defaultValue="STANDARD"
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
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.status}</span>
          <input
            name="status"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder={ui.statusHint}
          />
        </label>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {ui.add}
        </button>
      </form>
    </div>
  );
}
