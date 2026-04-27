import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { Sport, AthleteGender } from '../src/generated/prisma/enums';

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");
const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  console.log("Cleaning up existing players...");
  await prisma.player.deleteMany({});

  const teams = await prisma.team.findMany();
  if (teams.length === 0) {
    console.log("No teams found. Please run the main club seed script first.");
    return;
  }

  const findTeam = (sport: Sport, gender: AthleteGender) => {
    return teams.find(t => t.sport === sport && t.gender === gender && t.ageGroup === "SENIOR")?.id;
  };

  const footballMenId = findTeam("FOOTBALL", "MALE");
  const footballWomenId = findTeam("FOOTBALL", "FEMALE");
  const handballMenId = findTeam("HANDBALL", "MALE");
  const basketballMenId = findTeam("BASKETBALL", "MALE");
  const volleyballMenId = findTeam("VOLLEYBALL", "MALE");

  const playersData = [];

  // FULL ACCURATE SQUAD: Football Men 2024/2025
  if (footballMenId) {
    playersData.push(
      // Keepers
      { teamId: footballMenId, number: 16, name: "Ghaith Yeferni", position: "Gardien", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 22, name: "Wassim Maghzaoui", position: "Gardien", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 23, name: "Mouez Hassen", position: "Gardien", nationality: "TN", gender: "MALE", isActive: true },
      // Defenders
      { teamId: footballMenId, number: 2, name: "Yassine Bouabid", position: "Défenseur central", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 6, name: "Kenneth Semakula", position: "Défenseur central", nationality: "UG", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 15, name: "Willes Tene Didof", position: "Arrière gauche", nationality: "CM", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 17, name: "Ghaith Zaalouni", position: "Arrière Droit", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 26, name: "Rami Bedoui", position: "Défenseur central", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 27, name: "Hamza Ben Abda", position: "Défenseur central", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 32, name: "Taoufik Cherifi", position: "Défenseur central", nationality: "DZ", gender: "MALE", isActive: true },
      // Midfielders
      { teamId: footballMenId, number: 5, name: "Ahmed Khalil", position: "Milieu", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 8, name: "Ghaith Sghaier", position: "Milieu", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 11, name: "Moataz Zemzemi", position: "Milieu offensif", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 20, name: "Yassine Dridi", position: "Milieu", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 21, name: "Bilel Ait Malek", position: "Milieu offensif", nationality: "DZ", gender: "MALE", isActive: true },
      // Forwards
      { teamId: footballMenId, number: 7, name: "Adem Garreb", position: "Ailier", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 9, name: "Kingsley Eduwo", position: "Attaquant", nationality: "NG", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 13, name: "Hamza Khadraoui", position: "Ailier gauche", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 19, name: "Bassem Srarfi", position: "Ailier droit", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: footballMenId, number: 28, name: "Hamdi Labidi", position: "Attaquant", nationality: "TN", gender: "MALE", isActive: true },
      
      // Legends (Inactive)
      { teamId: footballMenId, number: 13, name: "Wissem Ben Yahia", position: "Milieu", nationality: "TN", gender: "MALE", isActive: false },
      { teamId: footballMenId, number: 14, name: "Lassaad Ouertani", position: "Milieu", nationality: "TN", gender: "MALE", isActive: false },
      { teamId: footballMenId, number: 9, name: "Adel Sellimi", position: "Attaquant", nationality: "TN", gender: "MALE", isActive: false }
    );
  }

  // Football Women
  if (footballWomenId) {
    playersData.push(
      { teamId: footballWomenId, number: 10, name: "Chaima Abbassi", position: "Attaquante", nationality: "TN", gender: "FEMALE", isActive: true },
      { teamId: footballWomenId, number: 6, name: "Imen Troudi", position: "Milieu", nationality: "TN", gender: "FEMALE", isActive: true }
    );
  }

  // Handball Men
  if (handballMenId) {
    playersData.push(
      { teamId: handballMenId, number: 7, name: "Oussama Rmiki", position: "Demi-centre", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: handballMenId, number: 9, name: "Alaa Mustapha", position: "Arrière", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: handballMenId, number: 1, name: "Makram Missaoui", position: "Gardien", nationality: "TN", gender: "MALE", isActive: false }
    );
  }

  // Basketball Men
  if (basketballMenId) {
    playersData.push(
      { teamId: basketballMenId, number: 5, name: "Omar Abada", position: "Meneur", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: basketballMenId, number: 2, name: "Mourad El Mabrouk", position: "Arrière", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: basketballMenId, number: 12, name: "Naim Dhifallah", position: "Ailier fort", nationality: "TN", gender: "MALE", isActive: false }
    );
  }

  // Volleyball Men
  if (volleyballMenId) {
    playersData.push(
      { teamId: volleyballMenId, number: 14, name: "Houssem Eddine Jouini", position: "Réceptionneur", nationality: "TN", gender: "MALE", isActive: true },
      { teamId: volleyballMenId, number: 8, name: "Marouane Garci", position: "Pointu", nationality: "TN", gender: "MALE", isActive: false }
    );
  }

  console.log(`Inserting ${playersData.length} real players (active and inactive)...`);

  for (const p of playersData) {
    await prisma.player.create({
      data: {
        teamId: p.teamId,
        number: p.number,
        name: p.name,
        position: p.position,
        nationality: p.nationality,
        gender: p.gender as AthleteGender,
        isActive: p.isActive,
      }
    });
  }

  console.log("✅ Real players seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => {});
  });
