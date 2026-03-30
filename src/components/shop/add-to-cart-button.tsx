"use client";

import { useState } from "react";

export function AddToCartButton({ productId, label }: { productId: string; label: string }) {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function add() {
    setStatus("idle");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    setStatus(res.ok ? "ok" : "err");
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={add}
        className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {label}
      </button>
      {status === "ok" && <p className="text-muted text-sm">Ajouté au panier.</p>}
      {status === "err" && <p className="text-primary text-sm">Impossible d’ajouter.</p>}
    </div>
  );
}
