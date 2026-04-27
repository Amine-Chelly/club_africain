"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubscriptionType, OrderStatus, OrderPaymentType } from "@/generated/prisma/enums";
import { stripe } from "@/lib/stripe";

function getPriceForSubscription(type: SubscriptionType): number {
  switch (type) {
    case "VIRAGE":
      return 15000;
    case "PELOUSE":
      return 22000;
    case "ENCEINTE_SUP":
      return 40000;
    case "ENCEINTE_INF":
      return 50000;
    case "TRIBUNE":
      return 100000;
    default:
      return 0;
  }
}

const subscriptionSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  birthDate: z.coerce.date(),
  seatType: z.nativeEnum(SubscriptionType),
  paymentType: z.enum(["CASH", "CARD", "BANK_TRANSFER"]).optional().default("CASH"),
});

export async function createSubscriptionAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");

  const parsed = subscriptionSchema.safeParse({
    fullName: formData.get("fullName"),
    birthDate: formData.get("birthDate"),
    seatType: formData.get("seatType"),
    paymentType: formData.get("paymentType"),
  });

  if (!parsed.success) {
    redirect(`/${locale}/subscriptions?error=invalidInput`);
  }

  const { fullName, birthDate, seatType, paymentType } = parsed.data;

  // Set price correctly by querying the dictionary function
  const priceCents = getPriceForSubscription(seatType);

  const sub = await prisma.seasonSubscription.create({
    data: {
      season: "2025/2026",
      fullName,
      birthDate,
      seatType,
      priceCents,
      paymentType: paymentType as OrderPaymentType,
      status: OrderStatus.PENDING,
    },
  });

  revalidatePath("/");

  if (paymentType === "CARD" && stripe) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: {
        type: "season_subscription",
        subscriptionId: sub.id,
      },
      line_items: [
        {
          price_data: {
            currency: "tnd",
            product_data: {
              name: `Passeport Season 2025/2026 - ${seatType}`,
              description: `Abonnement annuel pour: ${fullName}`,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/${locale}/subscriptions?success=true`,
      cancel_url: `${origin}/${locale}/subscriptions`,
    });

    if (checkoutSession.url) {
      redirect(checkoutSession.url);
    }
  }

  redirect(`/${locale}/subscriptions?success=true`);
}
