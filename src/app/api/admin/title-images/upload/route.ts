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
  const titleId = form.get("titleId");
  const file = form.get("file");

  if (typeof titleId !== "string" || !titleId) {
    return NextResponse.json({ error: "Missing titleId" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const title = await prisma.clubTitle.findUnique({ where: { id: titleId }, select: { id: true } });
  if (!title) {
    return NextResponse.json({ error: "Title not found" }, { status: 404 });
  }

  const ext = getExt(file.name);
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "titles");
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  await fs.writeFile(path.join(uploadsDir, filename), bytes);
  const url = `/uploads/titles/${filename}`;

  await prisma.clubTitle.update({ where: { id: titleId }, data: { imageUrl: url } });

  return NextResponse.json({ url });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.clubTitle.update({ where: { id }, data: { imageUrl: null } });
  return NextResponse.json({ ok: true });
}
