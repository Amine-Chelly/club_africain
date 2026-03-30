import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 characters"),
  name: z.string().min(1).max(120).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  locale: z.enum(["fr", "en", "ar"]).optional(),
});

export const cartAddSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  /** Selected size at add-to-cart time. Empty string = no size. */
  sizeOption: z.string().trim().max(20).optional(),
});
