import { createPlayerAction } from "@/lib/admin/actions";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function NewPlayerPage({ params }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");
  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { sport: true, gender: true } });
  if (!team) notFound();
  const isTennis = team.sport === "TENNIS";
  const labelSinglesRanking = "Singles ranking (optionnel)";
  const labelDoublesRanking = "Doubles ranking (optionnel)";

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">{t("teams")} - Nouveau joueur</h1>
      <p className="text-muted mt-2">Ajout dans l&apos;equipe</p>

      <form action={createPlayerAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="teamId" value={teamId} />

        <label className="flex flex-col gap-1 text-sm">
          <span>Nom</span>
          <input
            name="name"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Numero (optionnel)</span>
            <input
              name="number"
              type="number"
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Nationalite (optionnel)</span>
            <input
              name="nationality"
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              placeholder="TN"
              maxLength={3}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Genre (optionnel)</span>
            <select
              name="gender"
              required
              defaultValue={team.gender}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </label>

          {!isTennis ? (
            <label className="flex flex-col gap-1 text-sm">
              <span>Ranking (optionnel)</span>
              <input
                name="ranking"
                type="number"
                min={1}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              />
            </label>
          ) : (
            <div />
          )}
        </div>

        {isTennis ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span>{labelSinglesRanking}</span>
              <input
                name="singlesRanking"
                type="number"
                min={1}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>{labelDoublesRanking}</span>
              <input
                name="doublesRanking"
                type="number"
                min={1}
                className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              />
            </label>
          </div>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span>Photo URL (optionnel)</span>
          <input
            name="imageUrl"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder="/players/placeholders/male.webp"
            maxLength={2000}
          />
        </label>

        {!isTennis ? (
          <label className="flex flex-col gap-1 text-sm">
            <span>Poste (optionnel)</span>
            <input
              name="position"
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              placeholder="Attaquant"
              maxLength={60}
            />
          </label>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Apparitions</span>
            <input
              name="appearances"
              type="number"
              required
              defaultValue={0}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Buts/Points</span>
            <input
              name="goals"
              type="number"
              required
              defaultValue={0}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
