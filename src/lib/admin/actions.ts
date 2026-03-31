"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import {
  AgeGroup,
  OrderStatus,
  Role,
  MerchType,
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
        meta: (meta ?? undefined) as unknown as InputJsonValue,
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
const merchTypeValues = Object.values(MerchType) as MerchType[];

const sizeOptionsSchema = z
  .string()
  .optional()
  .transform((s) => {
    const raw = (s ?? "").trim();
    if (!raw) return [];
    return raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 40);
  });

function computeProductCategory(merchType: MerchType, sport?: Sport | null) {
  return sport ? `${sport}-${merchType}` : merchType;
}

const productCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(120),
  description: descriptionSchema,
  merchType: z.enum(merchTypeValues as [MerchType, ...MerchType[]]),
  sport: z.preprocess(
    (v) => {
      if (typeof v === "string") {
        const s = v.trim();
        return s === "" ? undefined : s;
      }
      return v;
    },
    z.enum(teamSportValues as [Sport, ...Sport[]]).optional()
  ),
  sizeOptions: sizeOptionsSchema,
  category: z.string().trim().max(80).optional(),
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
    merchType: formData.get("merchType"),
    sport: formData.get("sport"),
    sizeOptions: formData.get("sizeOptions"),
    category: formData.get("category"),
    priceTnd: formData.get("priceTnd"),
    imageUrl: formData.get("imageUrl"),
    stock: formData.get("stock"),
    active: formData.get("active"),
  });

  const category = parsed.category?.trim() ? parsed.category.trim() : computeProductCategory(parsed.merchType, parsed.sport);

  const created = await prisma.product.create({
    data: {
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      category,
      priceCents: Math.round(parsed.priceTnd * 100),
      imageUrl: parsed.imageUrl ? parsed.imageUrl : null,
      stock: parsed.stock,
      active: parsed.active,
      merchType: parsed.merchType,
      sport: parsed.sport ?? undefined,
      sizeOptions: parsed.sizeOptions,
    },
    select: { id: true },
  });

  // Create per-size stock rows so customers can select sizes immediately.
  if (parsed.sizeOptions.length) {
    const n = parsed.sizeOptions.length;
    const perSize = Math.floor(parsed.stock / n);
    let remainder = parsed.stock - perSize * n;
    for (let idx = 0; idx < n; idx++) {
      const size = parsed.sizeOptions[idx];
      const stock = perSize + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      await prisma.productSizeStock.upsert({
        where: {
          productId_sizeOption: {
            productId: created.id,
            sizeOption: size,
          },
        },
        create: {
          productId: created.id,
          sizeOption: size,
          stock,
        },
        update: {
          stock,
        },
      });
    }
  }

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
    merchType: formData.get("merchType"),
    sport: formData.get("sport"),
    sizeOptions: formData.get("sizeOptions"),
    category: formData.get("category"),
    priceTnd: formData.get("priceTnd"),
    imageUrl: formData.get("imageUrl"),
    stock: formData.get("stock"),
    active: formData.get("active"),
  });

  // Apply main product fields.
  await prisma.product.update({
    where: { id: parsed.id },
    data: {
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      category: parsed.category?.trim() ? parsed.category.trim() : computeProductCategory(parsed.merchType, parsed.sport),
      priceCents: Math.round(parsed.priceTnd * 100),
      imageUrl: parsed.imageUrl ? parsed.imageUrl : null,
      stock: parsed.stock,
      active: parsed.active,
      merchType: parsed.merchType,
      sport: parsed.sport ?? undefined,
      sizeOptions: parsed.sizeOptions,
    },
  });

  // Ensure all sizes in `sizeOptions` have a stock row (default 0).
  if (parsed.sizeOptions?.length) {
    for (const size of parsed.sizeOptions) {
      const existing = await prisma.productSizeStock.findUnique({
        where: {
          productId_sizeOption: {
            productId: parsed.id,
            sizeOption: size,
          },
        },
      });
      if (!existing) {
        await prisma.productSizeStock.create({
          data: {
            productId: parsed.id,
            sizeOption: size,
            stock: 0,
          },
        });
      }
    }
  }

  // Apply per-size stock deltas, if any were submitted.
  if (parsed.sizeOptions?.length) {
    for (const size of parsed.sizeOptions) {
      const rawDelta = formData.get(`sizeDelta_${size}`);
      if (rawDelta === null || rawDelta === undefined || rawDelta === "") continue;
      const delta = Number(rawDelta);
      if (!Number.isFinite(delta) || delta === 0) continue;

      const existing = await prisma.productSizeStock.findUnique({
        where: {
          productId_sizeOption: {
            productId: parsed.id,
            sizeOption: size,
          },
        },
      });

      const nextStock = Math.max(0, (existing?.stock ?? 0) + Math.trunc(delta));

      if (!existing) {
        await prisma.productSizeStock.create({
          data: {
            productId: parsed.id,
            sizeOption: size,
            stock: nextStock,
          },
        });
      } else {
        await prisma.productSizeStock.update({
          where: { id: existing.id },
          data: { stock: nextStock },
        });
      }
    }
  }

  // Sync product gallery images (multi-image + cover).
  const imageUrlsRaw = formData.get("imageUrls");
  if (typeof imageUrlsRaw === "string" && imageUrlsRaw.trim() && imageUrlsRaw.trim() !== "[]") {
    const coverUrlRaw = formData.get("coverUrl");
    const coverUrl = typeof coverUrlRaw === "string" ? coverUrlRaw : "";

    let urls: unknown;
    try {
      urls = JSON.parse(imageUrlsRaw) as unknown;
    } catch {
      urls = null;
    }

    const imageUrls = z
      .array(z.string().trim().max(2000))
      .max(20)
      .parse(urls);

    if (imageUrls.length > 0) {
      const finalCoverUrl = imageUrls.includes(coverUrl) ? coverUrl : imageUrls[0];

      await prisma.productImage.deleteMany({ where: { productId: parsed.id } });
      await prisma.productImage.createMany({
        data: imageUrls.map((url, idx) => ({
          productId: parsed.id,
          url,
          sortOrder: idx,
          isCover: url === finalCoverUrl,
        })),
      });

      await prisma.product.update({
        where: { id: parsed.id },
        data: { imageUrl: finalCoverUrl },
      });
    }
  }

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

