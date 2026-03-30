import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

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
        </div>
      </section>
    </div>
  );
}
