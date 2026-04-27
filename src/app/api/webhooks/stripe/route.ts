import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";

export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.type === 'store_order' && session.metadata.orderId) {
      await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: {
          status: OrderStatus.COMPLETED,
          validatedAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string,
        },
      });
    }

    if (session.metadata?.type === 'season_subscription' && session.metadata.subscriptionId) {
      await prisma.seasonSubscription.update({
        where: { id: session.metadata.subscriptionId },
        data: {
          status: OrderStatus.COMPLETED,
          stripePaymentIntentId: session.payment_intent as string,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
