"use client";

import { useMemo, useState } from "react";

export type ProductGalleryImage = {
  url: string;
  altText?: string | null;
  isCover?: boolean;
};

export function ProductImageGallery({ images }: { images: ProductGalleryImage[] }) {
  const safeImages = useMemo(() => images ?? [], [images]);
  const coverIndex = safeImages.findIndex((i) => i.isCover);
  const [selectedIndex, setSelectedIndex] = useState(() => (coverIndex >= 0 ? coverIndex : 0));

  if (!safeImages.length) return null;

  const selected = safeImages[selectedIndex] ?? safeImages[0];

  return (
    <div className="relative h-full w-full">
      {/* Main image */}
      <img
        src={selected.url}
        alt={selected.altText || "Product image"}
        className="h-full w-full object-cover"
      />

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {safeImages.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-pressed={idx === selectedIndex}
              className={`relative h-16 w-16 overflow-hidden rounded border ${
                idx === selectedIndex ? "border-primary" : "border-border"
              }`}
              title={img.altText ?? ""}
            >
              <img src={img.url} alt={img.altText || `Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

