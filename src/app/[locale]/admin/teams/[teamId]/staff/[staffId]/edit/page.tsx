import { prisma } from "@/lib/prisma";
import { updateStaffAction, deleteStaffAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminImageUrlField } from "@/components/admin/image-url-field";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string; staffId: string }>;
};

export default async function EditStaffPage({ params }: Props) {
  const { locale, teamId, staffId } = await params;
  const t = await getTranslations("admin");
  const ui =
    locale === "fr"
      ? {
          title: "Modifier staff",
          name: "Nom",
          role: "Rôle",
          image: "Photo du staff",
          save: "Enregistrer",
          remove: "Supprimer",
          help: "Optionnel. Collez un chemin local ou une URL d'image externe.",
          empty: "Aucune photo pour le moment.",
        }
      : locale === "ar"
        ? {
            title: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0625\u0637\u0627\u0631",
            name: "\u0627\u0644\u0627\u0633\u0645",
            role: "\u0627\u0644\u062F\u0648\u0631",
            image: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0625\u0637\u0627\u0631",
            save: "\u062D\u0641\u0638",
            remove: "\u062D\u0630\u0641",
            help: "\u0627\u062E\u062A\u064A\u0627\u0631\u064A. \u0627\u0644\u0635\u0642 \u0645\u0633\u0627\u0631\u0627\u064B \u0645\u062D\u0644\u064A\u0627\u064B \u0623\u0648 \u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 \u062E\u0627\u0631\u062C\u064A\u0629.",
            empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.",
          }
        : {
            title: "Edit staff",
            name: "Name",
            role: "Role",
            image: "Staff photo",
            save: "Save",
            remove: "Delete",
            help: "Optional. Paste a local path or external image URL.",
            empty: "No image set yet.",
          };

  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff || staff.teamId !== teamId) notFound();

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">
        {t("teams")} - {ui.title}
      </h1>

      <form action={updateStaffAction} encType="multipart/form-data" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={staff.id} />
        <input type="hidden" name="teamId" value={teamId} />

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.name}</span>
          <input
            name="name"
            required
            defaultValue={staff.name}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.role}</span>
          <input
            name="role"
            required
            defaultValue={staff.role}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <AdminImageUrlField
          label={ui.image}
          name="imageUrl"
          defaultValue={staff.imageUrl}
          placeholder=""
          emptyText={ui.empty}
          previewAlt={`${staff.name} photo preview`}
          helpText={ui.help}
        />

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {ui.save}
        </button>
      </form>

      <form action={deleteStaffAction} encType="multipart/form-data" className="mt-8">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="teamId" value={teamId} />
        <input type="hidden" name="id" value={staff.id} />
        <button
          type="submit"
          className="border-border hover:border-primary rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          {ui.remove}
        </button>
      </form>
    </div>
  );
}
