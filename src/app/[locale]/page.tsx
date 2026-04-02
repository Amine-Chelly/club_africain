import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { NewsletterSubscribe } from "@/components/newsletter-subscribe";

export default async function HomePage() {
  const t = await getTranslations("home");
  const highlights = [
    { value: "11", label: t("highlightTeams") },
    { value: "196+", label: t("highlightPlayers") },
    { value: "23", label: t("highlightProducts") },
  ];
  const pillars = [
    {
      title: t("pillarHistoryTitle"),
      description: t("pillarHistoryDescription"),
      href: "/club",
    },
    {
      title: t("pillarTeamsTitle"),
      description: t("pillarTeamsDescription"),
      href: "/teams",
    },
    {
      title: t("pillarShopTitle"),
      description: t("pillarShopDescription"),
      href: "/shop",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <section className="from-background via-accent-wash to-secondary border-border relative overflow-hidden border-b bg-gradient-to-b py-16 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] dark:hidden"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              var(--ca-red) 0px,
              var(--ca-red) 8px,
              var(--ca-white) 8px,
              var(--ca-white) 16px
            )`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-primary mb-2 text-sm font-semibold uppercase tracking-[0.2em]">{t("since")}</p>
          <h1 className="text-foreground max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-muted mt-4 max-w-xl text-lg leading-relaxed">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/club"
              className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold shadow-[0_1px_0_0_color-mix(in_srgb,var(--ca-red-deep)_40%,transparent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("ctaClub")}
            </Link>
            <Link
              href="/shop"
              className="border-primary text-primary hover:bg-primary/8 focus-visible:ring-ring inline-flex rounded-lg border-2 bg-transparent px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("ctaShop")}
            </Link>
          </div>
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="border-border bg-background/70 rounded-2xl border px-4 py-4 backdrop-blur">
                <dt className="text-muted text-sm">{highlight.label}</dt>
                <dd className="text-foreground mt-1 text-3xl font-bold tracking-tight">{highlight.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-border bg-card rounded-3xl border p-6 sm:p-8">
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">{t("matchdayEyebrow")}</p>
            <h2 className="text-foreground mt-3 text-3xl font-bold tracking-tight">{t("matchdayTitle")}</h2>
            <p className="text-muted mt-4 max-w-2xl leading-relaxed">{t("matchdayDescription")}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/teams"
                className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                {t("ctaTeams")}
              </Link>
              <Link
                href="/club"
                className="border-border text-foreground hover:bg-secondary inline-flex rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                {t("ctaHistory")}
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            {pillars.map((pillar) => (
              <Link
                key={pillar.title}
                href={pillar.href}
                className="border-border bg-card hover:border-primary/40 block rounded-2xl border p-5 transition-colors"
              >
                <p className="text-foreground text-lg font-semibold">{pillar.title}</p>
                <p className="text-muted mt-2 text-sm leading-relaxed">{pillar.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSubscribe />
    </div>
  );
}
