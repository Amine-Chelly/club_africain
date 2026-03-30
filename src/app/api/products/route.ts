import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MerchType, Sport } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") ?? "").trim();
  const sportRaw = (sp.get("sport") ?? "").trim();
  const merchTypeRaw = (sp.get("merchType") ?? "").trim();

  const sports = Object.values(Sport) as Sport[];
  const merchTypes = Object.values(MerchType) as MerchType[];

  const sportFilter = sports.includes(sportRaw as Sport) ? (sportRaw as Sport) : null;
  const merchTypeFilter = merchTypes.includes(merchTypeRaw as MerchType) ? (merchTypeRaw as MerchType) : null;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(sportFilter ? { sport: sportFilter } : {}),
      ...(merchTypeFilter ? { merchType: merchTypeFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      priceCents: true,
      imageUrl: true,
      stock: true,
      merchType: true,
      sport: true,
      sizeOptions: true,
    },
  });
  return NextResponse.json({ products });
}
