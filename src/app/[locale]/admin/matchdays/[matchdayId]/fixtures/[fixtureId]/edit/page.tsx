import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  deleteFixtureAction,
  updateFixtureAction,
} from "@/lib/admin/actions";
import { notFound } from "next/navigation";

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
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditFixturePage({ params }: Props) {
  const { locale, matchdayId, fixtureId } = await params;
  const t = await getTranslations("admin");

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { team: true },
  });
  if (!fixture || fixture.matchdayId !== matchdayId) notFound();

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold">
          {t("fixtures")} — Modifier
        </h1>
        <Link
          href={`/admin/matchdays/${matchdayId}`}
          className="text-muted text-sm underline"
        >
          Retour
        </Link>
      </div>

      <form action={updateFixtureAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={fixture.id} />
        <input type="hidden" name="matchdayId" value={matchdayId} />

        <label className="flex flex-col gap-1 text-sm">
          <span>Équipe</span>
          <select
            name="teamId"
            required
            defaultValue={fixture.teamId}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.sport})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Date & heure</span>
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
            <span>Adversaire</span>
            <input
              name="opponent"
              required
              defaultValue={fixture.opponent}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Lieu</span>
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
            <span>Domicile (vs)</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Compétition</span>
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
            <span>Score domicile (optionnel)</span>
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
            <span>Score extérieur (optionnel)</span>
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
          <span>Statut (optionnel)</span>
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
          Enregistrer
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
          Supprimer ce match
        </button>
      </form>
    </div>
  );
}

