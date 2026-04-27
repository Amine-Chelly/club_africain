import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deletePlayerAction } from "@/lib/admin/actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getAthleteImageSrc } from "@/lib/athlete-images";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
  searchParams?: Promise<{ q?: string; gender?: string }>;
};

const genderValues = ["MALE", "FEMALE"] as const;

export default async function TeamPlayersPage({ params, searchParams }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations("admin");
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) notFound();
  const isTennis = team.sport === "TENNIS";
  const sp = await (searchParams ?? Promise.resolve({} as { q?: string; gender?: string }));
  const q = (sp.q ?? "").trim();
  const selectedGender = genderValues.includes(sp.gender as (typeof genderValues)[number]) ? (sp.gender as (typeof genderValues)[number]) : "";

  const players = await prisma.player.findMany({
    where: {
      teamId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { position: { contains: q, mode: "insensitive" } },
              { nationality: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(selectedGender ? { gender: selectedGender } : {}),
    },
    orderBy: { name: "asc" },
  });

  const ui =
    locale === "fr"
      ? {
          search: "Rechercher (nom, poste, nationnalit\u00E9)...",
          submit: "Chercher",
          reset: "R\u00E9initialiser",
          allSexes: "Tous les sexes",
          add: "Ajouter un joueur",
          title: "Joueurs",
          player: "Joueur",
          position: "Poste",
          ranking: "Ranking",
          singles: "Singles",
          doubles: "Doubles",
          numberNation: "# / Nation.",
          appearances: "Ap.",
          goals: "Buts",
          actions: "Actions",
          edit: "Modifier",
          delete: "Supprimer",
          empty: "Aucun joueur - ajoutez-en un.",
        }
      : locale === "ar"
        ? {
            search: "\u0628\u062D\u062B (\u0627\u0644\u0627\u0633\u0645، \u0627\u0644\u0645\u0646\u0635\u0628، \u0627\u0644\u062C\u0646\u0633 \u0627\u0644\u0648\u0637\u0646\u064A)...",
            submit: "\u0628\u062D\u062B",
            reset: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637",
            allSexes: "\u0643\u0644 \u0627\u0644\u0623\u062C\u0646\u0627\u0633",
            add: "\u0625\u0636\u0627\u0641\u0629 \u0644\u0627\u0639\u0628",
            title: "\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646",
            player: "\u0627\u0644\u0644\u0627\u0639\u0628",
            position: "\u0627\u0644\u0645\u0646\u0635\u0628",
            ranking: "\u062A\u0631\u062A\u064A\u0628",
            singles: "\u0641\u0631\u062F\u064A",
            doubles: "\u0632\u0648\u062C\u064A",
            numberNation: "# / \u0627\u0644\u062C\u0646\u0633\u064A\u0629",
            appearances: "\u0645\u0634\u0627\u0631\u0643\u0627\u062A",
            goals: "\u0623\u0647\u062F\u0627\u0641",
            actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
            edit: "\u062A\u0639\u062F\u064A\u0644",
            delete: "\u062D\u0630\u0641",
            empty: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0644\u0627\u0639\u0628\u0648\u0646.",
          }
        : {
            search: "Search (name, position, nationality)...",
            submit: "Search",
            reset: "Reset",
            allSexes: "All sexes",
            add: "Add player",
            title: "Players",
            player: "Player",
            position: "Position",
            ranking: "Ranking",
            singles: "Singles",
            doubles: "Doubles",
            numberNation: "# / Nation.",
            appearances: "Apps",
            goals: "Goals",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            empty: "No player - add one.",
          };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-3xl font-bold">
            {t("teams")} - {team.name}
          </h1>
          <form method="get" className="grid gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_160px_auto]">
            <input name="q" defaultValue={q} placeholder={ui.search} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2" />
            <select name="gender" defaultValue={selectedGender} className="border-border bg-background rounded-md border px-3 py-2 text-sm focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
              <option value="">{ui.allSexes}</option>
              {genderValues.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2">
                {ui.submit}
              </button>
              {q || selectedGender ? (
                <Link href={`/admin/teams/${teamId}/players`} className="text-muted text-sm underline">
                  {ui.reset}
                </Link>
              ) : null}
            </div>
          </form>
        </div>
        <Link href={`/admin/teams/${teamId}/players/new`} className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          {ui.add}
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.player}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{isTennis ? "-" : ui.position}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.numberNation}</th>
              {isTennis ? (
                <>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.singles}</th>
                  <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.doubles}</th>
                </>
              ) : (
                <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.ranking}</th>
              )}
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.appearances}</th>
              <th className="border-border text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.goals}</th>
              <th className="border-border text-right text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2">{ui.actions}</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="inline-flex items-center gap-2">
                    <Image src={getAthleteImageSrc(p.gender)} alt={p.name} width={32} height={32} className="h-8 w-8 rounded-full border border-border object-cover" />
                    <span className="text-foreground font-medium">{p.name}</span>
                  </div>
                  {p.number != null ? <div className="text-muted text-xs font-mono mt-1">#{p.number}</div> : null}
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{isTennis ? "-" : (p.position ?? "-")}</span>
                </td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <span className="text-muted">{p.nationality ?? "-"}</span>
                </td>
                {isTennis ? (
                  <>
                    <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{p.singlesRanking ?? "-"}</span></td>
                    <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{p.doublesRanking ?? "-"}</span></td>
                  </>
                ) : (
                  <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{p.ranking ?? "-"}</span></td>
                )}
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{p.appearances}</span></td>
                <td className="border-border border-t px-3 py-3 align-top"><span className="text-muted">{p.goals}</span></td>
                <td className="border-border border-t px-3 py-3 align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link href={`/admin/teams/${teamId}/players/${p.id}/edit`} className="text-primary text-sm underline">{ui.edit}</Link>
                    <form action={deletePlayerAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="teamId" value={teamId} />
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-primary text-sm underline hover:opacity-90">{ui.delete}</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {players.length === 0 ? (
              <tr>
                <td className="border-border border-t px-3 py-6 text-muted" colSpan={isTennis ? 8 : 7}>
                  {ui.empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
