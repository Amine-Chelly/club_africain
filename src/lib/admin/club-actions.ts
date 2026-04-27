"use server";



import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role, Sport } from "@/generated/prisma/enums";

const sportValues = Object.values(Sport) as [Sport, ...Sport[]];

async function requireAdmin(locale: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect(`/${locale}/auth/signin`);
  }
}

const localeFromForm = (fd: FormData) => {
  const v = String(fd.get("locale") ?? "en");
  return v === "fr" || v === "ar" ? v : "en";
};

// ─── History ──────────────────────────────────────

export async function upsertClubHistoryAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  await requireAdmin(locale);

  const sport = z.enum(sportValues).parse(formData.get("sport"));
  const body = z.string().trim().min(1).max(20000).parse(formData.get("body"));

  await prisma.clubSportHistory.upsert({
    where: { sport },
    create: { sport, body },
    update: { body },
  });

  revalidatePath("/");
  redirect(`/${locale}/admin/club`);
}

// ─── Titles ───────────────────────────────────────

export async function createClubTitleAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  await requireAdmin(locale);

  const sport = z.enum(sportValues).parse(formData.get("sport"));
  const competition = z.string().trim().min(1).max(200).parse(formData.get("competition"));
  const year = z.coerce.number().int().min(1900).max(2100).parse(formData.get("year"));
  const detail = z.string().trim().max(300).optional().parse(
    formData.get("detail") ? String(formData.get("detail")).trim() || undefined : undefined
  );

  const maxOrder = await prisma.clubTitle.aggregate({ where: { sport }, _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  await prisma.clubTitle.create({ data: { sport, competition, year, detail, sortOrder } });
  revalidatePath("/");
  redirect(`/${locale}/admin/club/${sport}/titles`);
}

export async function deleteClubTitleAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  await requireAdmin(locale);

  const id = z.string().min(1).parse(formData.get("id"));
  const sport = z.enum(sportValues).parse(formData.get("sport"));

  await prisma.clubTitle.delete({ where: { id } });
  revalidatePath("/");
  redirect(`/${locale}/admin/club/${sport}/titles`);
}

// ─── Venue ────────────────────────────────────────

export async function upsertClubVenueAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  await requireAdmin(locale);

  const sport = z.enum(sportValues).parse(formData.get("sport"));
  const name = z.string().trim().min(1).max(200).parse(formData.get("name"));
  const city = z.string().trim().min(1).max(100).parse(formData.get("city"));
  const capacityRaw = formData.get("capacity");
  const capacity = capacityRaw && String(capacityRaw).trim()
    ? z.coerce.number().int().min(0).parse(capacityRaw)
    : null;
  const imageUrl = formData.get("imageUrl") ? String(formData.get("imageUrl")).trim() || null : null;
  const notes = formData.get("notes") ? String(formData.get("notes")).trim() || null : null;

  await prisma.clubVenue.upsert({
    where: { sport },
    create: { sport, name, city, capacity, imageUrl, notes },
    update: { name, city, capacity, imageUrl, notes },
  });

  revalidatePath("/");
  redirect(`/${locale}/admin/club`);
}
