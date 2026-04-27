import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteTeamAction } from "@/lib/admin/actions";
import Image from "next/image";
import { Sport } from "@/generated/prisma/enums";
import { getSportImageSrc } from "@/lib/sport-images";
import { localizeAgeGroup, localizeSport, localizeTeamCategory, localizeTeamGender } from "@/lib/db-visual-labels";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: string;
    sport?: string;
    category?: string;
    gender?: string;
    ageGroup?: string;
  }>;
};

const sportValues = Object.values(Sport) as Sport[];
const categoryValues = ["TEAM_SPORT", "INDIVIDUAL"] as const;
const genderValues = ["MALE", "FEMALE"] as const;
const ageGroupValues = ["U8", "U11", "U13", "U15", "U17", "U19", "U21", "U23", "SENIOR"] as const;

export default async function AdminTeamsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const sp = await (searchParams ?? Promise.resolve({} as { q?: string; sport?: string; category?: string; gender?: string; ageGroup?: string }));
  const q = (sp.q ?? "").trim();
  const selectedSport = sportValues.includes(sp.sport as Sport) ? (sp.sport as Sport) : "";
  const selectedCategory = categoryValues.includes(sp.category as (typeof categoryValues)[number]) ? (sp.category as (typeof categoryValues)[number]) : "";
  const selectedGender = genderValues.includes(sp.gender as (typeof genderValues)[number]) ? (sp.gender as (typeof genderValues)[number]) : "";
  const selectedAgeGroup = ageGroupValues.includes(sp.ageGroup as (typeof ageGroupValues)[number]) ? (sp.ageGroup as (typeof ageGroupValues)[number]) : "";

  const teams = await prisma.team.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(selectedSport ? { sport: selectedSport } : {}),
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(selectedGender ? { gender: selectedGender } : {}),
      ...(selectedAgeGroup ? { ageGroup: selectedAgeGroup } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const ui =
    locale === "fr"
      ? {
          newTeam: "Nouvelle \u00E9quipe",
          search: "Rechercher (nom, slug, description)...",
          submit: "Chercher",
          reset: "R\u00E9initialiser",
          sportAll: "Tous les sports",
          categoryAll: "Toutes les cat\u00E9gories",
          genderAll: "Tous les sexes",
          ageAll: "Tous les âges",
          team: "\u00C9quipe",
          sport: "Sport",
          age: "\u00C2ge",
          sex: "Sexe",
          category: "Cat\u00E9gorie",
          actions: "Actions",
          edit: "Modifier",
          players: "Joueurs",
          staff: "Staff",
          delete: "Supprimer",
          empty: "Aucune \u00E9quipe - cr\u00E9ez-en une.",
        }
      : locale === "ar"
        ? {
            newTeam: "\u0641\u0631\u064A\u0642 \u062C\u062F\u064A\u062F",
            search: "\u0628\u062D\u062B (\u0627\u0644\u0627\u0633\u0645، \u0627\u0644\u0645\u0639\u0631\u0641، \u0627\u0644\u0648\u0635\u0641)...",
            submit: "\u0628\u062D\u062B",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            sportAll: "\u0643\u0644 \u0627\u0644\u0631\u064A\u0627\u0636\u0627\u062A",
            categoryAll: "\u0643\u0644 \u0627\u0644\u0641\u0626\u0627\u062A",
            genderAll: "\u0643\u0644 \u0627\u0644\u0623\u062C\u0646\u0627\u0633",
            ageAll: "\u0643\u0644 \u0627\u0644\u0623\u0639\u0645\u0627\u0631",
            team: "\u0627\u0644\u0641\u0631\u064A\u0642",
            sport: "\u0627\u0644\u0631\u064A\u0627\u0636\u0629",
            age: "\u0627\u0644\u0639\u0645\u0631",
            sex: "\u0627\u0644\u062C\u0646\u0633",
            category: "\u0627\u0644\u0641\u0626\u0629",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            edit: "\u062A\u0639\u062F\u064A\u0644",
            players: "\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646",
            staff: "\u0627\u0644\u0625\u0637\u0627\u0631",
            delete: "\u062D\u0630\u0641",
            empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0641\u0631\u0642 - \u0623\u0646\u0634\u0626 \u0641\u0631\u064A\u0642\u0627.",
          }
        : {
            newTeam: "New team",
            search: "Search (name, slug, description)...",
            submit: "Search",
            reset: "Reset",
            sportAll: "All sports",
            categoryAll: "All categories",
            genderAll: "All sexes",
            ageAll: "All ages",
            team: "Team",
            sport: "Sport",
            age: "Age",
            sex: "Sex",
            category: "Category",
            actions: "Actions",
            edit: "Edit",
            players: "Players",
            staff: "Staff",
            delete: "Delete",
            empty: "No team - create one.",
          };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">{t("teams")}</h1>
          <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_160px_160px_160px_160px_auto]">
            <input name="q" defaultValue={q} placeholder={ui.search} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2" />
            <select name="sport" defaultValue={selectedSport} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.sportAll}</option>
              {sportValues.map((sport) => (
                <option key={sport} value={sport}>
                  {localizeSport(sport, locale)}
                </option>
              ))}
            </select>
            <select name="category" defaultValue={selectedCategory} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.categoryAll}</option>
              {categoryValues.map((value) => (
                <option key={value} value={value}>
                  {localizeTeamCategory(value, locale)}
                </option>
              ))}
            </select>
            <select name="gender" defaultValue={selectedGender} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.genderAll}</option>
              {genderValues.map((value) => (
                <option key={value} value={value}>
                  {localizeTeamGender(value, locale)}
                </option>
              ))}
            </select>
            <select name="ageGroup" defaultValue={selectedAgeGroup} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.ageAll}</option>
              {ageGroupValues.map((value) => (
                <option key={value} value={value}>
                  {localizeAgeGroup(value, locale)}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {ui.submit}
              </button>
              {q || selectedSport || selectedCategory || selectedGender || selectedAgeGroup ? (
                <Link href="/admin/teams" className="text-muted text-sm underline">
                  {ui.reset}
                </Link>
              ) : null}
            </div>
          </form>
        </div>

        <Link href="/admin/teams/new" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          {ui.newTeam}
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.team}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.sport}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.age}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.sex}</th>
              <th className="border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{ui.category}</th>
              <th className="border-border px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">{ui.actions}</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex items-center gap-3">
                    <Image src={team.imageUrl ?? getSportImageSrc(team.sport)} alt={team.name} width={44} height={44} className="h-11 w-11 rounded-lg border border-border object-contain bg-muted/20" />
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">{team.name}</span>
                      <span className="text-muted text-xs mt-1 font-mono">{team.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{localizeSport(team.sport, locale)}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{localizeAgeGroup(team.ageGroup, locale)}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{localizeTeamGender(team.gender, locale)}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{localizeTeamCategory(team.category, locale)}</span></td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link href={`/admin/teams/${team.id}/edit`} className="text-primary text-sm underline">{ui.edit}</Link>
                    <Link href={`/admin/teams/${team.id}/players`} className="text-primary text-sm underline">{ui.players}</Link>
                    <Link href={`/admin/teams/${team.id}/staff`} className="text-primary text-sm underline">{ui.staff}</Link>
                    <form action={deleteTeamAction} className="inline">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={team.id} />
                      <button type="submit" className="text-primary text-sm underline hover:opacity-90">{ui.delete}</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={6}>
                  {ui.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
