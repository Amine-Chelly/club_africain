import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");
const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const allTitles = await prisma.clubTitle.findMany();
  
  // Find a canonical image for each sport + competition combo
  const canonicalImages: Record<string, string> = {};
  
  for (const title of allTitles) {
    if (title.imageUrl) {
      // Use the first image we find as the canonical one for this competition
      const key = `${title.sport}_${title.competition}`;
      if (!canonicalImages[key]) {
        canonicalImages[key] = title.imageUrl;
      }
    }
  }

  const keysWithImages = Object.keys(canonicalImages);
  if (keysWithImages.length === 0) {
    console.log("No uploaded trophy images found. Nothing to sync.");
    return;
  }

  console.log(`Found images for: \n${keysWithImages.map(k => `  - ${k.replace('_', ' ')}`).join('\n')}`);

  let updatedCount = 0;
  
  // Apply the canonical image to all other titles of the same competition
  for (const title of allTitles) {
    const key = `${title.sport}_${title.competition}`;
    const imageToShare = canonicalImages[key];
    
    if (imageToShare && title.imageUrl !== imageToShare) {
      await prisma.clubTitle.update({
        where: { id: title.id },
        data: { imageUrl: imageToShare },
      });
      console.log(`[SYNCED] ${title.year} ${title.competition} (${title.sport}) -> shared image applied`);
      updatedCount++;
    }
  }
  
  console.log(`\n✅ Done! Synced ${updatedCount} similar trophies.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
