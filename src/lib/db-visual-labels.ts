type LocaleCode = "fr" | "en" | "ar";

function normalizedLocale(locale: string): LocaleCode {
  if (locale === "fr" || locale === "ar") return locale;
  return "en";
}

function pick(locale: string, values: { fr: string; en: string; ar: string }) {
  return values[normalizedLocale(locale)];
}

export function localizeSport(sport: string | null | undefined, locale: string) {
  if (!sport) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    FOOTBALL: { fr: "Football", en: "Football", ar: "\u0643\u0631\u0629 \u0627\u0644\u0642\u062f\u0645" },
    HANDBALL: { fr: "Handball", en: "Handball", ar: "\u0643\u0631\u0629 \u0627\u0644\u064a\u062f" },
    BASKETBALL: { fr: "Basketball", en: "Basketball", ar: "\u0643\u0631\u0629 \u0627\u0644\u0633\u0644\u0629" },
    VOLLEYBALL: { fr: "Volleyball", en: "Volleyball", ar: "\u0627\u0644\u0643\u0631\u0629 \u0627\u0644\u0637\u0627\u0626\u0631\u0629" },
    TENNIS: { fr: "Tennis", en: "Tennis", ar: "\u0627\u0644\u062a\u0646\u0633" },
    OTHER: { fr: "Autre", en: "Other", ar: "\u0631\u064a\u0627\u0636\u0629 \u0623\u062e\u0631\u0649" },
  };
  return map[sport] ? pick(locale, map[sport]) : sport;
}

export function localizeTeamCategory(category: string | null | undefined, locale: string) {
  if (!category) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    TEAM_SPORT: { fr: "Equipe", en: "Team", ar: "\u0641\u0631\u064A\u0642" },
    INDIVIDUAL: { fr: "Individuel", en: "Individual", ar: "\u0641\u0631\u062F\u064A" },
  };
  return map[category] ? pick(locale, map[category]) : category;
}

export function localizeTeamGender(gender: string | null | undefined, locale: string) {
  if (!gender) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    MALE: { fr: "Hommes", en: "Men", ar: "\u0631\u062c\u0627\u0644" },
    FEMALE: { fr: "Femmes", en: "Women", ar: "\u0633\u064a\u062f\u0627\u062a" },
  };
  return map[gender] ? pick(locale, map[gender]) : gender;
}

export function localizeAthleteGender(gender: string | null | undefined, locale: string) {
  if (!gender) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    MALE: { fr: "Homme", en: "Male", ar: "\u0630\u0643\u0631" },
    FEMALE: { fr: "Femme", en: "Female", ar: "\u0623\u0646\u062b\u0649" },
  };
  return map[gender] ? pick(locale, map[gender]) : gender;
}

export function localizeAgeGroup(ageGroup: string | null | undefined, locale: string) {
  if (!ageGroup) return "-";
  if (ageGroup === "SENIOR") {
    return pick(locale, { fr: "Seniors", en: "Senior", ar: "\u0623\u0643\u0627\u0628\u0631" });
  }
  return ageGroup;
}

export function localizeMerchType(merchType: string | null | undefined, locale: string) {
  if (!merchType) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    JERSEY: { fr: "Maillot", en: "Jersey", ar: "\u0642\u0645\u064a\u0635" },
    SHORTS: { fr: "Short", en: "Shorts", ar: "\u0633\u0631\u0648\u0627\u0644 \u0642\u0635\u064a\u0631" },
    SCARF: { fr: "\u00C9charpe", en: "Scarf", ar: "\u0648\u0634\u0627\u062d" },
    SOCKS: { fr: "Chaussettes", en: "Socks", ar: "\u062c\u0648\u0627\u0631\u0628" },
    SWEATSHIRT: { fr: "Sweatshirt", en: "Sweatshirt", ar: "\u0642\u0645\u064a\u0635 \u0634\u062a\u0648\u064a" },
    OTHER: { fr: "Autre", en: "Other", ar: "\u0645\u0646\u062a\u062c \u0622\u062e\u0631" },
  };
  return map[merchType] ? pick(locale, map[merchType]) : merchType;
}

export function localizeFixtureStatus(status: string | null | undefined, locale: string) {
  if (!status) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    SCHEDULED: { fr: "Programm\u00E9", en: "Scheduled", ar: "\u0645\u062c\u062f\u0648\u0644" },
    LIVE: { fr: "En direct", en: "Live", ar: "\u0645\u0628\u0627\u0634\u0631" },
    FINISHED: { fr: "Termin\u00E9", en: "Finished", ar: "\u0645\u0646\u062a\u0647\u064a" },
    CANCELED: { fr: "Annul\u00E9", en: "Canceled", ar: "\u0645\u0644\u063a\u0649" },
  };
  return map[status] ? pick(locale, map[status]) : status;
}

