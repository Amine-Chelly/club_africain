import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AgeGroup,
  AthleteGender,
  MerchType,
  Role,
  Sport,
  TournamentTier,
  TeamCategory,
  TennisTournamentCategory,
} from "../src/generated/prisma/enums";
import { PrismaClient } from "../src/generated/prisma/client";
import { getAthleteImageSrc } from "../src/lib/athlete-images";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL required for seed");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

type PlayerSeed = {
  name: string;
  number?: number;
  position?: string;
  nationality?: string;
  appearances: number;
  goals: number;
  ranking?: number;
  singlesRanking?: number;
  doublesRanking?: number;
  imageUrl?: string;
  gender?: AthleteGender;
};

type StaffSeed = {
  name: string;
  role: string;
};

type TeamSeed = {
  slug: string;
  name: string;
  sport: Sport;
  gender: "MALE" | "FEMALE";
  category: TeamCategory;
  ageGroup: AgeGroup;
  description: string;
  playerTarget: number;
  positions: string[];
  competitions: string[];
  staff: StaffSeed[];
};

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  merchType: MerchType;
  sport: Sport | null;
  sizeOptions: string[];
  stock: number;
  imageUrls: string[];
};

type TennisPlayerRef = {
  id: string;
  gender: AthleteGender | null;
};

const firstNames = [
  "Aymen",
  "Youssef",
  "Bilel",
  "Skander",
  "Mohamed",
  "Ali",
  "Seif",
  "Amine",
  "Oussama",
  "Hamza",
  "Ghaith",
  "Houssem",
  "Nader",
  "Anis",
  "Rayen",
  "Firas",
  "Walid",
  "Karim",
  "Sami",
  "Nassim",
  "Mahdi",
  "Montassar",
  "Aziz",
  "Issam",
  "Rami",
  "Saber",
  "Ahmed",
  "Tarek",
  "Lotfi",
  "Chaker",
  "Marwen",
  "Nael",
];

const lastNames = [
  "Ben Salah",
  "Trabelsi",
  "Jlassi",
  "Khalfallah",
  "Gharbi",
  "Cherni",
  "Mabrouk",
  "Ben Ali",
  "Abid",
  "Saidi",
  "Mejri",
  "Aouadi",
  "Zouari",
  "Brahmi",
  "Hamdi",
  "Dridi",
  "Mhiri",
  "Sassi",
  "Mrad",
  "Nefzi",
  "Mokni",
  "Tounsi",
  "Kchaou",
  "Kefi",
  "Bousnina",
  "Chikhaoui",
  "Jedidi",
  "Dhouib",
  "Debbabi",
  "Souissi",
  "Baccar",
  "Boukhris",
];

