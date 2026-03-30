import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { AgeGroup, MerchType, Role, Sport, TeamCategory } from "../src/generated/prisma/enums";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL required for seed");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeAdmin123!";
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

  const footballSenior = await prisma.team.upsert({
    where: { slug: "football-seniors" },
    create: {
      slug: "football-seniors",
      name: "Football — Seniors",
      sport: Sport.FOOTBALL,
      category: TeamCategory.TEAM_SPORT,
      ageGroup: AgeGroup.SENIOR,
      description: "Équipe première — données mock.",
    },
    update: {},
  });

  const footballSeniorMatchday = await prisma.matchday.upsert({
    where: { label_season_sport: { label: "Journée 1", season: "2025/2026", sport: Sport.FOOTBALL } },
    create: { label: "Journée 1", season: "2025/2026", sport: Sport.FOOTBALL },
    update: {},
  });

  await prisma.player.deleteMany({ where: { teamId: footballSenior.id } });
  await prisma.player.createMany({
    data: [
      {
        teamId: footballSenior.id,
        name: "Joueur A",
        number: 10,
        position: "Attaquant",
        nationality: "TN",
        appearances: 12,
        goals: 5,
      },
      {
        teamId: footballSenior.id,
        name: "Joueur B",
        number: 1,
        position: "Gardien",
        nationality: "TN",
        appearances: 14,
        goals: 0,
      },
    ],
  });

  await prisma.staff.deleteMany({ where: { teamId: footballSenior.id } });
  await prisma.staff.createMany({
    data: [
      { teamId: footballSenior.id, name: "Coach Principal", role: "Entraîneur" },
      { teamId: footballSenior.id, name: "Adjoint", role: "Adjoint" },
    ],
  });

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.fixture.deleteMany({ where: { teamId: footballSenior.id } });
  await prisma.fixture.createMany({
    data: [
      {
        teamId: footballSenior.id,
        matchdayId: footballSeniorMatchday.id,
        kickoffAt: nextMonth,
        opponent: "Adversaire SC",
        venue: "Stade El Menzah",
        isHome: true,
        competition: "Championnat",
        status: "SCHEDULED",
      },
      {
        teamId: footballSenior.id,
        matchdayId: footballSeniorMatchday.id,
        kickoffAt: new Date(Date.now() - 86400000 * 7),
        opponent: "Rival FC",
        venue: "Extérieur",
        isHome: false,
        homeScore: 1,
        awayScore: 2,
        competition: "Coupe",
        status: "FINISHED",
      },
    ],
  });

  const products = [
    {
      slug: "maillot-domicile",
      name: "Maillot domicile",
      description: "Maillot officiel domicile (mock).",
      priceCents: 12000,
      category: "Maillots",
      merchType: MerchType.JERSEY,
      sport: Sport.FOOTBALL,
      sizeOptions: ["XS", "S", "M", "L", "XL"],
      stock: 50,
    },
    {
      slug: "echarpe",
      name: "Écharpe",
      description: "Écharpe aux couleurs du club.",
      priceCents: 2500,
      category: "Accessoires",
      merchType: MerchType.SCARF,
      sport: Sport.OTHER,
      sizeOptions: ["OS"],
      stock: 120,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: { ...p, active: true },
      update: {
        priceCents: p.priceCents,
        stock: p.stock,
        active: true,
        merchType: p.merchType,
        sport: p.sport,
        sizeOptions: p.sizeOptions,
      },
    });
  }

  console.log("Seed OK. Admin:", "admin@club-africain.tn /", adminPass);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