export function localizeOrderStatus(status: string | null | undefined, locale: string) {
  if (!status) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    PENDING: { fr: "Commandée", en: "Ordered", ar: "\u0637\u0644\u0628\u062a" },
    PAID: { fr: "Payée", en: "Payed", ar: "\u0645\u062f\u0641\u0648\u0639\u0629" },
    SHIPPED: { fr: "Livrée", en: "Delivered", ar: "\u0645\u0633\u0644\u0645\u0629" },
    CANCELLED: { fr: "Annulée", en: "Cancelled", ar: "\u0645\u0644\u063a\u0627\u0629" },
  };
  return map[status] ? pick(locale, map[status]) : status;
}

export function localizeOrderPaymentType(type: string | null | undefined, locale: string) {
  if (!type) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    CASH: { fr: "Espèces", en: "Cash", ar: "\u0646\u0642\u062f\u064b\u0627" },
    CARD: { fr: "Carte", en: "Card", ar: "\u0628\u0637\u0627\u0642\u0629" },
    BANK_TRANSFER: { fr: "Virement", en: "Bank transfer", ar: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A" },
  };
  return map[type] ? pick(locale, map[type]) : type;
}

export function localizeOrderDeliveryType(type: string | null | undefined, locale: string) {
  if (!type) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    PICKUP: { fr: "Retrait", en: "Pickup", ar: "\u0627\u0633\u062A\u0644\u0627\u0645" },
    DELIVERY: { fr: "Livraison", en: "Delivery", ar: "\u062A\u0648\u0635\u064A\u0644" },
  };
  return map[type] ? pick(locale, map[type]) : type;
}

export function localizeTournamentCategory(category: string | null | undefined, locale: string) {
  if (!category) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    ITF: { fr: "ITF", en: "ITF", ar: "ITF" },
    ATP: { fr: "ATP (Hommes)", en: "ATP (Men)", ar: "ATP (\u0631\u062C\u0627\u0644)" },
    WTA: { fr: "WTA (Femmes)", en: "WTA (Women)", ar: "WTA (\u0633\u064A\u062F\u0627\u062A)" },
  };
  return map[category] ? pick(locale, map[category]) : category;
}

export function localizeTournamentTier(tier: string | null | undefined, locale: string) {
  if (!tier) return "-";
  const map: Record<string, { fr: string; en: string; ar: string }> = {
    GRAND_SLAM: { fr: "Grand Chelem", en: "Grand Slam", ar: "\u062C\u0631\u0627\u0646\u062F \u0633\u0644\u0627\u0645" },
    STANDARD: { fr: "Standard", en: "Standard", ar: "\u0642\u064A\u0627\u0633\u064A" },
  };
  return map[tier] ? pick(locale, map[tier]) : tier;
}

export function localizeMatchdayLabel(label: string, locale: string) {
  const normalized = label.trim().toLowerCase();
  if (normalized === "round of 16" || normalized === "1/16") {
    return pick(locale, { fr: "1/16 de finale", en: "Round of 16", ar: "\u062F\u0648\u0631 16" });
  }
  if (normalized === "quarterfinal" || normalized === "quarter-final") {
    return pick(locale, { fr: "Quart de finale", en: "Quarterfinal", ar: "\u0631\u0628\u0639 \u0627\u0644\u0646\u0647\u0627\u0626\u064A" });
  }
  if (normalized === "semifinal" || normalized === "semi-final") {
    return pick(locale, { fr: "Demi-finale", en: "Semifinal", ar: "\u0646\u0635\u0641 \u0627\u0644\u0646\u0647\u0627\u0626\u064A" });
  }
  if (normalized === "final") {
    return pick(locale, { fr: "Finale", en: "Final", ar: "\u0627\u0644\u0646\u0647\u0627\u0626\u064A" });
  }

  const match = label.match(/(?:matchday|journ(?:ee|e|\u00E9e)|matchay)\s*(\d+)/i);
  if (!match) return label;
  const number = match[1];
  return pick(locale, {
    fr: `Journ\u00E9e ${number}`,
    en: `Matchday ${number}`,
    ar: `\u0627\u0644\u062c\u0648\u0644\u0629 ${number}`,
  });
}

export function sizesWord(locale: string) {
  return pick(locale, { fr: "tailles", en: "sizes", ar: "\u0645\u0642\u0627\u0633\u0627\u062A" });
}

export function shortLabels(locale: string) {
  return {
    played: pick(locale, { fr: "Jou\u00E9s", en: "Played", ar: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A" }),
    wdl: pick(locale, { fr: "V-N-D", en: "W-D-L", ar: "\u0641-\u062A-\u062E" }),
    players: pick(locale, { fr: "joueurs", en: "players", ar: "\u0644\u0627\u0639\u0628\u064A\u0646" }),
    staff: pick(locale, { fr: "staff", en: "staff", ar: "\u0625\u0637\u0627\u0631 \u0641\u0646\u064A" }),
    fixtures: pick(locale, { fr: "matchs", en: "fixtures", ar: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A" }),
    apps: pick(locale, { fr: "matchs", en: "apps", ar: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A" }),
  };
}
