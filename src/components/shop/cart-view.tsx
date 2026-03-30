"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatTnd } from "@/lib/money";
import { Link } from "@/i18n/navigation";

type Line = {
  id: string;
  quantity: number;
  product: { slug: string; name: string; priceCents: number };
};

export function CartView({ checkoutLabel }: { checkoutLabel: string }) {
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<Line[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/cart", { credentials: "include" });
      const data = (await res.json()) as { items: Line[]; totalCents: number };
      setItems(data.items ?? []);
      setTotal(data.totalCents ?? 0);
      setLoading(false);
    })();
  }, []);

  async function checkout() {
    const res = await fetch("/api/checkout", { method: "POST", credentials: "include" });
    if (res.status === 401) {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/shop/cart`);
      return;
    }
    const data = (await res.json()) as { orderId?: string };
    if (data.orderId) {
      router.push(`/${locale}/shop/checkout?orderId=${data.orderId}`);
      router.refresh();
    }
  }

  if (loading) {
    return <p className="text-muted mt-8 text-sm">…</p>;
  }

  if (!items.length) {
    return (
      <p className="text-muted mt-8">
        Panier vide.{" "}
        <Link href="/shop" className="text-primary font-medium underline">
          Boutique
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <ul className="border-border divide-y rounded-lg border">
        {items.map((line) => (
          <li key={line.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <Link href={`/shop/${line.product.slug}`} className="text-foreground font-medium hover:underline">
              {line.product.name}
            </Link>
            <span className="text-muted">
              ×{line.quantity} · {formatTnd(line.quantity * line.product.priceCents)} TND
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <p className="text-foreground text-lg font-semibold">Total : {formatTnd(total)} TND</p>
        <div className="flex gap-3">
          <Link
            href="/auth/signin"
            className="text-muted text-sm underline"
          >
            {tNav("signIn")}
          </Link>
          <button
            type="button"
            onClick={() => void checkout()}
            className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold"
          >
            {checkoutLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