const nationalities = ["TN", "DZ", "MA", "EG", "CI", "SN", "FR", "LY"];
const teamSeeds: TeamSeed[] = [
  {
    slug: "football-seniors",
    name: "Football - Seniors",
    sport: Sport.FOOTBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.SENIOR,
    description: "Senior football squad competing in league and cup fixtures.",
    playerTarget: 32,
    positions: ["Goalkeeper", "Right Back", "Center Back", "Left Back", "Midfielder", "Winger", "Striker"],
    competitions: ["Ligue 1", "Coupe de Tunisie", "Super Coupe"],
    staff: [
      { name: "Nabil Kouki", role: "Head Coach" },
      { name: "Karim Trabelsi", role: "Assistant Coach" },
      { name: "Seif Gharbi", role: "Goalkeeper Coach" },
      { name: "Walid Saidi", role: "Fitness Coach" },
    ],
  },
  {
    slug: "football-u21",
    name: "Football - U21",
    sport: Sport.FOOTBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.U21,
    description: "Development squad preparing academy players for the senior level.",
    playerTarget: 24,
    positions: ["Goalkeeper", "Right Back", "Center Back", "Left Back", "Midfielder", "Winger", "Striker"],
    competitions: ["Elite League U21", "Cup U21"],
    staff: [
      { name: "Hatem Ben Amor", role: "Coach" },
      { name: "Nader Ben Youssef", role: "Assistant Coach" },
      { name: "Rami Ben Amor", role: "Athletic Trainer" },
    ],
  },
  {
    slug: "football-u17",
    name: "Football - U17",
    sport: Sport.FOOTBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.U17,
    description: "Academy team focused on tactical growth and player progression.",
    playerTarget: 22,
    positions: ["Goalkeeper", "Right Back", "Center Back", "Left Back", "Midfielder", "Winger", "Striker"],
    competitions: ["National U17 League", "Youth Cup"],
    staff: [
      { name: "Adel Bousnina", role: "Coach" },
      { name: "Skander Kefi", role: "Video Analyst" },
      { name: "Lotfi Hamdi", role: "Fitness Coach" },
    ],
  },
  {
    slug: "football-women-seniors",
    name: "Football - Women Seniors",
    sport: Sport.FOOTBALL,
    gender: "FEMALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.SENIOR,
    description: "Senior women's football squad competing in league and cup fixtures.",
    playerTarget: 26,
    positions: ["Goalkeeper", "Right Back", "Center Back", "Left Back", "Midfielder", "Winger", "Striker"],
    competitions: ["Women's Ligue 1", "Women's Cup"],
    staff: [
      { name: "Nesrine Ben Ali", role: "Head Coach" },
      { name: "Lina Trabelsi", role: "Assistant Coach" },
      { name: "Meriem Saidi", role: "Fitness Coach" },
    ],
  },
  {
    slug: "handball-seniors",
    name: "Handball - Seniors",
    sport: Sport.HANDBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.SENIOR,
    description: "Senior handball roster with domestic league and cup objectives.",
    playerTarget: 20,
    positions: ["Goalkeeper", "Left Wing", "Right Wing", "Pivot", "Center Back", "Left Back", "Right Back"],
    competitions: ["National A", "Handball Cup", "Arab Club Championship"],
    staff: [
      { name: "Omar Mezni", role: "Head Coach" },
      { name: "Bilel Chikhaoui", role: "Assistant Coach" },
      { name: "Aziz Jlassi", role: "Physio" },
    ],
  },
  {
    slug: "handball-u19",
    name: "Handball - U19",
    sport: Sport.HANDBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.U19,
    description: "Youth handball team with emphasis on technical discipline.",
    playerTarget: 18,
    positions: ["Goalkeeper", "Left Wing", "Right Wing", "Pivot", "Center Back", "Left Back", "Right Back"],
    competitions: ["U19 National Championship", "Youth Cup"],
    staff: [
      { name: "Moez Debbabi", role: "Coach" },
      { name: "Nael Dridi", role: "Assistant Coach" },
    ],
  },
  {
    slug: "handball-women-seniors",
    name: "Handball - Women Seniors",
    sport: Sport.HANDBALL,
    gender: "FEMALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.SENIOR,
    description: "Senior women's handball roster with domestic and cup objectives.",
    playerTarget: 18,
    positions: ["Goalkeeper", "Left Wing", "Right Wing", "Pivot", "Center Back", "Left Back", "Right Back"],
    competitions: ["Women's National A", "Women's Handball Cup"],
    staff: [
      { name: "Asma Cherni", role: "Head Coach" },
      { name: "Sonia Gharbi", role: "Assistant Coach" },
    ],
  },
  {
    slug: "basketball-seniors",
    name: "Basketball - Seniors",
    sport: Sport.BASKETBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.SENIOR,
    description: "Senior basketball squad built for a full domestic season.",
    playerTarget: 16,
    positions: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
    competitions: ["Pro A", "Basket Cup"],
    staff: [
      { name: "Sami Mejri", role: "Head Coach" },
      { name: "Anis Souissi", role: "Assistant Coach" },
      { name: "Tarek Gharbi", role: "Conditioning Coach" },
    ],
  },
  {
    slug: "basketball-u18",
    name: "Basketball - U18",
    sport: Sport.BASKETBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.U19,
    description: "Youth basketball roster competing in junior national events.",
    playerTarget: 14,
    positions: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
    competitions: ["Junior League", "Junior Cup"],
    staff: [
      { name: "Mahdi Kchaou", role: "Coach" },
      { name: "Youssef Dhouib", role: "Assistant Coach" },
    ],
  },
  {
    slug: "volleyball-seniors",
    name: "Volleyball - Seniors",
    sport: Sport.VOLLEYBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.SENIOR,
    description: "Senior volleyball side targeting top-table consistency.",
    playerTarget: 18,
    positions: ["Setter", "Opposite", "Middle Blocker", "Outside Hitter", "Libero"],
    competitions: ["National Division A", "Volleyball Cup"],
    staff: [
      { name: "Rami Trabelsi", role: "Head Coach" },
      { name: "Walid Jedidi", role: "Assistant Coach" },
      { name: "Seif Mokni", role: "Statistician" },
    ],
  },
  {
    slug: "volleyball-u17",
    name: "Volleyball - U17",
    sport: Sport.VOLLEYBALL,
    gender: "MALE",
    category: TeamCategory.TEAM_SPORT,
    ageGroup: AgeGroup.U17,
    description: "Junior volleyball squad developing match rhythm and fundamentals.",
    playerTarget: 16,
    positions: ["Setter", "Opposite", "Middle Blocker", "Outside Hitter", "Libero"],
    competitions: ["U17 National League", "Youth Volleyball Cup"],
    staff: [
      { name: "Hamza Mabrouk", role: "Coach" },
      { name: "Ali Baccar", role: "Assistant Coach" },
    ],
  },
  {
    slug: "tennis-seniors",
    name: "Tennis - Seniors",
    sport: Sport.TENNIS,
    gender: "MALE",
    category: TeamCategory.INDIVIDUAL,
    ageGroup: AgeGroup.SENIOR,
    description: "Senior tennis program for singles and doubles competition.",
    playerTarget: 8,
    positions: [],
    competitions: ["Tunis Open", "Carthage Masters", "Sousse Challenger"],
    staff: [
      { name: "Ahmed Cherni", role: "Head Coach" },
      { name: "Firas Ben Salah", role: "Conditioning Coach" },
    ],
  },
  {
    slug: "tennis-u15",
    name: "Tennis - U15",
    sport: Sport.TENNIS,
    gender: "FEMALE",
    category: TeamCategory.INDIVIDUAL,
    ageGroup: AgeGroup.U15,
    description: "Youth tennis group preparing athletes for national junior events.",
    playerTarget: 8,
    positions: [],
    competitions: ["Tunis Junior Open", "Carthage Junior Masters", "Sousse Junior Cup"],
    staff: [
      { name: "Nassim Saidi", role: "Coach" },
      { name: "Amine Tounsi", role: "Assistant Coach" },
    ],
  },
];

