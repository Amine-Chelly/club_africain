/**
 * Seed script for Club Africain's real history, titles, and venues.
 * Run with: npx tsx scripts/seed-club-data.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Sport } from "../src/generated/prisma/enums";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");
const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

// ─────────────────────────────────────────────────────────────────
// HISTORY
// ─────────────────────────────────────────────────────────────────
const histories: { sport: Sport; body: string }[] = [
  {
    sport: Sport.FOOTBALL,
    body: `Club Africain fut fondé le 14 octobre 1920 à Tunis par un groupe de jeunes passionnés souhaitant créer un club de sport dans la capitale tunisienne. Dès ses premières décennies, le club s'imposa rapidement comme l'une des forces dominantes du football tunisien.

En 1946-47, le club remporta son premier titre de champion de Tunisie, lançant une longue tradition de succès. Les années 1960 et 1970 furent dorées : le club enchaîna les sacres nationaux et commença à rayonner sur la scène continentale.

La consécration internationale arriva en 1991 avec la victoire en Ligue des Champions de la CAF, faisant de Club Africain le premier club tunisien à soulever ce trophée. L'année suivante, la performance fut confirmée par la conquête du Championnat afro-asiatique des clubs (1992).

Avec 13 championnats de Ligue 1 et 13 Coupes de Tunisie à son palmarès, Club Africain reste l'un des clubs les plus titrés du pays.`,
  },
  {
    sport: Sport.HANDBALL,
    body: `La section handball de Club Africain est l'une des plus prolifiques du sport tunisien. Fondée dans les années 1960, elle a remporté à ce jour 13 championnats nationaux et 19 coupes de Tunisie.

Sur la scène africaine, le club a décroché le Championnat d'Afrique des clubs en 2015, confirmant son statut de puissance continentale. La section féminine est tout aussi remarquable, avec plus de 30 titres nationaux combinés.

La formation des jeunes constitue le pilier du projet : les sections U19 et U17 alimentent régulièrement l'équipe première en talents prometteurs.`,
  },
  {
    sport: Sport.BASKETBALL,
    body: `La section basketball du Club Africain est un acteur reconnu de la scène nationale tunisienne. Évoluant au plus haut niveau depuis plusieurs décennies, l'équipe première dispute chaque saison la Pro A et la Coupe de Tunisie avec l'ambition de décrocher des titres.

Le club a engagé un plan de développement ambitieux pour ses équipes de jeunes, avec des catégories allant du mini-basket jusqu'aux espoirs, afin d'alimenter en permanence l'élite avec des joueurs formés en interne.`,
  },
  {
    sport: Sport.VOLLEYBALL,
    body: `La section volleyball de Club Africain fut l'une des plus dominantes de l'histoire du sport tunisien. Entre 1988 et 1994, le club réalisa un quasi-monopole sur le championnat national, remportant 7 titres de champion de Tunisie et 5 coupes nationales.

Sur la scène africaine, la performance fut tout aussi impressionnante : trois sacres consécutifs au Championnat d'Afrique des clubs (1991, 1992, 1993) ainsi qu'une Coupe d'Afrique des vainqueurs de coupe.

Bien que la section ait traversé des difficultés financières au début des années 2000, elle a été relancée et continue de compétir au niveau national.`,
  },
  {
    sport: Sport.TENNIS,
    body: `La section tennis de Club Africain accueille des joueurs de tous niveaux, du jeune débutant au compétiteur confirmé. Le club dispose d'installations modernes et d'un encadrement professionnel qui accompagne chaque adhérent dans sa progression.

Plusieurs membres de la section ont représenté la Tunisie dans des compétitions régionales et continentales. Le club est également impliqué dans la formation des jeunes, avec des programmes d'initiation dès 6 ans et des académies spécialisées pour les talents de 10 à 18 ans.`,
  },
  {
    sport: Sport.OTHER,
    body: `Au-delà des disciplines majeures, Club Africain abrite également d'autres sections sportives et culturelles qui enrichissent la vie du club. Ces activités contribuent à en faire un véritable pôle de sociabilité et de développement personnel pour la communauté tunisoise.

Parmi ces sections figurent des disciplines comme la natation, l'athlétisme et les arts martiaux, où le club encourage la participation de tous les âges et niveaux.`,
  },
];

// ─────────────────────────────────────────────────────────────────
// TITLES
// ─────────────────────────────────────────────────────────────────
const titles: { sport: Sport; competition: string; year: number; detail?: string }[] = [
  // Football — Ligue 1 (13 titles)
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1947 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1948 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1964 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1967 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1973 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1974 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1979 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1980 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1990 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1992 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 1996 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 2008 },
  { sport: Sport.FOOTBALL, competition: "Championnat de Tunisie – Ligue 1", year: 2015 },
  // Football — Coupe de Tunisie (13 titles)
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1965 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1967 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1968 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1969 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1970 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1972 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1973 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1976 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1992 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 1998 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 2000 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 2017 },
  { sport: Sport.FOOTBALL, competition: "Coupe de Tunisie", year: 2018 },
  // Football — Super Coupe
  { sport: Sport.FOOTBALL, competition: "Super Coupe de Tunisie", year: 1968 },
  { sport: Sport.FOOTBALL, competition: "Super Coupe de Tunisie", year: 1970 },
  { sport: Sport.FOOTBALL, competition: "Super Coupe de Tunisie", year: 1979 },
  // Football — Africa
  { sport: Sport.FOOTBALL, competition: "Ligue des Champions CAF", year: 1991, detail: "Premier club tunisien à remporter le trophée" },
  { sport: Sport.FOOTBALL, competition: "Championnat afro-asiatique des clubs", year: 1992 },
  { sport: Sport.FOOTBALL, competition: "Coupe des Vainqueurs du Maghreb", year: 1971, detail: "Premier titre international du club" },
  // Handball — Championnat (13 titles – selected highlights)
  { sport: Sport.HANDBALL, competition: "Championnat de Tunisie de Handball", year: 1965 },
  { sport: Sport.HANDBALL, competition: "Championnat de Tunisie de Handball", year: 1986 },
  { sport: Sport.HANDBALL, competition: "Championnat de Tunisie de Handball", year: 1998 },
  { sport: Sport.HANDBALL, competition: "Championnat de Tunisie de Handball", year: 2005 },
  { sport: Sport.HANDBALL, competition: "Championnat de Tunisie de Handball", year: 2012 },
  { sport: Sport.HANDBALL, competition: "Championnat de Tunisie de Handball", year: 2015 },
  { sport: Sport.HANDBALL, competition: "Championnat de Tunisie de Handball", year: 2022 },
  // Handball — Cup
  { sport: Sport.HANDBALL, competition: "Coupe de Tunisie de Handball", year: 1967 },
  { sport: Sport.HANDBALL, competition: "Coupe de Tunisie de Handball", year: 1975 },
  { sport: Sport.HANDBALL, competition: "Coupe de Tunisie de Handball", year: 1990 },
  { sport: Sport.HANDBALL, competition: "Coupe de Tunisie de Handball", year: 2003 },
  { sport: Sport.HANDBALL, competition: "Coupe de Tunisie de Handball", year: 2016 },
  // Handball — African
  { sport: Sport.HANDBALL, competition: "Championnat d'Afrique des clubs de Handball", year: 2015 },
  // Volleyball — Championnat (7 titles)
  { sport: Sport.VOLLEYBALL, competition: "Championnat de Tunisie de Volleyball", year: 1988 },
  { sport: Sport.VOLLEYBALL, competition: "Championnat de Tunisie de Volleyball", year: 1989 },
  { sport: Sport.VOLLEYBALL, competition: "Championnat de Tunisie de Volleyball", year: 1990 },
  { sport: Sport.VOLLEYBALL, competition: "Championnat de Tunisie de Volleyball", year: 1991 },
  { sport: Sport.VOLLEYBALL, competition: "Championnat de Tunisie de Volleyball", year: 1992 },
  { sport: Sport.VOLLEYBALL, competition: "Championnat de Tunisie de Volleyball", year: 1993 },
  { sport: Sport.VOLLEYBALL, competition: "Championnat de Tunisie de Volleyball", year: 1994 },
  // Volleyball — Cup
  { sport: Sport.VOLLEYBALL, competition: "Coupe de Tunisie de Volleyball", year: 1989 },
  { sport: Sport.VOLLEYBALL, competition: "Coupe de Tunisie de Volleyball", year: 1991 },
  { sport: Sport.VOLLEYBALL, competition: "Coupe de Tunisie de Volleyball", year: 1993 },
  // Volleyball — African
  { sport: Sport.VOLLEYBALL, competition: "Championnat d'Afrique des clubs de Volleyball", year: 1991 },
  { sport: Sport.VOLLEYBALL, competition: "Championnat d'Afrique des clubs de Volleyball", year: 1992 },
  { sport: Sport.VOLLEYBALL, competition: "Championnat d'Afrique des clubs de Volleyball", year: 1993 },
  { sport: Sport.VOLLEYBALL, competition: "Coupe d'Afrique des vainqueurs de coupe – Volleyball", year: 1994 },
];

// ─────────────────────────────────────────────────────────────────
// VENUES
// ─────────────────────────────────────────────────────────────────
const venues: { sport: Sport; name: string; city: string; capacity?: number; notes: string }[] = [
  {
    sport: Sport.FOOTBALL,
    name: "Stade Olympique d'El Menzah",
    city: "Tunis",
    capacity: 39858,
    notes: "Principal terrain à domicile de Club Africain depuis son inauguration en 1967. Ce stade historique a accueilli de nombreux matches décisifs de Ligue 1 et de Coupe de Tunisie. Surnommé « La Forteresse » par les supporters, il a vu le club remporter plusieurs de ses 13 championnats nationaux sous ses tribunes.",
  },
  {
    sport: Sport.HANDBALL,
    name: "Salle Chérif Bellamine",
    city: "Tunis",
    capacity: 3000,
    notes: "Salle couverte principale de la section handball de Club Africain. Elle accueille les matchs du championnat national A et les rencontres de coupe. La salle a été rénovée pour répondre aux exigences des compétitions continentales.",
  },
  {
    sport: Sport.BASKETBALL,
    name: "Salle Omnisports El Menzah",
    city: "Tunis",
    capacity: 2500,
    notes: "La section basketball de Club Africain évolue dans cette salle polyvalente moderne, équipée de tribunes couvertes et d'un parquet aux normes de la Fédération tunisienne de basketball.",
  },
  {
    sport: Sport.VOLLEYBALL,
    name: "Complexe Sportif Club Africain",
    city: "Tunis",
    capacity: 1500,
    notes: "Salle dédiée aux disciplines de salle du club. La section volleyball y dispute ses rencontres à domicile depuis la refondation de l'équipe après les difficultés financières du début des années 2000.",
  },
  {
    sport: Sport.TENNIS,
    name: "Courts de Tennis Club Africain",
    city: "Tunis",
    notes: "Complexe de tennis comprenant plusieurs courts en dur et en terre battue. Le site accueille des tournois ITF et des compétitions nationales, et constitue le centre de formation de la section tennis du club.",
  },
];

// ─────────────────────────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("⏳  Seeding club histories, titles and venues…");

  // Histories (upsert)
  for (const h of histories) {
    await prisma.clubSportHistory.upsert({
      where: { sport: h.sport },
      create: { sport: h.sport, body: h.body },
      update: { body: h.body },
    });
    console.log(`  ✓ History — ${h.sport}`);
  }

  // Titles — delete all first then recreate
  await prisma.clubTitle.deleteMany({});
  for (let i = 0; i < titles.length; i++) {
    const t = titles[i];
    await prisma.clubTitle.create({
      data: {
        sport: t.sport,
        competition: t.competition,
        year: t.year,
        detail: t.detail ?? null,
        sortOrder: i,
      },
    });
  }
  console.log(`  ✓ ${titles.length} titles seeded`);

  // Venues (upsert)
  for (const v of venues) {
    await prisma.clubVenue.upsert({
      where: { sport: v.sport },
      create: { sport: v.sport, name: v.name, city: v.city, capacity: v.capacity ?? null, notes: v.notes },
      update: { name: v.name, city: v.city, capacity: v.capacity ?? null, notes: v.notes },
    });
    console.log(`  ✓ Venue — ${v.sport}: ${v.name}`);
  }

  console.log("\n✅  Club data seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
