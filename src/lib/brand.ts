/** Club Africain — single source for crest-derived colors (see `globals.css` `--ca-*`). */
export const brand = {
  colors: {
    red: "#E21E26",
    redDeep: "#B9151C",
    white: "#FFFFFF",
    darkBg: "#0C1A2E",
    darkSurface: "#111F33",
    darkSecondary: "#152238",
    /** Body text on white (near-black, not blue-gray) */
    foreground: "#141414",
    /** Secondary copy — warm neutral */
    muted: "#5C5C5C",
  },
  logo: {
    srcWebp: "/branding/club-africain-logo.webp",
    srcPng: "/branding/club-africain-logo.png",
    srcSvg: "/branding/club-africain-logo.svg",
    width: 864,
    height: 864,
    alt: "Club Africain — النادي الإفريقي",
  },
} as const;
