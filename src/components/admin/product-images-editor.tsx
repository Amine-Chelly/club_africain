"use client";

import { useMemo, useState } from "react";

export type ProductImageEditorImage = {
  url: string;
  altText?: string | null;
  isCover?: boolean;
  sortOrder?: number;
};

export function ProductImagesEditor({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImageEditorImage[];
}) {
  const [images, setImages] = useState<ProductImageEditorImage[]>(() => initialImages ?? []);
  const coverUrl = useMemo(() => images.find((i) => i.isCover)?.url ?? images[0]?.url ?? "", [images]);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const files = Array.from(fileList);
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("productId", productId);
        fd.append("file", file);

        const res = await fetch("/api/admin/product-images/upload", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Upload failed");
        }

        const data = (await res.json()) as { url: string };
        uploadedUrls.push(data.url);
      }

      setImages((prev) => {
        const next = [...prev];
        const hasCover = next.some((i) => i.isCover);
        for (const url of uploadedUrls) {
          next.push({ url, isCover: !hasCover && next.length === 0 });
        }
        if (!hasCover && next.length > 0) {
          next.forEach((i, idx) => {
            i.isCover = idx === 0;
          });
        }
        // Ensure only one cover.
        const finalCover = next.find((i) => i.isCover)?.url ?? next[0]?.url;
        next.forEach((i) => {
          i.isCover = i.url === finalCover;
        });
        return next;
      });
    } finally {
      setUploading(false);
    }
  }

  function setCover(url: string) {
    setImages((prev) => {
      const next = [...prev];
      next.forEach((i) => {
        i.isCover = i.url === url;
      });
      return next;
    });
  }

  // Stored order matters (sortOrder = index).
  const orderedUrls = useMemo(() => images.map((i) => i.url), [images]);

  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <p className="text-muted text-sm mb-3">Images du produit (multi-photo)</p>

      <label className="flex flex-col gap-2 text-sm">
        <span>Upload (plusieurs fichiers)</span>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.gif,.svg"
          multiple
          disabled={uploading}
          onChange={(e) => void uploadFiles(e.target.files)}
        />
      </label>

      {images.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              onClick={() => setCover(img.url)}
              className={`relative h-20 w-20 overflow-hidden rounded border ${
                img.isCover ? "border-primary" : "border-border"
              }`}
              title={img.isCover ? "Cover" : "Mettre en cover"}
            >
              <img src={img.url} alt={img.altText ?? `Image ${idx + 1}`} className="h-full w-full object-cover" />
              {img.isCover ? (
                <span className="absolute left-0 top-0 bg-primary text-primary-foreground text-[10px] px-1 py-0.5">
                  COVER
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-muted text-sm mt-3">Aucune image pour le moment.</p>
      )}

      {/* Hidden fields consumed by server actions */}
      <input type="hidden" name="imageUrls" value={JSON.stringify(orderedUrls)} />
      <input type="hidden" name="coverUrl" value={coverUrl} />
      <input type="hidden" name="imageUrl" value={coverUrl} />
    </div>
  );
}

