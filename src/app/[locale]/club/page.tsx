import { brand } from "@/lib/brand";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
  const t = await getTranslations("club");

  const timelineItems = [
    { year: "1920", text: t("timeline1920") },
    { year: "1947", text: t("timeline1947") },
    { year: "1974", text: t("timeline1974") },
    { year: "1991", text: t("timeline1991") },
    { year: t("timelineTodayLabel"), text: t("timelineToday") },
  ];

  const honours = [t("honourLeague"), t("honourCup"), t("honourContinental"), t("honourSections")];
  const supporterNotes = [t("supportersIdentity"), t("supportersCulture"), t("supportersVenue")];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "Club Africain",
    alternateName: "Club Africain",
    sport: "Football",
    foundingDate: "1920",
    areaServed: { "@type": "City", name: "Tunis" },
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}${brand.logo.srcPng}`,
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-border bg-card rounded-3xl border p-6 sm:p-8">
        <p className="text-primary text-sm font-semibold uppercase tracking-[0.18em]">{t("eyebrow")}</p>
        <h1 className="text-foreground mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="text-muted mt-4 max-w-3xl leading-relaxed">{t("intro")}</p>
      </section>

      <div className="text-muted mt-8 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="history">
          <h2 id="history" className="text-foreground text-xl font-semibold">
            {t("history")}
          </h2>
          <p className="mt-3 leading-relaxed">{t("historyBody1")}</p>
          <p className="mt-3 leading-relaxed">{t("historyBody2")}</p>
        </section>

        <section aria-labelledby="trophies">
          <h2 id="trophies" className="text-foreground text-xl font-semibold">
            {t("trophies")}
          </h2>
          <ul className="mt-3 space-y-3 leading-relaxed">
            {honours.map((honour) => (
              <li key={honour} className="border-border bg-card rounded-2xl border p-4">
                {honour}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="stadium">
          <h2 id="stadium" className="text-foreground text-xl font-semibold">
            {t("stadium")}
          </h2>
          <div className="mt-3 space-y-3 leading-relaxed">
            {supporterNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>

        <section aria-labelledby="timeline">
          <h2 id="timeline" className="text-foreground text-xl font-semibold">
            {t("timeline")}
          </h2>
          <ol className="border-border mt-3 space-y-3 border-l-2 border-l-[color-mix(in_srgb,var(--ca-red)_40%,transparent)] pl-4">
            {timelineItems.map((item) => (
              <li key={item.year}>
                <span className="text-primary font-semibold">{item.year}</span> - {item.text}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
