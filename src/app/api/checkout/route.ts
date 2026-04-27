import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { OrderDeliveryType, OrderPaymentType, OrderStatus } from "@/generated/prisma/enums";

import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  paymentType: z.enum(Object.values(OrderPaymentType) as [OrderPaymentType, ...OrderPaymentType[]]),
  deliveryType: z.enum(Object.values(OrderDeliveryType) as [OrderDeliveryType, ...OrderDeliveryType[]]),
});

/** Creates an order from the logged-in user's cart. Stripe can be wired here when your account supports TND. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout options" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart?.items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const totalCents = cart.items.reduce((s, i) => s + i.quantity * i.product.priceCents, 0);

  const [order] = await prisma.$transaction(async (tx) => {
    // Create order + items.
    const createdOrder = await tx.order.create({
      data: {
        userId: session.user.id,
        totalCents,
        status: OrderStatus.PENDING,
        paymentType: parsed.data.paymentType,
        deliveryType: parsed.data.deliveryType,
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            priceCents: i.product.priceCents,
            sizeOption: i.sizeOption ?? "",
          })),
        },
      },
    });

    // Decrement stock per product/size.
    for (const item of cart.items) {
      const size = item.sizeOption ?? "";
      if (size) {
        const existing = await tx.productSizeStock.findUnique({
          where: {
            productId_sizeOption: {
              productId: item.productId,
              sizeOption: size,
            },
          },
        });
        if (existing) {
          const next = Math.max(0, existing.stock - item.quantity);
          await tx.productSizeStock.update({
            where: { id: existing.id },
            data: { stock: next },
          });
        }
      } else {
        // Fallback: decrement aggregate product stock when there is no size.
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Clear cart items.
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return [createdOrder];
  });

  await prisma.auditLog.create({
    data: {
      level: "info",
      action: "shop.checkout",
      userId: session.user.id,
      meta: {
        orderId: order.id,
        totalCents,
        paymentType: parsed.data.paymentType,
        deliveryType: parsed.data.deliveryType,
      },
    },
  });

  logger.info({ action: "checkout.completed", orderId: order.id });

  if (parsed.data.paymentType === "CARD" && stripe) {
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: {
        type: "store_order",
        orderId: order.id,
      },
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: "tnd",
          product_data: {
            name: item.product.name,
            description: item.sizeOption ? `Size: ${item.sizeOption}` : undefined,
            images: item.product.imageUrl ? [item.product.imageUrl] : [],
          },
          unit_amount: item.product.priceCents,
        },
        quantity: item.quantity,
      })),
      success_url: `${origin}/en/shop/checkout?orderId=${order.id}&success=true`,
      cancel_url: `${origin}/en/shop/cart`,
    });

    return NextResponse.json({ orderId: order.id, checkoutUrl: checkoutSession.url, status: order.status });
  }

  return NextResponse.json({ orderId: order.id, status: order.status });
}
