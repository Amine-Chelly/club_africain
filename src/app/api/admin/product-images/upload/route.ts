import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getExt(fileName: string) {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1) return "";
  const ext = fileName.slice(idx).toLowerCase();
  // Basic allowlist; admin can still upload other formats if you extend this.
  return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext) ? ext : "";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const productId = form.get("productId");
  const file = form.get("file");

  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const ext = getExt(file.name);
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "products", productId);
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  await fs.writeFile(path.join(uploadsDir, filename), bytes);

  const url = `/uploads/products/${productId}/${filename}`;
  return NextResponse.json({ url });
}

