import { brand } from "@/lib/brand";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
  const t = await getTranslations("club");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "Club Africain",
    alternateName: "النادي الإفريقي",
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
      <h1 className="text-foreground text-3xl font-bold">{t("title")}</h1>
      <div className="text-muted mt-8 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="history">
          <h2 id="history" className="text-foreground text-xl font-semibold">
            {t("history")}
          </h2>
          <p className="mt-3 leading-relaxed">
            Fondé en 1920, le Club Africain est l’un des clubs les plus titrés de Tunisie et d’Afrique,
            porteur d’une identité rouge et blanche forte et d’un public fidèle.
          </p>
        </section>
        <section aria-labelledby="trophies">
          <h2 id="trophies" className="text-foreground text-xl font-semibold">
            {t("trophies")}
          </h2>
          <p className="mt-3 leading-relaxed">
            Palmarès national et continental : titres de champion, coupes et présence régulière sur la scène
            africaine (données indicatives — à enrichir depuis l’admin).
          </p>
        </section>
        <section aria-labelledby="stadium">
          <h2 id="stadium" className="text-foreground text-xl font-semibold">
            {t("stadium")}
          </h2>
          <p className="mt-3 leading-relaxed">
            Stade, capacité, ambiance des Bardoouis : section narrative à compléter avec médias et chiffres
            officiels.
          </p>
        </section>
        <section aria-labelledby="timeline">
          <h2 id="timeline" className="text-foreground text-xl font-semibold">
            {t("timeline")}
          </h2>
          <ol className="border-border mt-3 space-y-3 border-l-2 border-l-[color-mix(in_srgb,var(--ca-red)_40%,transparent)] pl-4">
            <li>
              <span className="text-primary font-semibold">1920</span> — fondation du club.
            </li>
            <li>
              <span className="text-primary font-semibold">…</span> — jalons historiques à venir (CMS /
              admin).
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