const newsletterDeleteSchema = z.object({
  id: z.string().min(1),
});

export async function deleteNewsletterSubscriberAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = newsletterDeleteSchema.parse({
    id: formData.get("id"),
  });

  await prisma.newsletterSubscriber.delete({ where: { id: parsed.id } });
  await audit("warn", "admin.newsletter.delete", userId, { subscriberId: parsed.id });
  redirectAdmin(locale, "/admin/newsletters");
}

const matchdaySportSchema = z.preprocess(
  (v) => {
    if (typeof v === "string") {
      const s = v.trim();
      return s === "" ? undefined : s;
    }
    return v;
  },
  z.enum(teamSportValues as [Sport, ...Sport[]]).optional()
);

const matchdayCreateSchema = z.object({
  label: z.string().trim().min(1).max(120),
  season: z.preprocess(
    (v) => {
      if (typeof v === "string") {
        const s = v.trim();
        return s === "" ? undefined : s;
      }
      return v;
    },
    z.string().max(40).optional()
  ),
  sport: matchdaySportSchema,
});

const matchdayUpdateSchema = matchdayCreateSchema.extend({
  id: z.string().min(1),
});

export async function createMatchdayAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = matchdayCreateSchema.parse({
    label: formData.get("label"),
    season: formData.get("season"),
    sport: formData.get("sport"),
  });

  const created = await prisma.matchday.create({
    data: {
      label: parsed.label,
      season: parsed.season ?? undefined,
      sport: parsed.sport ?? undefined,
    },
    select: { id: true },
  });

  await audit("info", "admin.matchday.create", userId, { matchdayId: created.id });
  redirectAdmin(locale, "/admin/matchdays");
}

export async function updateMatchdayAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = matchdayUpdateSchema.parse({
    id: formData.get("id"),
    label: formData.get("label"),
    season: formData.get("season"),
    sport: formData.get("sport"),
  });

  await prisma.matchday.update({
    where: { id: parsed.id },
    data: {
      label: parsed.label,
      season: parsed.season ?? undefined,
      sport: parsed.sport ?? undefined,
    },
  });

  await audit("info", "admin.matchday.update", userId, { matchdayId: parsed.id });
  redirectAdmin(locale, `/admin/matchdays/${parsed.id}`);
}

