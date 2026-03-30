import { createStaffAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function NewStaffPage({ params }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">
        {t("teams")} — Nouveau staff
      </h1>
      <p className="text-muted mt-2">Ajout dans l&apos;équipe</p>

      <form action={createStaffAction} method="post" className="mt-8 space-y-4">
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

        <label className="flex flex-col gap-1 text-sm">
          <span>Rôle</span>
          <input
            name="role"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder="Coach, Adjoint..."
          />
        </label>

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

