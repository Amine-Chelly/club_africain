"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export function AddToCartButton({
  productId,
  label,
  sizeOptions,
  disabledSizes,
}: {
  productId: string;
  label: string;
  sizeOptions?: string[];
  disabledSizes?: string[];
}) {
  const sizes = useMemo(() => sizeOptions ?? [], [sizeOptions]);
  const disabled = useMemo(() => new Set(disabledSizes ?? []), [disabledSizes]);
  const t = useTranslations("shop");
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const firstAvailable = sizes.find((s) => !disabled.has(s));
    return firstAvailable ?? sizes[0] ?? "";
  });
  const [status, setStatus] = useState<"idle" | "ok" | "err" | "size_err">("idle");

  useEffect(() => {
    if (!sizes.length) return;
    if (!sizes.includes(selectedSize) || disabled.has(selectedSize)) {
      const firstAvailable = sizes.find((s) => !disabled.has(s));
      setSelectedSize(firstAvailable ?? sizes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes, disabledSizes]);

  async function add() {
    setStatus("idle");
    const normalizedSize = sizes.length ? selectedSize : "";
    if (sizes.length && (!normalizedSize || disabled.has(normalizedSize))) {
      setStatus("size_err");
      return;
    }
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity: 1, sizeOption: normalizedSize }),
    });
    setStatus(res.ok ? "ok" : "err");
  }

  return (
    <div className="flex flex-col gap-3">
      {sizes.length > 0 && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{t("sizeLabel")}</span>
          <select
            aria-label="Choisir la taille"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
          >
            {sizes.map((s) => (
              <option key={s} value={s} disabled={disabled.has(s)}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        onClick={add}
        className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {label}
      </button>
      {status === "ok" && <p className="text-muted text-sm">Ajouté au panier.</p>}
      {status === "err" && <p className="text-primary text-sm">Impossible d’ajouter.</p>}
      {status === "size_err" && <p className="text-primary text-sm">{t("chooseSize")}</p>}
    </div>
  );
}
