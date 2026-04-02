import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const placeholderSlugs = ["maillot-domicile", "echarpe"];

  const products = await prisma.product.findMany({
    where: { slug: { in: placeholderSlugs } },
    select: { id: true, slug: true, name: true },
  });

  if (products.length === 0) {
    console.log("No placeholder products found.");
    return;
  }

  const ids = products.map((p) => p.id);

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { productId: { in: ids } } });
    await tx.orderItem.deleteMany({ where: { productId: { in: ids } } });
    await tx.product.deleteMany({ where: { id: { in: ids } } });
  });

  console.log("Removed placeholder products:", products.map((p) => `${p.slug} (${p.name})`).join(", "));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
