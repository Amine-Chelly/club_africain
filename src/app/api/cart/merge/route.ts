import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CART_COOKIE = "cart_session";

/** Merges guest cart (cookie) into the logged-in user's cart after sign-in. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const sid = cookieStore.get(CART_COOKIE)?.value;
  if (!sid) {
    return NextResponse.json({ ok: true });
  }

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: sid },
    include: { items: true },
  });

  if (!guestCart?.items.length) {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(CART_COOKIE);
    return res;
  }

  let userCart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId: session.user.id } });
  }

  for (const item of guestCart.items) {
    await prisma.cartItem.upsert({
      where: {
        cartId_productId_sizeOption: {
          cartId: userCart.id,
          productId: item.productId,
          sizeOption: item.sizeOption ?? "",
        },
      },
      create: {
        cartId: userCart.id,
        productId: item.productId,
        quantity: item.quantity,
        sizeOption: item.sizeOption ?? "",
      },
      update: {
        quantity: { increment: item.quantity },
      },
    });
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(CART_COOKIE);
  return res;
}
