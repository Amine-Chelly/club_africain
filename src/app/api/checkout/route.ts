import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** Creates an order from the logged-in user's cart. Stripe can be wired here when your account supports TND. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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
        status: "PAID",
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
      meta: { orderId: order.id, totalCents },
    },
  });

  logger.info({ action: "checkout.completed", orderId: order.id });

  return NextResponse.json({ orderId: order.id, mockPaid: true });
}
