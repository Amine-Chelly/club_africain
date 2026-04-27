import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { localizeSport } from "@/lib/db-visual-labels";
import { upsertClubVenueAction } from "@/lib/admin/club-actions";
import { notFound } from "next/navigation";
import { Sport } from "@/generated/prisma/enums";
import { VenueImagesEditor } from "@/components/admin/venue-images-editor";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; sport: string }> };

export default async function AdminClubVenuePage({ params }: Props) {
  const { locale, sport } = await params;
  if (!Object.values(Sport).includes(sport as Sport)) notFound();

  const existing = await prisma.clubVenue.findUnique({
    where: { sport: sport as Sport },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-foreground text-2xl font-bold">
          {localizeSport(sport, locale)} — Enceinte / Stade
        </h1>
        <Link href={`/admin/club`} className="text-muted text-sm underline">← Retour</Link>
      </div>

      <form action={upsertClubVenueAction} encType="multipart/form-data" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="sport" value={sport} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Nom de l&apos;enceinte</span>
            <input name="name" required defaultValue={existing?.name ?? ""}
              className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Ville</span>
            <input name="city" required defaultValue={existing?.city ?? ""}
              className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2" />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>Capacité (optionnel)</span>
          <input name="capacity" type="number" min={0} defaultValue={existing?.capacity ?? ""}
            className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 max-w-xs" />
        </label>

        {existing ? (
          <VenueImagesEditor
            venueId={existing.id}
            initialImages={(existing.images ?? []).map((img) => ({
              id: img.id,
              url: img.url,
              isCover: img.isCover,
            }))}
          />
        ) : (
          <p className="text-muted text-sm italic">
            Enregistrez d&apos;abord les informations du stade pour pouvoir ajouter des photos.
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span>Notes / description (optionnel)</span>
          <textarea name="notes" rows={4} defaultValue={existing?.notes ?? ""}
            className="border-border bg-background text-foreground focus-visible:ring-ring rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2" />
        </label>

        <button type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
