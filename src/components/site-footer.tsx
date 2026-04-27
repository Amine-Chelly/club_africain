import { ClubLogo } from "@/components/club-logo";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const [t, tNav] = await Promise.all([getTranslations("footer"), getTranslations("nav")]);
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-border bg-card mt-auto border-t border-t-[color-mix(in_srgb,var(--ca-red)_18%,transparent)] dark:border-t-[color-mix(in_srgb,var(--ca-red)_30%,#1a2d4a)]"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="flex max-w-md flex-col gap-4">
          <div className="flex items-center gap-3">
            <ClubLogo size="footer" withHomeLink />
            <div>
              <p className="text-foreground font-semibold">Club Africain</p>
              <p className="text-primary text-sm font-medium">{t("tagline")}</p>
            </div>
          </div>
          <p className="text-muted text-sm leading-relaxed">{t("blurb")}</p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-primary mb-2 font-semibold">{t("links")}</p>
            <ul className="text-muted flex flex-col gap-2">
              <li>
                <Link href="/club" className="hover:text-primary transition-colors">
                  {t("presentation")}
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-primary transition-colors">
                  {tNav("teams")}
                </Link>
              </li>
              <li>
                <Link href="/fixtures" className="hover:text-primary transition-colors">
                  {tNav("fixtures")}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-primary transition-colors">
                  {tNav("shop")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-primary text-primary-foreground border-t border-white/15 py-4 text-center">
        <p className="text-xs opacity-95">{t("copyright", { year })}</p>
      </div>
    </footer>
  );
}
