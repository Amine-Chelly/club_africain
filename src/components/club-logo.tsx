import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";

const sizeMap = {
  sm: "h-8 w-8 min-w-[2rem] sm:h-9 sm:w-9 sm:min-w-[2.25rem]",
  md: "h-10 w-10 min-w-[2.5rem] sm:h-12 sm:w-12 sm:min-w-[3rem]",
  lg: "h-12 w-12 min-w-[3rem] md:h-14 md:w-14 md:min-w-[3.5rem]",
  footer: "h-9 w-9 min-w-[2.25rem] sm:h-10 sm:w-10 sm:min-w-[2.5rem]",
} as const;

export type ClubLogoSize = keyof typeof sizeMap;

type ClubLogoProps = {
  size?: ClubLogoSize;
  className?: string;
  withHomeLink?: boolean;
  priority?: boolean;
};

/** Crest in a square frame — `object-contain` preserves shield proportions. */
export function ClubLogo({
  size = "md",
  withHomeLink = false,
  className,
  priority = false,
}: ClubLogoProps) {
  const frame = (
    <span
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-sm", sizeMap[size], className)}
    >
      <Image
        src={brand.logo.srcWebp}
        alt={brand.logo.alt}
        fill
        sizes="(max-width: 640px) 40px, (max-width: 1024px) 48px, 56px"
        className="object-contain object-center"
        priority={priority}
        quality={90}
      />
    </span>
  );

  if (withHomeLink) {
    return (
      <Link
        href="/"
        className="focus-visible:ring-primary focus-visible:ring-offset-background inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label="Club Africain — Accueil"
      >
        {frame}
      </Link>
    );
  }

  return frame;
}