export async function deleteMatchdayAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const id = z.string().min(1).parse(formData.get("id"));

  await prisma.matchday.delete({ where: { id } });
  await audit("warn", "admin.matchday.delete", userId, { matchdayId: id });
  redirectAdmin(locale, "/admin/matchdays");
}

const checkboxBoolSchema = z
  .string()
  .optional()
  .transform((v) => (v === "on" ? true : false));

const optionalScoreSchema = z.preprocess(
  (v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string") {
      const s = v.trim();
      if (s === "") return undefined;
      const n = Number(s);
      return Number.isFinite(n) ? n : undefined;
    }
    return v;
  },
  z.number().int().min(0).max(1000).optional()
);

const fixtureCreateSchema = z.object({
  matchdayId: z.string().min(1),
  teamId: z.string().min(1),
  kickoffAt: z.coerce.date(),
  opponent: z.string().trim().min(1).max(140),
  venue: z.string().trim().min(1).max(200),
  isHome: checkboxBoolSchema,
  homeScore: optionalScoreSchema,
  awayScore: optionalScoreSchema,
  competition: z.string().trim().min(1).max(120),
  status: z.preprocess(
    (v) => {
      if (typeof v === "string") {
        const s = v.trim();
        return s === "" ? undefined : s;
      }
      return v;
    },
    z.string().max(40).optional()
  ),
});

const fixtureUpdateSchema = fixtureCreateSchema.extend({
  id: z.string().min(1),
});

export async function createFixtureAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = fixtureCreateSchema.parse({
    matchdayId: formData.get("matchdayId"),
    teamId: formData.get("teamId"),
    kickoffAt: formData.get("kickoffAt"),
    opponent: formData.get("opponent"),
    venue: formData.get("venue"),
    isHome: formData.get("isHome") ?? undefined,
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
    competition: formData.get("competition"),
    status: formData.get("status"),
  });

  await prisma.fixture.create({
    data: {
      matchdayId: parsed.matchdayId,
      teamId: parsed.teamId,
      kickoffAt: parsed.kickoffAt,
      opponent: parsed.opponent,
      venue: parsed.venue,
      isHome: parsed.isHome,
      homeScore: parsed.homeScore ?? undefined,
      awayScore: parsed.awayScore ?? undefined,
      competition: parsed.competition,
      status: parsed.status ?? undefined,
    },
  });

  await audit("info", "admin.fixture.create", userId, { matchdayId: parsed.matchdayId, teamId: parsed.teamId });
  redirectAdmin(locale, `/admin/matchdays/${parsed.matchdayId}`);
}

export async function updateFixtureAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = fixtureUpdateSchema.parse({
    id: formData.get("id"),
    matchdayId: formData.get("matchdayId"),
    teamId: formData.get("teamId"),
    kickoffAt: formData.get("kickoffAt"),
    opponent: formData.get("opponent"),
    venue: formData.get("venue"),
    isHome: formData.get("isHome") ?? undefined,
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
    competition: formData.get("competition"),
    status: formData.get("status"),
  });

  await prisma.fixture.update({
    where: { id: parsed.id },
    data: {
      matchdayId: parsed.matchdayId,
      teamId: parsed.teamId,
      kickoffAt: parsed.kickoffAt,
      opponent: parsed.opponent,
      venue: parsed.venue,
      isHome: parsed.isHome,
      homeScore: parsed.homeScore ?? undefined,
      awayScore: parsed.awayScore ?? undefined,
      competition: parsed.competition,
      status: parsed.status ?? undefined,
    },
  });

  await audit("info", "admin.fixture.update", userId, { matchdayId: parsed.matchdayId, fixtureId: parsed.id });
  redirectAdmin(locale, `/admin/matchdays/${parsed.matchdayId}`);
}

export async function deleteFixtureAction(formData: FormData) {
  "use server";
  const locale = localeFromForm(formData);
  const userId = await requireAdmin(locale);

  const parsed = z.object({
    matchdayId: z.string().min(1),
    id: z.string().min(1),
  }).parse({
    matchdayId: formData.get("matchdayId"),
    id: formData.get("id"),
  });

  await prisma.fixture.delete({ where: { id: parsed.id } });
  await audit("warn", "admin.fixture.delete", userId, { matchdayId: parsed.matchdayId, fixtureId: parsed.id });
  redirectAdmin(locale, `/admin/matchdays/${parsed.matchdayId}`);
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

