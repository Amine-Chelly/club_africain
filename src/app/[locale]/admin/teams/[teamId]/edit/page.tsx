import { prisma } from "@/lib/prisma";
import { updateTeamAction, deleteTeamAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
};

const sportOptions = [
  { value: "FOOTBALL", label: "Football" },
  { value: "HANDBALL", label: "Handball" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "VOLLEYBALL", label: "Volleyball" },
  { value: "TENNIS", label: "Tennis" },
  { value: "OTHER", label: "Autre" },
] as const;

const categoryOptions = [
  { value: "TEAM_SPORT", label: "Collectif" },
  { value: "INDIVIDUAL", label: "Individuel" },
] as const;

const ageGroupOptions = [
  { value: "U8", label: "U8" },
  { value: "U11", label: "U11" },
  { value: "U13", label: "U13" },
  { value: "U15", label: "U15" },
  { value: "U17", label: "U17" },
  { value: "U19", label: "U19" },
  { value: "U21", label: "U21" },
  { value: "U23", label: "U23" },
  { value: "SENIOR", label: "Senior" },
] as const;

export default async function EditTeamPage({ params }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");
  await auth();

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">{t("teams")}</h1>
      <p className="text-muted mt-2">Modifier une équipe</p>

      <form action={updateTeamAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={team.id} />

        <label className="flex flex-col gap-1 text-sm">
          <span>Slug</span>
          <input
            name="slug"
            required
            defaultValue={team.slug}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Nom</span>
          <input
            name="name"
            required
            defaultValue={team.name}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Sport</span>
            <select
              name="sport"
              required
              defaultValue={team.sport}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              {sportOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Catégorie</span>
            <select
              name="category"
              required
              defaultValue={team.category}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>Groupe d&apos;âge</span>
          <select
            name="ageGroup"
            required
            defaultValue={team.ageGroup}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            {ageGroupOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Description (optionnel)</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={team.description ?? ""}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Enregistrer
        </button>
      </form>

      <form
        action={deleteTeamAction}
        method="post"
        className="mt-8"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={team.id} />
        <button
          type="submit"
          className="border-border hover:border-primary rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Supprimer l&apos;équipe
        </button>
      </form>
    </div>
  );
}

