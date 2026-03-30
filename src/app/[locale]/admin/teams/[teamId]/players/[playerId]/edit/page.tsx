import { prisma } from "@/lib/prisma";
import {
  updatePlayerAction,
  deletePlayerAction,
} from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string; playerId: string }>;
};

export default async function EditPlayerPage({ params }: Props) {
  const { locale, teamId, playerId } = await params;
  const t = await getTranslations("admin");

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player || player.teamId !== teamId) notFound();

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">
        {t("teams")} — Modifier joueur
      </h1>

      <form action={updatePlayerAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={player.id} />
        <input type="hidden" name="teamId" value={teamId} />

        <label className="flex flex-col gap-1 text-sm">
          <span>Nom</span>
          <input
            name="name"
            required
            defaultValue={player.name}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Numéro (optionnel)</span>
            <input
              name="number"
              type="number"
              defaultValue={player.number ?? ""}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Nationalité (optionnel)</span>
            <input
              name="nationality"
              defaultValue={player.nationality ?? ""}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              placeholder="TN"
              maxLength={3}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>Poste (optionnel)</span>
          <input
            name="position"
            defaultValue={player.position ?? ""}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder="Attaquant"
            maxLength={60}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Apparitions</span>
            <input
              name="appearances"
              type="number"
              required
              defaultValue={player.appearances}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Buts</span>
            <input
              name="goals"
              type="number"
              required
              defaultValue={player.goals}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Enregistrer
        </button>
      </form>

      <form action={deletePlayerAction} method="post" className="mt-8">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="teamId" value={teamId} />
        <input type="hidden" name="id" value={player.id} />
        <button
          type="submit"
          className="border-border hover:border-primary rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Supprimer
        </button>
      </form>
    </div>
  );
}

