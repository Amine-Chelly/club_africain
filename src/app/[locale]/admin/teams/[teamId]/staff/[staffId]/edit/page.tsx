import { prisma } from "@/lib/prisma";
import { updateStaffAction, deleteStaffAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string; staffId: string }>;
};

export default async function EditStaffPage({ params }: Props) {
  const { locale, teamId, staffId } = await params;
  const t = await getTranslations("admin");

  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff || staff.teamId !== teamId) notFound();

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">
        {t("teams")} — Modifier staff
      </h1>

      <form action={updateStaffAction} method="post" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={staff.id} />
        <input type="hidden" name="teamId" value={teamId} />

        <label className="flex flex-col gap-1 text-sm">
          <span>Nom</span>
          <input
            name="name"
            required
            defaultValue={staff.name}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Rôle</span>
          <input
            name="role"
            required
            defaultValue={staff.role}
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

      <form action={deleteStaffAction} method="post" className="mt-8">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="teamId" value={teamId} />
        <input type="hidden" name="id" value={staff.id} />
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

