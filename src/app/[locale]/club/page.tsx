import { brand } from "@/lib/brand";
import { getTranslations } from "next-intl/server";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import { localizeSport } from "@/lib/db-visual-labels";
import { Sport } from "@/generated/prisma/enums";
import { ClubSportTabs } from "@/components/club-sport-tabs";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

const SPORTS = Object.values(Sport);

export default async function ClubPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("club");

  const [histories, allTitles, venues] = await Promise.all([
    prisma.clubSportHistory.findMany(),
    prisma.clubTitle.findMany({ orderBy: [{ sport: "asc" }, { year: "desc" }] }),
    prisma.clubVenue.findMany({ include: { images: { orderBy: { sortOrder: "asc" } } } }),
  ]);

  const historyMap = Object.fromEntries(histories.map((h) => [h.sport, h.body]));
  const venueMap = Object.fromEntries(venues.map((v) => [v.sport, v]));
  const titlesBySport = Object.fromEntries(
    SPORTS.map((s) => [s, allTitles.filter((ti) => ti.sport === s)])
  );

  const displaySports = SPORTS;

  const tabData = Object.fromEntries(
    SPORTS.map((s) => [
      s,
      {
        history: historyMap[s] ?? null,
        titles: titlesBySport[s],
        venue: venueMap[s]
          ? {
              name: venueMap[s].name,
              city: venueMap[s].city,
              capacity: venueMap[s].capacity,
              imageUrl: venueMap[s].imageUrl,
              notes: venueMap[s].notes,
              images: (venueMap[s].images ?? []).map((img) => ({
                id: img.id,
                url: img.url,
                isCover: img.isCover,
              })),
            }
          : null,
      },
    ])
  );

  const timelineItems = [
    { year: "1920", text: t("timeline1920") },
    { year: "1947", text: t("timeline1947") },
    { year: "1974", text: t("timeline1974") },
    { year: "1991", text: t("timeline1991") },
    { year: t("timelineTodayLabel"), text: t("timelineToday") },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "Club Africain",
    foundingDate: "1920",
    areaServed: { "@type": "City", name: "Tunis" },
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}${brand.logo.srcPng}`,
  };

  const tabLabels =
    locale === "fr"
      ? { history: "Historique", titles: "Palmarès", venue: "Enceinte", noHistory: "Aucun historique.", noTitles: "Aucun titre enregistré.", noVenue: "Aucune enceinte renseignée.", capacityLabel: "Capacité" }
      : locale === "ar"
        ? { history: "التاريخ", titles: "قائمة الألقاب", venue: "الملعب", noHistory: "لا يوجد تاريخ.", noTitles: "لا توجد ألقاب.", noVenue: "لا يوجد ملعب.", capacityLabel: "الطاقة الاستيعابية" }
        : { history: "History", titles: "Trophies", venue: "Venue", noHistory: "No history yet.", noTitles: "No titles recorded.", noVenue: "No venue recorded.", capacityLabel: "Capacity" };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Script id="club-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* Hero */}
      <section className="border-border bg-card rounded-3xl border p-6 sm:p-8">
        <p className="text-primary text-sm font-semibold uppercase tracking-[0.18em]">{t("eyebrow")}</p>
        <h1 className="text-foreground mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="text-muted mt-4 max-w-3xl leading-relaxed">{t("intro")}</p>
      </section>

      {/* Timeline */}
      <section className="mt-10" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="text-foreground text-xl font-semibold">{t("timeline")}</h2>
        <ol className="border-border mt-4 space-y-3 border-l-2 border-l-[color-mix(in_srgb,var(--ca-red)_40%,transparent)] pl-4 text-muted">
          {timelineItems.map((item) => (
            <li key={item.year}>
              <span className="text-primary font-semibold">{item.year}</span> — {item.text}
            </li>
          ))}
        </ol>
      </section>

      {/* Per-sport tabs */}
      <section className="border-border bg-card mt-10 rounded-3xl border p-6 sm:p-8">
        <h2 className="text-foreground mb-6 text-xl font-semibold">
          {locale === "fr" ? "Sections sportives" : locale === "ar" ? "الأقسام الرياضية" : "Sport sections"}
        </h2>
        <ClubSportTabs
          sports={displaySports.map((s) => ({ key: s, label: localizeSport(s, locale) }))}
          defaultSport={displaySports[0]}
          labels={tabLabels}
          data={tabData}
        />
      </section>
    </div>
  );
}
