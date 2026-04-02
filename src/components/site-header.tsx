import { auth } from "@/auth";
import { ClubLogo } from "@/components/club-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function SiteHeader() {
  const [session, t] = await Promise.all([auth(), getTranslations("nav")]);

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/90 sticky top-0 z-50 w-full border-b border-b-[color-mix(in_srgb,var(--ca-red)_22%,transparent)] backdrop-blur dark:border-b-[color-mix(in_srgb,var(--ca-red)_35%,#1a2d4a)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <ClubLogo size="lg" withHomeLink priority />
          <Link
            href="/"
            className="text-foreground hidden truncate font-semibold tracking-tight sm:inline sm:text-lg"
          >
            Club Africain
          </Link>
        </div>
        <nav
          className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-2"
          aria-label="Main"
        >
          <LocaleSwitcher />
          <ThemeToggle />
          <Link
            href="/club"
            className="text-muted hover:text-primary focus-visible:ring-primary rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3"
          >
            {t("club")}
          </Link>
          <Link
            href="/teams"
            className="text-muted hover:text-primary focus-visible:ring-primary rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3"
          >
            {t("teams")}
          </Link>
          <Link
            href="/athletes"
            className="text-muted hover:text-primary focus-visible:ring-primary rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3"
          >
            {t("athletes")}
          </Link>
          <Link
            href="/shop"
            className="text-muted hover:text-primary focus-visible:ring-primary rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3"
          >
            {t("shop")}
          </Link>
          <Link
            href="/shop/cart"
            className="text-muted hover:text-primary rounded-md px-2 py-2 text-sm font-medium sm:px-3"
          >
            {t("cart")}
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-primary rounded-md px-2 py-2 text-sm font-semibold sm:px-3"
            >
              {t("admin")}
            </Link>
          )}
          {session ? (
            <SignOutButton />
          ) : (
            <Link
              href="/auth/signin"
              className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("signIn")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
