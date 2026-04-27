import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { Sport, FixturePlayerEventType, AthleteGender } from '../src/generated/prisma/enums';

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");
const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

const randElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log("Cleaning up existing fixtures and matchdays...");
  await prisma.matchday.deleteMany({});
  await prisma.fixture.deleteMany({});
  await prisma.fixturePlayerStat.deleteMany({});
  await prisma.fixturePlayerEvent.deleteMany({});

  const teams = await prisma.team.findMany({ include: { players: true } });

  const getOpponents = (sport: Sport) => {
    switch (sport) {
      case "FOOTBALL": return ["EST", "ESS", "CSS", "OB", "ST", "US Monastir", "CA Bizerte"];
      case "HANDBALL": return ["EST", "ESS", "EM Mahdia", "CS Sakiet Ezzit", "SC Moknine"];
      case "BASKETBALL": return ["US Monastir", "SN Nabeul", "ES Rades", "DS Grombalia", "JS Kairouan"];
      case "VOLLEYBALL": return ["EST", "CSS", "ESS", "MS Sidi Bou Said", "CO Kelibia"];
      case "TENNIS": return ["TC Tunis", "TC Hammamet", "AS Marsa", "TC Carthage"];
      default: return ["Team A", "Team B", "Team C"];
    }
  };

  for (const team of teams) {
    console.log(`Seeding fixtures for ${team.name}...`);
    
    // Explicit branch for Football Senior Men (accurately hardcoded 24/25 fixtures)
    if (team.sport === "FOOTBALL" && team.gender === "MALE" && team.ageGroup === "SENIOR") {
      const activePlayers = team.players.filter(p => p.isActive);
      const findPl = (name: string) => activePlayers.find(p => p.name.includes(name));

      const fixturesDetails = [
        { round: 1, opponent: "US Ben Guerdane", isHome: false, homeScore: 0, awayScore: 2, scorers: ["Kingsley Eduwo", "Bilel Ait Malek"] },
        { round: 2, opponent: "JS Omrane", isHome: true, homeScore: 2, awayScore: 0, scorers: ["Hamza Khadraoui", "Kingsley Eduwo"] },
        { round: 3, opponent: "ES Zarzis", isHome: false, homeScore: 0, awayScore: 0, scorers: [] },
        { round: 4, opponent: "Avenir de Gabès", isHome: true, homeScore: 2, awayScore: 0, scorers: ["Bassem Srarfi", "Bilel Ait Malek"] },
      ];

      for (const fd of fixturesDetails) {
        const matchday = await prisma.matchday.upsert({
          where: { label_season_sport: { label: `Journée ${fd.round}`, season: "2025/2026", sport: "FOOTBALL" } },
          update: {},
          create: { label: `Journée ${fd.round}`, season: "2025/2026", sport: "FOOTBALL", type: "LEAGUE" }
        });

        const kickoffAt = new Date();
        kickoffAt.setDate(kickoffAt.getDate() - (30 - fd.round * 7));

        const fixture = await prisma.fixture.create({
          data: {
            teamId: team.id,
            matchdayId: matchday.id,
            kickoffAt,
            opponent: fd.opponent,
            venue: fd.isHome ? "Stade Hammadi Agrebi" : `Stade ${fd.opponent}`,
            isHome: fd.isHome,
            homeScore: fd.homeScore,
            awayScore: fd.awayScore,
            competition: "Ligue Professionnelle 1",
            status: "FINISHED",
          }
        });

        // Add appearances for standard starting XI roughly
        const starters = activePlayers.slice(0, 14); // 11 + 3 subs
        for (const player of starters) {
          await prisma.fixturePlayerEvent.create({ data: { fixtureId: fixture.id, playerId: player.id, type: "APPEARANCE" } });
        }

        // Add specific goals based on the accurate real life match
        for (const scorerName of fd.scorers) {
          const scorer = findPl(scorerName);
          if (scorer) {
            await prisma.fixturePlayerEvent.create({ data: { fixtureId: fixture.id, playerId: scorer.id, type: "GOAL" } });
            await prisma.fixturePlayerStat.create({ data: { fixtureId: fixture.id, playerId: scorer.id, count: 1 } });
          }
        }
      }
      continue; // Skip the random generation for this specific team
    }


    // RANDOM GENERATION for all other teams below
    const opponents = getOpponents(team.sport as Sport);
    const suffix = team.ageGroup === "SENIOR" ? "Pro" : team.ageGroup;
    const g = team.gender === "FEMALE" ? " Féminin" : "";
    const competition = team.sport === "FOOTBALL" ? `Championnat de Tunisie ${suffix}${g}` : 
                        team.sport === "HANDBALL" ? `Nationale A ${suffix}${g}` :
                        team.sport === "BASKETBALL" ? `Championnat Pro A ${suffix}${g}` :
                        team.sport === "VOLLEYBALL" ? `Nationale A ${suffix}${g}` : 
                        `Tournoi Inter-clubs ${suffix}${g}`;

    const scoresType = ["BASKETBALL", "VOLLEYBALL", "TENNIS"].includes(team.sport as string) ? "POINT" : "GOAL";

    for (let round = 1; round <= 4; round++) {
      const matchday = await prisma.matchday.upsert({
        where: { label_season_sport: { label: `Journée ${round} - ${team.ageGroup}`, season: "2025/2026", sport: team.sport as Sport } },
        update: {},
        create: {
          label: `Journée ${round} - ${team.ageGroup}`,
          season: "2025/2026",
          sport: team.sport as Sport,
          type: "LEAGUE",
        }
      });

      const isHome = randInt(0, 1) === 0;
      const opponent = randElement(opponents);
      
      let homeScore, awayScore;
      if (team.sport === 'TENNIS') {
          homeScore = randInt(0, 3);
          awayScore = randInt(0, 3);
      } else if (team.sport === 'BASKETBALL') {
          homeScore = randInt(60, 100);
          awayScore = randInt(60, 100);
      } else if (team.sport === 'VOLLEYBALL') {
          homeScore = randInt(0, 3);
          awayScore = randInt(0, 3);
      } else if (team.sport === 'HANDBALL') {
          homeScore = randInt(20, 35);
          awayScore = randInt(20, 35);
      } else {
          homeScore = randInt(0, 3);
          awayScore = randInt(0, 3);
      }

      const kickoffAt = new Date();
      kickoffAt.setDate(kickoffAt.getDate() - (15 - round * 3));

      const fixture = await prisma.fixture.create({
        data: {
          teamId: team.id,
          matchdayId: matchday.id,
          kickoffAt,
          opponent,
          venue: isHome ? "Parc A / Salle Cherif Bellamine" : `Salle ${opponent}`,
          isHome,
          homeScore: isHome ? homeScore : awayScore,
          awayScore: isHome ? awayScore : homeScore,
          competition,
          status: "FINISHED",
        }
      });

      const activePlayers = team.players.filter(p => p.isActive);
      if (activePlayers.length === 0) continue;
      
      const playersToPlay = Math.max(1, activePlayers.length - randInt(0, 2));
      const involvedPlayers = activePlayers.slice(0, playersToPlay);

      for (const player of involvedPlayers) {
        await prisma.fixturePlayerEvent.create({ data: { fixtureId: fixture.id, playerId: player.id, type: "APPEARANCE" } });

        const scoreCount = randInt(0, scoresType === "POINT" ? 25 : 1);
        if (scoreCount > 0) {
          for (let s = 0; s < scoreCount; s++) {
            await prisma.fixturePlayerEvent.create({ data: { fixtureId: fixture.id, playerId: player.id, type: scoresType as FixturePlayerEventType } });
          }
          await prisma.fixturePlayerStat.create({ data: { fixtureId: fixture.id, playerId: player.id, count: scoreCount } });
        }
      }
    }
  }

  console.log("✅ Fixtures seeded for ALL sections.");
  console.log("Running stat reconciliation...");
  
  for (const team of teams) {
    if (team.players.length === 0) continue;
    for (const player of team.players) {
      const appearances = await prisma.fixturePlayerEvent.count({ where: { playerId: player.id, type: "APPEARANCE" } });
      const goalsOrPoints = await prisma.fixturePlayerEvent.count({ where: { playerId: player.id, type: { in: ["GOAL", "POINT"] } } });
      
      await prisma.player.update({ where: { id: player.id }, data: { appearances, goals: goalsOrPoints } });
    }
  }
  console.log("✅ Player totals reconciled.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => {});
  });