const productSeeds: ProductSeed[] = [
  {
    slug: "football-home-jersey-2026",
    name: "Football Home Jersey 2026",
    description: "Official first-team home jersey in red and white for matchday wear.",
    priceCents: 12900,
    category: "Football Jerseys",
    merchType: MerchType.JERSEY,
    sport: Sport.FOOTBALL,
    sizeOptions: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: 180,
    imageUrls: ["/branding/club-africain-logo.webp", "/branding/club-africain-logo.png"],
  },
  {
    slug: "football-away-jersey-2026",
    name: "Football Away Jersey 2026",
    description: "White away jersey inspired by the club's classic continental nights.",
    priceCents: 12900,
    category: "Football Jerseys",
    merchType: MerchType.JERSEY,
    sport: Sport.FOOTBALL,
    sizeOptions: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: 160,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "football-third-jersey",
    name: "Football Third Jersey",
    description: "Alternate football jersey for special fixtures and collector drops.",
    priceCents: 13500,
    category: "Football Jerseys",
    merchType: MerchType.JERSEY,
    sport: Sport.FOOTBALL,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    stock: 120,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "football-training-top",
    name: "Football Training Top",
    description: "Lightweight training top used by the football squads during sessions.",
    priceCents: 9800,
    category: "Football Training",
    merchType: MerchType.SWEATSHIRT,
    sport: Sport.FOOTBALL,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    stock: 110,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "football-shorts-pro",
    name: "Football Match Shorts",
    description: "Match shorts in club colors for football supporters and players.",
    priceCents: 5900,
    category: "Football Training",
    merchType: MerchType.SHORTS,
    sport: Sport.FOOTBALL,
    sizeOptions: ["S", "M", "L", "XL"],
    stock: 140,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "football-socks-home",
    name: "Football Home Socks",
    description: "Performance socks matching the home football kit.",
    priceCents: 2400,
    category: "Football Accessories",
    merchType: MerchType.SOCKS,
    sport: Sport.FOOTBALL,
    sizeOptions: ["35-38", "39-42", "43-46"],
    stock: 220,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "handball-home-jersey",
    name: "Handball Home Jersey",
    description: "Official handball team jersey designed for fast indoor play.",
    priceCents: 9900,
    category: "Handball Jerseys",
    merchType: MerchType.JERSEY,
    sport: Sport.HANDBALL,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    stock: 90,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "handball-goalkeeper-jersey",
    name: "Handball Goalkeeper Jersey",
    description: "Long-sleeve goalkeeper jersey inspired by the senior handball side.",
    priceCents: 10400,
    category: "Handball Jerseys",
    merchType: MerchType.JERSEY,
    sport: Sport.HANDBALL,
    sizeOptions: ["M", "L", "XL", "XXL"],
    stock: 70,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "handball-warmup-top",
    name: "Handball Warm-Up Top",
    description: "Pre-match warm-up top for handball fans who want the full look.",
    priceCents: 8700,
    category: "Handball Training",
    merchType: MerchType.SWEATSHIRT,
    sport: Sport.HANDBALL,
    sizeOptions: ["S", "M", "L", "XL"],
    stock: 60,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "basketball-home-jersey",
    name: "Basketball Home Jersey",
    description: "Breathable basketball jersey with lightweight mesh panels.",
    priceCents: 10900,
    category: "Basketball Jerseys",
    merchType: MerchType.JERSEY,
    sport: Sport.BASKETBALL,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    stock: 75,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "basketball-shorts",
    name: "Basketball Shorts",
    description: "Loose-fit shorts matching the club basketball kit.",
    priceCents: 6200,
    category: "Basketball Training",
    merchType: MerchType.SHORTS,
    sport: Sport.BASKETBALL,
    sizeOptions: ["S", "M", "L", "XL"],
    stock: 95,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "basketball-hoodie",
    name: "Basketball Courtside Hoodie",
    description: "Heavyweight hoodie for the basketball section and cooler evenings.",
    priceCents: 11500,
    category: "Basketball Training",
    merchType: MerchType.SWEATSHIRT,
    sport: Sport.BASKETBALL,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    stock: 65,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "volleyball-home-jersey",
    name: "Volleyball Home Jersey",
    description: "Volleyball match jersey with flexible fabric and club detailing.",
    priceCents: 9500,
    category: "Volleyball Jerseys",
    merchType: MerchType.JERSEY,
    sport: Sport.VOLLEYBALL,
    sizeOptions: ["S", "M", "L", "XL"],
    stock: 80,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "volleyball-training-sweatshirt",
    name: "Volleyball Training Sweatshirt",
    description: "Training layer for volleyball sessions and travel days.",
    priceCents: 8600,
    category: "Volleyball Training",
    merchType: MerchType.SWEATSHIRT,
    sport: Sport.VOLLEYBALL,
    sizeOptions: ["S", "M", "L", "XL"],
    stock: 55,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "tennis-polo-performance",
    name: "Tennis Performance Polo",
    description: "Moisture-wicking polo inspired by the club tennis program.",
    priceCents: 7800,
    category: "Tennis Apparel",
    merchType: MerchType.JERSEY,
    sport: Sport.TENNIS,
    sizeOptions: ["S", "M", "L", "XL"],
    stock: 50,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "tennis-shorts",
    name: "Tennis Match Shorts",
    description: "Stretch tennis shorts with zip pockets and subtle club branding.",
    priceCents: 5200,
    category: "Tennis Apparel",
    merchType: MerchType.SHORTS,
    sport: Sport.TENNIS,
    sizeOptions: ["S", "M", "L", "XL"],
    stock: 45,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "club-scarf-classic",
    name: "Classic Club Scarf",
    description: "Supporter scarf in the iconic red and white colors.",
    priceCents: 2500,
    category: "Supporter Gear",
    merchType: MerchType.SCARF,
    sport: Sport.OTHER,
    sizeOptions: ["OS"],
    stock: 320,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "club-scarf-ultras",
    name: "Ultras Matchday Scarf",
    description: "Louder matchday scarf with woven supporters' graphics.",
    priceCents: 2900,
    category: "Supporter Gear",
    merchType: MerchType.SCARF,
    sport: Sport.OTHER,
    sizeOptions: ["OS"],
    stock: 210,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "club-hoodie-essential",
    name: "Essential Club Hoodie",
    description: "Everyday heavyweight hoodie with embroidered club crest.",
    priceCents: 11800,
    category: "Lifestyle",
    merchType: MerchType.SWEATSHIRT,
    sport: Sport.OTHER,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    stock: 140,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "club-travel-sweatshirt",
    name: "Club Travel Sweatshirt",
    description: "Minimal crewneck sweatshirt for travel and casual wear.",
    priceCents: 10200,
    category: "Lifestyle",
    merchType: MerchType.SWEATSHIRT,
    sport: Sport.OTHER,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    stock: 115,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "club-kids-home-jersey",
    name: "Kids Home Jersey",
    description: "Junior-sized home jersey for young supporters.",
    priceCents: 7600,
    category: "Kids",
    merchType: MerchType.JERSEY,
    sport: Sport.FOOTBALL,
    sizeOptions: ["6Y", "8Y", "10Y", "12Y", "14Y"],
    stock: 130,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "club-kids-sweatshirt",
    name: "Kids Club Sweatshirt",
    description: "Soft brushed sweatshirt for younger fans in everyday use.",
    priceCents: 6900,
    category: "Kids",
    merchType: MerchType.SWEATSHIRT,
    sport: Sport.OTHER,
    sizeOptions: ["6Y", "8Y", "10Y", "12Y"],
    stock: 95,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
  {
    slug: "club-training-socks",
    name: "Club Training Socks",
    description: "Comfort training socks for gym, recovery, and everyday wear.",
    priceCents: 1800,
    category: "Accessories",
    merchType: MerchType.SOCKS,
    sport: Sport.OTHER,
    sizeOptions: ["35-38", "39-42", "43-46"],
    stock: 240,
    imageUrls: ["/branding/club-africain-logo.webp"],
  },
  {
    slug: "club-premium-supporter-pack",
    name: "Premium Supporter Pack",
    description: "Bundle-inspired supporter product for gifting and matchday rituals.",
    priceCents: 14900,
    category: "Supporter Gear",
    merchType: MerchType.OTHER,
    sport: Sport.OTHER,
    sizeOptions: ["OS"],
    stock: 40,
    imageUrls: ["/branding/club-africain-logo.png"],
  },
];

function buildPlayerName(index: number, teamName: string) {
  const first = firstNames[index % firstNames.length];
  const last = lastNames[(index * 3 + teamName.length) % lastNames.length];
  return `${first} ${last}`;
}

function getRoleWeight(sport: Sport, position?: string) {
  const p = (position ?? "").toLowerCase();

  if (sport === Sport.FOOTBALL) {
    if (p.includes("striker") || p.includes("wing")) return 3;
    if (p.includes("midfielder")) return 2;
    if (p.includes("goalkeeper")) return 0.6;
    return 1.2;
  }

  if (sport === Sport.HANDBALL) {
    if (p.includes("wing") || p.includes("pivot") || p.includes("back")) return 2.6;
    if (p.includes("goalkeeper")) return 0.5;
    return 1.5;
  }

  if (sport === Sport.BASKETBALL) {
    if (p.includes("point guard") || p.includes("shooting guard")) return 2.2;
    if (p.includes("small forward") || p.includes("power forward")) return 1.9;
    if (p.includes("center")) return 1.7;
    return 1.5;
  }

  if (sport === Sport.VOLLEYBALL) {
    if (p.includes("outside hitter") || p.includes("opposite")) return 2.3;
    if (p.includes("middle blocker")) return 1.8;
    if (p.includes("setter")) return 1.2;
    if (p.includes("libero")) return 0.4;
    return 1.1;
  }

  if (sport === Sport.TENNIS) {
    if (p.includes("singles")) return 2;
    if (p.includes("all-court")) return 1.6;
    return 1.2;
  }

  return 1;
}

function distributeMetricByWeight(totalMetric: number, weights: number[]) {
  const sum = weights.reduce((acc, w) => acc + w, 0);
  if (sum <= 0) {
    return weights.map(() => 0);
  }

  const base = weights.map((w) => Math.floor((w / sum) * totalMetric));
  let remainder = totalMetric - base.reduce((acc, v) => acc + v, 0);

  const rankedByWeight = weights
    .map((weight, index) => ({ index, weight }))
    .sort((a, b) => b.weight - a.weight);

  let cursor = 0;
  while (remainder > 0) {
    base[rankedByWeight[cursor % rankedByWeight.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }

  return base;
}

function buildPlayers(team: TeamSeed, totalMetricFromFinishedFixtures: number): PlayerSeed[] {
  const positions = Array.from({ length: team.playerTarget }, (_, index) => {
    if (team.positions.length === 0) return undefined;
    return team.positions[index % team.positions.length];
  });
  const weights = positions.map((position) => getRoleWeight(team.sport, position));
  const playerMetrics = distributeMetricByWeight(totalMetricFromFinishedFixtures, weights);

  return Array.from({ length: team.playerTarget }, (_, index) => {
    const number = index + 1;
    const position = positions[index];
    const baseAppearances =
      team.ageGroup === AgeGroup.SENIOR ? 6 + ((index * 3) % 19) : 4 + ((index * 2) % 15);
    const teamAthleteGender = team.gender === "FEMALE" ? AthleteGender.FEMALE : AthleteGender.MALE;

    return {
      name: buildPlayerName(index, team.name),
      number,
      position: team.sport === Sport.TENNIS ? undefined : position,
      nationality: nationalities[index % nationalities.length],
      appearances: baseAppearances,
      goals: playerMetrics[index],
      singlesRanking: team.sport === Sport.TENNIS ? (team.ageGroup === AgeGroup.SENIOR ? 80 + index * 14 : 220 + index * 19) : undefined,
      doublesRanking: team.sport === Sport.TENNIS ? (team.ageGroup === AgeGroup.SENIOR ? 120 + index * 16 : 280 + index * 22) : undefined,
      imageUrl: getAthleteImageSrc(teamAthleteGender),
      gender: teamAthleteGender,
    };
  });
}

function buildMatchdayLabels(team: TeamSeed) {
  if (team.sport === Sport.TENNIS) {
    return [
      { label: "Round of 16", season: "2025/2026", sport: team.sport },
      { label: "Quarterfinal", season: "2025/2026", sport: team.sport },
      { label: "Semifinal", season: "2025/2026", sport: team.sport },
      { label: "Final", season: "2025/2026", sport: team.sport },
    ];
  }

  return Array.from({ length: 4 }, (_, index) => ({
    label: `Matchday ${index + 1}`,
    season: "2025/2026",
    sport: team.sport,
  }));
}

function buildFixtures(teamId: string, matchdayIds: string[], team: TeamSeed, tennisPlayers: TennisPlayerRef[] = []) {
  const opponentsBySport: Record<Sport, string[]> = {
    FOOTBALL: ["Esperance", "Etoile du Sahel", "CS Sfaxien", "US Monastir", "Stade Tunisien", "CA Bizertin"],
    HANDBALL: ["ES Sahel", "JS Kairouan", "AS Hammamet", "Baath Sporting", "SC Moknine", "EM Mahdia"],
    BASKETBALL: ["US Monastir", "ES Rades", "DS Grombalia", "ES Goulette", "Stade Nabeulien", "JS Manazeh"],
    VOLLEYBALL: ["Esperance", "ESS", "Sfax Railways", "Mouloudia Boussalem", "CO Kelibia", "AS Marsa"],
    TENNIS: ["Marsa TC", "Tunis LTC", "Sousse Open Team", "Nabeul TC", "Bizerte Club", "Monastir Rackets"],
    OTHER: ["Regional Select", "Academy XI", "Invited Club", "Local Rival", "City Team", "Coastal Club"],
  };

  const venues = [
    "Stade El Menzah",
    "Salle de Rades",
    "Salle El Gorjani",
    "Complexe Club Africain",
    "Court Central Club Africain",
    "Away Venue",
  ];

  function buildFinishedScore(sport: Sport, index: number) {
    if (sport === Sport.FOOTBALL) {
      const teamScore = 1 + ((index * 2) % 3);
      const opponentScore = index % 3;
      return { teamScore, opponentScore };
    }

    if (sport === Sport.HANDBALL) {
      const teamScore = 24 + ((index * 4) % 11);
      const opponentScore = 22 + ((index * 3) % 11);
      return { teamScore, opponentScore };
    }

    if (sport === Sport.BASKETBALL) {
      const teamScore = 72 + ((index * 8) % 24);
      const opponentScore = 68 + ((index * 7) % 24);
      return { teamScore, opponentScore };
    }

    if (sport === Sport.VOLLEYBALL) {
      const teamScore = 68 + ((index * 7) % 19);
      const opponentScore = 64 + ((index * 6) % 19);
      return { teamScore, opponentScore };
    }

    if (sport === Sport.TENNIS) {
      const teamScore = 2 + (index % 2);
      const opponentScore = 1 + (index % 2);
      return { teamScore, opponentScore };
    }

    return { teamScore: 2 + (index % 3), opponentScore: 1 + (index % 2) };
  }

  if (team.sport === Sport.TENNIS) {
    const tournamentNames =
      team.ageGroup === AgeGroup.SENIOR
        ? ["ITF Tunis Open", "Roland Garros"]
        : team.competitions.slice(0, 2);
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 24);
    baseDate.setHours(15, 0, 0, 0);
    const selectedPlayers = tennisPlayers.slice(0, 2);

    const tennisRows = tournamentNames.flatMap((tournament, tournamentIndex) => {
      return selectedPlayers.flatMap((playerRef, playerIndex) =>
        Array.from({ length: 4 }, (_, roundIndex) => {
          const kickoffAt = new Date(baseDate);
          kickoffAt.setDate(baseDate.getDate() + tournamentIndex * 14 + roundIndex * 2 + playerIndex);
          kickoffAt.setHours(14 + (roundIndex % 3), 0, 0, 0);

          const finished = tournamentIndex === 0 || roundIndex < 2;
          const isMale = playerRef.gender === AthleteGender.MALE;
          const grandSlam = tournamentIndex === 1 && team.ageGroup === AgeGroup.SENIOR;
          const allowBestOfFive = grandSlam && isMale;
          const homeScore = finished ? (allowBestOfFive ? 3 : 2) : null;
          const awayScore = finished ? (roundIndex % 2) : null;

          const tournamentCategory =
            grandSlam && isMale
              ? TennisTournamentCategory.ATP
              : grandSlam && !isMale
                ? TennisTournamentCategory.WTA
                : TennisTournamentCategory.ITF;

          return {
            teamId,
            playerId: playerRef.id,
            matchdayId: matchdayIds[roundIndex % matchdayIds.length],
            kickoffAt,
            opponent: `${firstNames[(tournamentIndex * 6 + roundIndex * 3 + playerIndex + 5) % firstNames.length]} ${
              lastNames[(tournamentIndex * 7 + roundIndex * 5 + playerIndex + 9) % lastNames.length]
            }`,
            venue: tournament.includes("Junior") ? "Junior Tennis Center" : "Court Central Club Africain",
            isHome: true,
            homeScore,
            awayScore,
            competition: tournament,
            status: finished ? "FINISHED" : "SCHEDULED",
            tournamentCategory,
            tournamentTier: grandSlam ? TournamentTier.GRAND_SLAM : TournamentTier.STANDARD,
          };
        }),
      );
    });

    return tennisRows;
  }

  return Array.from({ length: 6 }, (_, index) => {
    const kickoffAt = new Date();
    kickoffAt.setDate(kickoffAt.getDate() + index * 6 - 12);
    kickoffAt.setHours(17 + (index % 3), 0, 0, 0);

    const finished = index < 3;
    const isHome = index % 2 === 0;
    const finishedScore = finished ? buildFinishedScore(team.sport, index) : null;
    const homeScore = finished
      ? isHome
        ? finishedScore!.teamScore
        : finishedScore!.opponentScore
      : null;
    const awayScore = finished
      ? isHome
        ? finishedScore!.opponentScore
        : finishedScore!.teamScore
      : null;

    return {
      teamId,
      matchdayId: matchdayIds[index % matchdayIds.length],
      kickoffAt,
      opponent: opponentsBySport[team.sport][index % opponentsBySport[team.sport].length],
      venue: venues[index % venues.length],
      isHome,
      homeScore,
      awayScore,
      competition: team.competitions[index % team.competitions.length],
      status: finished ? "FINISHED" : "SCHEDULED",
    };
  });
}

function getTeamMetricFromFinishedFixtures(
  fixtures: Array<{ isHome: boolean; homeScore: number | null; awayScore: number | null; status: string }>,
) {
  return fixtures.reduce((sum, fixture) => {
    if (fixture.status !== "FINISHED" || fixture.homeScore == null || fixture.awayScore == null) {
      return sum;
    }
    return sum + (fixture.isHome ? fixture.homeScore : fixture.awayScore);
  }, 0);
}

async function seedUsers() {
  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? "admin";
  const adminHash = await bcrypt.hash(adminPass, 12);

  await prisma.user.upsert({
    where: { email: "admin@club-africain.tn" },
    create: {
      email: "admin@club-africain.tn",
      name: "Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
    update: { passwordHash: adminHash, role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: "fan@example.com" },
    create: {
      email: "fan@example.com",
      name: "Supporter",
      passwordHash: await bcrypt.hash("Supporter123!", 12),
      role: Role.USER,
    },
    update: {},
  });

  return adminPass;
}

async function seedTeams() {
  for (const teamSeed of teamSeeds) {
    const team = await prisma.team.upsert({
      where: { slug: teamSeed.slug },
      create: {
        slug: teamSeed.slug,
        name: teamSeed.name,
        sport: teamSeed.sport,
        gender: teamSeed.gender,
        category: teamSeed.category,
        ageGroup: teamSeed.ageGroup,
        description: teamSeed.description,
      },
      update: {
        name: teamSeed.name,
        sport: teamSeed.sport,
        gender: teamSeed.gender,
        category: teamSeed.category,
        ageGroup: teamSeed.ageGroup,
        description: teamSeed.description,
      },
    });

    const matchdayIds: string[] = [];
    for (const matchday of buildMatchdayLabels(teamSeed)) {
      const saved = await prisma.matchday.upsert({
        where: {
          label_season_sport: {
            label: matchday.label,
            season: matchday.season,
            sport: matchday.sport,
          },
        },
        create: matchday,
        update: {},
      });
      matchdayIds.push(saved.id);
    }

    await prisma.player.deleteMany({ where: { teamId: team.id } });
    await prisma.staff.deleteMany({ where: { teamId: team.id } });
    await prisma.fixture.deleteMany({ where: { teamId: team.id } });

    const provisionalFixtureRows = buildFixtures(team.id, matchdayIds, teamSeed);
    const finishedFixtureMetric = getTeamMetricFromFinishedFixtures(provisionalFixtureRows);

    await prisma.player.createMany({
      data: buildPlayers(teamSeed, finishedFixtureMetric).map((player) => ({
        teamId: team.id,
        ...player,
      })),
    });

    const tennisPlayers =
      teamSeed.sport === Sport.TENNIS
        ? await prisma.player.findMany({
            where: { teamId: team.id },
            select: { id: true, gender: true },
            orderBy: { name: "asc" },
          })
        : [];

    const fixtureRows = buildFixtures(team.id, matchdayIds, teamSeed, tennisPlayers);

    await prisma.staff.createMany({
      data: teamSeed.staff.map((staff) => ({
        teamId: team.id,
        name: staff.name,
        role: staff.role,
      })),
    });

    await prisma.fixture.createMany({
      data: fixtureRows,
    });
  }
}

async function seedProducts() {
  for (const productSeed of productSeeds) {
    const { imageUrls, ...productData } = productSeed;
    const product = await prisma.product.upsert({
      where: { slug: productSeed.slug },
      create: {
        ...productData,
        sport: productSeed.sport,
        imageUrl: imageUrls[0] ?? null,
        active: true,
      },
      update: {
        name: productSeed.name,
        description: productSeed.description,
        priceCents: productSeed.priceCents,
        category: productSeed.category,
        merchType: productSeed.merchType,
        sport: productSeed.sport,
        sizeOptions: productSeed.sizeOptions,
        stock: productSeed.stock,
        imageUrl: imageUrls[0] ?? null,
        active: true,
      },
    });

    await prisma.productSizeStock.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    await prisma.productSizeStock.createMany({
      data: productSeed.sizeOptions.map((sizeOption, index) => ({
        productId: product.id,
        sizeOption,
        stock: Math.max(1, Math.floor(productSeed.stock / productSeed.sizeOptions.length) + (index % 2)),
      })),
    });

    await prisma.productImage.createMany({
      data: imageUrls.map((urlValue, index) => ({
        productId: product.id,
        url: urlValue,
        altText: `${productSeed.name} image ${index + 1}`,
        sortOrder: index,
        isCover: index === 0,
      })),
    });
  }
}

async function main() {
  const adminPass = await seedUsers();
  await seedTeams();
  await seedProducts();

  console.log(
    `Seed OK. Users ready, ${teamSeeds.length} teams populated, ${productSeeds.length} products available. Admin: admin@club-africain.tn / ${adminPass}`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
