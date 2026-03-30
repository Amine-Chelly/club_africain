"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  AgeGroup,
  OrderStatus,
  Role,
  Sport,
  TeamCategory,
} from "@/generated/prisma/enums";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{3,80}$/, "Slug invalide");

const descriptionSchema = z.string().trim().min(1, "Description requise").max(6000);

const stockSchema = z.coerce.number().int().min(0).max(1_000_000);
const priceTndSchema = z.coerce.number().nonnegative().max(1_000_000);
const intMin0Schema = z.coerce.number().int().min(0).max(100_000);

const activeSchema = z
  .string()
  .optional()
  .transform((v) => (v === "on" ? true : false));

const localeFromForm = (formData: FormData) => {
  const locale = formData.get("locale");
  if (!locale) throw new Error("Locale manquant");
  return String(locale);
};

async function requireAdmin(locale: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/admin`);
  }
  return session.user.id;
}

async function audit(
  level: "info" | "warn" | "error",
  action: string,
  userId: string,
  meta?: unknown
) {
  // Keep audit log resilient; don’t fail the whole request if logging errors.
  try {
    await prisma.auditLog.create({
      data: {
        level,
        action,
        userId,
        meta: (meta ?? undefined) as any,
      },
    });
  } catch (e) {
    logger.warn({ action: "auditlog_failed", error: e });
  }
}

function redirectAdmin(locale: string, path: string) {
  redirect(`/${locale}${path}`);
}

const teamSportValues = Object.values(Sport) as Sport[];
const teamCategoryValues = Object.values(TeamCategory) as TeamCategory[];
const ageGroupValues = Object.values(AgeGroup) as AgeGroup[];

const productCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(120),
  description: descriptionSchema,
  category: z.string().trim().min(1).max(80),
  priceTnd: priceTndSchema,
  imageUrl: z.string().trim().max(2000).optional().or(z.literal("")).optional(),
  stock: stockSchema,
  active: activeSchema,
});

const productUpdateSchema = productCreateSchema.extend({
  id: z.string().min(1),
});

export async function createProductAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = productCreateSchema.parse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    priceTnd: formData.get("priceTnd"),
    imageUrl: formData.get("imageUrl"),
    stock: formData.get("stock"),
    active: formData.get("active"),
  });

  const created = await prisma.product.create({
    data: {
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      category: parsed.category,
      priceCents: Math.round(parsed.priceTnd * 100),
      imageUrl: parsed.imageUrl ? parsed.imageUrl : null,
      stock: parsed.stock,
      active: parsed.active,
    },
    select: { id: true },
  });

  await audit("info", "admin.product.create", userId, { productId: created.id });
  redirectAdmin(locale, "/admin/products");
}

export async function updateProductAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = productUpdateSchema.parse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    priceTnd: formData.get("priceTnd"),
    imageUrl: formData.get("imageUrl"),
    stock: formData.get("stock"),
    active: formData.get("active"),
  });

  await prisma.product.update({
    where: { id: parsed.id },
    data: {
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      category: parsed.category,
      priceCents: Math.round(parsed.priceTnd * 100),
      imageUrl: parsed.imageUrl ? parsed.imageUrl : null,
      stock: parsed.stock,
      active: parsed.active,
    },
  });

  await audit("info", "admin.product.update", userId, { productId: parsed.id });
  redirectAdmin(locale, "/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);
  const id = z.string().min(1).parse(formData.get("id"));

  await prisma.product.delete({ where: { id } });
  await audit("warn", "admin.product.delete", userId, { productId: id });
  redirectAdmin(locale, "/admin/products");
}

const teamCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(140),
  sport: z.enum(teamSportValues as [Sport, ...Sport[]]),
  category: z.enum(teamCategoryValues as [TeamCategory, ...TeamCategory[]]),
  ageGroup: z.enum(ageGroupValues as [AgeGroup, ...AgeGroup[]]),
  description: z.string().trim().optional(),
});

const teamUpdateSchema = teamCreateSchema.extend({
  id: z.string().min(1),
});

export async function createTeamAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = teamCreateSchema.parse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    sport: formData.get("sport"),
    category: formData.get("category"),
    ageGroup: formData.get("ageGroup"),
    description: formData.get("description"),
  });

  await prisma.team.create({
    data: {
      slug: parsed.slug,
      name: parsed.name,
      sport: parsed.sport,
      category: parsed.category,
      ageGroup: parsed.ageGroup,
      description: parsed.description ? parsed.description : null,
    },
  });

  await audit("info", "admin.team.create", userId, { slug: parsed.slug });
  redirectAdmin(locale, "/admin/teams");
}

export async function updateTeamAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = teamUpdateSchema.parse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    sport: formData.get("sport"),
    category: formData.get("category"),
    ageGroup: formData.get("ageGroup"),
    description: formData.get("description"),
  });

  await prisma.team.update({
    where: { id: parsed.id },
    data: {
      slug: parsed.slug,
      name: parsed.name,
      sport: parsed.sport,
      category: parsed.category,
      ageGroup: parsed.ageGroup,
      description: parsed.description ? parsed.description : null,
    },
  });

  await audit("info", "admin.team.update", userId, { teamId: parsed.id });
  redirectAdmin(locale, "/admin/teams");
}

export async function deleteTeamAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);
  const id = z.string().min(1).parse(formData.get("id"));

  await prisma.team.delete({ where: { id } });
  await audit("warn", "admin.team.delete", userId, { teamId: id });
  redirectAdmin(locale, "/admin/teams");
}

const playerCreateSchema = z.object({
  teamId: z.string().min(1),
  name: z.string().trim().min(1).max(140),
  number: z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().min(0).max(200).optional()
    ),
  position: z.string().trim().max(60).optional(),
  nationality: z.string().trim().max(3).optional(),
  appearances: intMin0Schema.optional().default(0),
  goals: intMin0Schema.optional().default(0),
});

const playerUpdateSchema = playerCreateSchema.extend({
  id: z.string().min(1),
});

export async function createPlayerAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = playerCreateSchema.parse({
    teamId: formData.get("teamId"),
    name: formData.get("name"),
    number: formData.get("number"),
    position: formData.get("position"),
    nationality: formData.get("nationality"),
    appearances: formData.get("appearances"),
    goals: formData.get("goals"),
  });

  await prisma.player.create({
    data: {
      teamId: parsed.teamId,
      name: parsed.name,
      number: parsed.number ?? null,
      position: parsed.position || null,
      nationality: parsed.nationality || null,
      appearances: parsed.appearances,
      goals: parsed.goals,
    },
  });

  await audit("info", "admin.player.create", userId, { teamId: parsed.teamId });
  redirectAdmin(locale, `/admin/teams/${parsed.teamId}/players`);
}

export async function updatePlayerAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = playerUpdateSchema.parse({
    id: formData.get("id"),
    teamId: formData.get("teamId"),
    name: formData.get("name"),
    number: formData.get("number"),
    position: formData.get("position"),
    nationality: formData.get("nationality"),
    appearances: formData.get("appearances"),
    goals: formData.get("goals"),
  });

  const existing = await prisma.player.findUnique({ where: { id: parsed.id } });
  if (!existing || existing.teamId !== parsed.teamId) {
    redirectAdmin(locale, `/admin/teams/${parsed.teamId}/players`);
  }

  await prisma.player.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      number: parsed.number ?? null,
      position: parsed.position || null,
      nationality: parsed.nationality || null,
      appearances: parsed.appearances,
      goals: parsed.goals,
    },
  });

  await audit("info", "admin.player.update", userId, { playerId: parsed.id });
  redirectAdmin(locale, `/admin/teams/${parsed.teamId}/players`);
}

export async function deletePlayerAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const id = z.string().min(1).parse(formData.get("id"));
  const teamId = z.string().min(1).parse(formData.get("teamId"));
  const existing = await prisma.player.findUnique({ where: { id } });
  if (existing?.teamId !== teamId) redirectAdmin(locale, `/admin/teams/${teamId}/players`);

  await prisma.player.delete({ where: { id } });
  await audit("warn", "admin.player.delete", userId, { playerId: id, teamId });
  redirectAdmin(locale, `/admin/teams/${teamId}/players`);
}

const staffCreateSchema = z.object({
  teamId: z.string().min(1),
  name: z.string().trim().min(1).max(140),
  role: z.string().trim().min(1).max(120),
});

const staffUpdateSchema = staffCreateSchema.extend({
  id: z.string().min(1),
});

export async function createStaffAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = staffCreateSchema.parse({
    teamId: formData.get("teamId"),
    name: formData.get("name"),
    role: formData.get("role"),
  });

  await prisma.staff.create({
    data: { teamId: parsed.teamId, name: parsed.name, role: parsed.role },
  });

  await audit("info", "admin.staff.create", userId, { teamId: parsed.teamId });
  redirectAdmin(locale, `/admin/teams/${parsed.teamId}/staff`);
}

export async function updateStaffAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = staffUpdateSchema.parse({
    id: formData.get("id"),
    teamId: formData.get("teamId"),
    name: formData.get("name"),
    role: formData.get("role"),
  });

  const existing = await prisma.staff.findUnique({ where: { id: parsed.id } });
  if (!existing || existing.teamId !== parsed.teamId) {
    redirectAdmin(locale, `/admin/teams/${parsed.teamId}/staff`);
  }

  await prisma.staff.update({
    where: { id: parsed.id },
    data: { name: parsed.name, role: parsed.role },
  });

  await audit("info", "admin.staff.update", userId, { staffId: parsed.id });
  redirectAdmin(locale, `/admin/teams/${parsed.teamId}/staff`);
}

export async function deleteStaffAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const id = z.string().min(1).parse(formData.get("id"));
  const teamId = z.string().min(1).parse(formData.get("teamId"));
  const existing = await prisma.staff.findUnique({ where: { id } });
  if (existing?.teamId !== teamId) redirectAdmin(locale, `/admin/teams/${teamId}/staff`);

  await prisma.staff.delete({ where: { id } });
  await audit("warn", "admin.staff.delete", userId, { staffId: id, teamId });
  redirectAdmin(locale, `/admin/teams/${teamId}/staff`);
}

const orderStatusValues = Object.values(OrderStatus) as OrderStatus[];
const orderStatusSchema = z.enum(orderStatusValues as [OrderStatus, ...OrderStatus[]]);

export async function updateOrderStatusAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const orderId = z.string().min(1).parse(formData.get("orderId"));
  const status = orderStatusSchema.parse(formData.get("status"));

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  await audit("info", "admin.order.status.update", userId, { orderId, status });
  redirectAdmin(locale, `/admin/orders/${orderId}`);
}

