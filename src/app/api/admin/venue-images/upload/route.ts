import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getExt(fileName: string) {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1) return "";
  const ext = fileName.slice(idx).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext) ? ext : "";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const venueId = form.get("venueId");
  const file = form.get("file");

  if (typeof venueId !== "string" || !venueId) {
    return NextResponse.json({ error: "Missing venueId" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  // Verify venue exists
  const venue = await prisma.clubVenue.findUnique({ where: { id: venueId }, select: { id: true } });
  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const ext = getExt(file.name);
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "venues", venueId);
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  await fs.writeFile(path.join(uploadsDir, filename), bytes);
  const url = `/uploads/venues/${venueId}/${filename}`;

  // Count existing images to set sortOrder
  const count = await prisma.clubVenueImage.count({ where: { venueId } });
  const isCover = count === 0; // first image is automatically the cover

  const image = await prisma.clubVenueImage.create({
    data: { venueId, url, sortOrder: count, isCover },
  });

  return NextResponse.json({ url, id: image.id, isCover });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const image = await prisma.clubVenueImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.clubVenueImage.delete({ where: { id } });

  // If deleted image was the cover, promote the next image
  if (image.isCover) {
    const next = await prisma.clubVenueImage.findFirst({
      where: { venueId: image.venueId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.clubVenueImage.update({ where: { id: next.id }, data: { isCover: true } });
      // Also update the parent venue's legacy imageUrl
      await prisma.clubVenue.update({ where: { id: image.venueId }, data: { imageUrl: next.url } });
    } else {
      await prisma.clubVenue.update({ where: { id: image.venueId }, data: { imageUrl: null } });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const image = await prisma.clubVenueImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Unset all covers for this venue then set the new one
  await prisma.clubVenueImage.updateMany({
    where: { venueId: image.venueId },
    data: { isCover: false },
  });
  await prisma.clubVenueImage.update({ where: { id }, data: { isCover: true } });
  // Sync legacy imageUrl
  await prisma.clubVenue.update({ where: { id: image.venueId }, data: { imageUrl: image.url } });

  return NextResponse.json({ ok: true });
}
