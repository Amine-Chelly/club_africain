import { createStaffAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { AdminImageUrlField } from "@/components/admin/image-url-field";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function NewStaffPage({ params }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");
  const ui =
    locale === "fr"
      ? {
          title: "Ajout dans l'equipe",
          name: "Nom",
          role: "Rôle",
          rolePlaceholder: "Coach, Adjoint...",
          image: "Photo du staff",
          add: "Ajouter",
          help: "Optionnel. Collez un chemin local ou une URL d'image externe.",
          empty: "Aucune photo pour le moment.",
        }
      : locale === "ar"
        ? {
            title: "\u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0641\u0631\u064A\u0642",
            name: "\u0627\u0644\u0627\u0633\u0645",
            role: "\u0627\u0644\u062F\u0648\u0631",
            rolePlaceholder: "\u0645\u062F\u0631\u0628، \u0645\u0633\u0627\u0639\u062F...",
            image: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0625\u0637\u0627\u0631",
            add: "\u0625\u0636\u0627\u0641\u0629",
            help: "\u0627\u062E\u062A\u064A\u0627\u0631\u064A. \u0627\u0644\u0635\u0642 \u0645\u0633\u0627\u0631\u0627\u064B \u0645\u062D\u0644\u064A\u0627\u064B \u0623\u0648 \u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 \u062E\u0627\u0631\u062C\u064A\u0629.",
            empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.",
          }
        : {
            title: "Add staff member",
            name: "Name",
            role: "Role",
            rolePlaceholder: "Coach, Assistant...",
            image: "Staff photo",
            add: "Add",
            help: "Optional. Paste a local path or external image URL.",
            empty: "No image set yet.",
          };

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">
        {t("teams")} - {ui.title}
      </h1>

      <form action={createStaffAction} encType="multipart/form-data" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="teamId" value={teamId} />

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.name}</span>
          <input
            name="name"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.role}</span>
          <input
            name="role"
            required
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            placeholder={ui.rolePlaceholder}
          />
        </label>

        <AdminImageUrlField
          label={ui.image}
          name="imageUrl"
          placeholder=""
          emptyText={ui.empty}
          previewAlt="Staff photo preview"
          helpText={ui.help}
        />

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {ui.add}
        </button>
      </form>
    </div>
  );
}
