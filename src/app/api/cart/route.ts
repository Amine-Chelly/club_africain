import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cartAddSchema } from "@/lib/validation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const CART_COOKIE = "cart_session";

async function getOrCreateCart() {
  const session = await auth();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (session?.user?.id) {
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: { items: { include: { product: true } } },
      });
    }
    return { cart, sessionId: null as string | null };
  }

  if (!sessionId) {
    sessionId = randomUUID();
  }

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: { items: { include: { product: true } } },
    });
  }

  return { cart, sessionId };
}

export async function GET() {
  const { cart, sessionId } = await getOrCreateCart();
  const res = NextResponse.json({
    items: cart.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      sizeOption: i.sizeOption,
      product: {
        id: i.product.id,
        slug: i.product.slug,
        name: i.product.name,
        priceCents: i.product.priceCents,
        imageUrl: i.product.imageUrl,
      },
    })),
    totalCents: cart.items.reduce((s, i) => s + i.quantity * i.product.priceCents, 0),
  });

  if (sessionId) {
    res.cookies.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return res;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = cartAddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, quantity, sizeOption } = parsed.data;
  const normalizedSize = sizeOption?.trim() ?? "";

  const product = await prisma.product.findFirst({
    where: { id: productId, active: true },
    select: {
      id: true,
      priceCents: true,
      stock: true,
      sizeOptions: true,
      sizeStocks: {
        select: {
          sizeOption: true,
          stock: true,
        },
      },
    },
  });
  if (!product) {
    return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
  }

  const { cart, sessionId } = await getOrCreateCart();

  // If sizes are defined, only accept values from `sizeOptions`.
  if (product.sizeOptions?.length) {
    if (normalizedSize === "") return NextResponse.json({ error: "Size required" }, { status: 400 });
    if (!product.sizeOptions.includes(normalizedSize)) {
      return NextResponse.json({ error: "Invalid size" }, { status: 400 });
    }

    // Per-size stock check: find the stock row for the requested size.
    const sizeStock = product.sizeStocks.find((s) => s.sizeOption === normalizedSize);
    const available = sizeStock?.stock ?? 0;

    // Compute current quantity of this size in the cart so we don't exceed stock.
    const existingLine = cart.items.find(
      (i) => i.productId === productId && i.sizeOption === normalizedSize
    );
    const currentQty = existingLine?.quantity ?? 0;
    if (currentQty + quantity > available) {
      return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
    }
  } else {
    // No sizes: fall back to aggregate product stock.
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
    }
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId_sizeOption: {
        cartId: cart.id,
        productId,
        sizeOption: normalizedSize,
      },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
      sizeOption: normalizedSize,
    },
    update: {
      quantity: { increment: quantity },
    },
  });

  const res = NextResponse.json({ ok: true });
  if (sessionId) {
    res.cookies.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return res;
}
