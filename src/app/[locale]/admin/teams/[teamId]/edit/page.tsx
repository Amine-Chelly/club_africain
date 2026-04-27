import { prisma } from "@/lib/prisma";
import { updateTeamAction, deleteTeamAction } from "@/lib/admin/actions";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  localizeAgeGroup,
  localizeSport,
  localizeTeamCategory,
  localizeTeamGender,
} from "@/lib/db-visual-labels";
import { AdminImageUrlField } from "@/components/admin/image-url-field";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
};

const sportOptions = ["FOOTBALL", "HANDBALL", "BASKETBALL", "VOLLEYBALL", "TENNIS", "OTHER"] as const;
const categoryOptions = ["TEAM_SPORT", "INDIVIDUAL"] as const;
const genderOptions = ["MALE", "FEMALE"] as const;
const ageGroupOptions = ["U8", "U11", "U13", "U15", "U17", "U19", "U21", "U23", "SENIOR"] as const;

export default async function EditTeamPage({ params }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");
  await auth();
  const ui =
    locale === "fr"
      ? {
          subtitle: "Modifier l'équipe",
          slug: "Slug",
          name: "Nom",
          sport: "Sport",
          category: "Catégorie",
          sex: "Sexe",
          age: "Tranche d'âge",
          image: "Photo de l'équipe",
          imageEmpty: "Aucune photo pour le moment.",
          description: "Description (optionnelle)",
          save: "Enregistrer",
          delete: "Supprimer l'équipe",
        }
      : locale === "ar"
        ? {
            subtitle: "تعديل الفريق",
            slug: "المعرف",
            name: "الاسم",
            sport: "الرياضة",
            category: "الفئة",
            sex: "الجنس",
            age: "الفئة العمرية",
            image: "صورة الفريق",
            imageEmpty: "لا توجد صورة حالياً.",
            description: "الوصف (اختياري)",
            save: "حفظ",
            delete: "حذف الفريق",
          }
        : {
            subtitle: "Edit team",
            slug: "Slug",
            name: "Name",
            sport: "Sport",
            category: "Category",
            sex: "Sex",
            age: "Age group",
            image: "Team photo",
            imageEmpty: "No image set yet.",
            description: "Description (optional)",
            save: "Save",
            delete: "Delete team",
          };

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();

  return (
    <div>
      <h1 className="text-foreground text-3xl font-bold">{t("teams")}</h1>
      <p className="text-muted mt-2">{ui.subtitle}</p>

      <form action={updateTeamAction} encType="multipart/form-data" className="mt-8 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={team.id} />

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.slug}</span>
          <input
            name="slug"
            required
            defaultValue={team.slug}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.name}</span>
          <input
            name="name"
            required
            defaultValue={team.name}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.sport}</span>
            <select
              name="sport"
              required
              defaultValue={team.sport}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              {sportOptions.map((o) => (
                <option key={o} value={o}>
                  {localizeSport(o, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.category}</span>
            <select
              name="category"
              required
              defaultValue={team.category}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              {categoryOptions.map((o) => (
                <option key={o} value={o}>
                  {localizeTeamCategory(o, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>{ui.sex}</span>
            <select
              name="gender"
              required
              defaultValue={team.gender}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              {genderOptions.map((o) => (
                <option key={o} value={o}>
                  {localizeTeamGender(o, locale)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.age}</span>
          <select
            name="ageGroup"
            required
            defaultValue={team.ageGroup}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            {ageGroupOptions.map((o) => (
              <option key={o} value={o}>
                {localizeAgeGroup(o, locale)}
              </option>
            ))}
          </select>
        </label>

        <AdminImageUrlField
          label={ui.image}
          name="imageUrl"
          defaultValue={team.imageUrl}
          placeholder=""
          emptyText={ui.imageEmpty}
          previewAlt={`${team.name} image preview`}
          helpText="Optional. Paste a local path or external image URL."
        />

        <label className="flex flex-col gap-1 text-sm">
          <span>{ui.description}</span>
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
          {ui.save}
        </button>
      </form>

      <form action={deleteTeamAction} encType="multipart/form-data" className="mt-8">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={team.id} />
        <button
          type="submit"
          className="border-border hover:border-primary rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ui.delete}
        </button>
      </form>
    </div>
  );
}
