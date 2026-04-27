"use client";

import { useState, useRef } from "react";

export type VenueImage = {
  id: string;
  url: string;
  isCover: boolean;
};

export function VenueImagesEditor({
  venueId,
  initialImages,
}: {
  venueId: string;
  initialImages: VenueImage[];
}) {
  const [images, setImages] = useState<VenueImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const coverUrl = images.find((i) => i.isCover)?.url ?? images[0]?.url ?? "";

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(fileList)) {
        const fd = new FormData();
        fd.append("venueId", venueId);
        fd.append("file", file);
        const res = await fetch("/api/admin/venue-images/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(data?.error ?? "Upload failed");
        }
        const data = await res.json() as { url: string; id: string; isCover: boolean };
        setImages((prev) => [...prev, { id: data.id, url: data.url, isCover: data.isCover }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function setCover(id: string) {
    const res = await fetch("/api/admin/venue-images/upload", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === id })));
    }
  }

  async function removeImage(id: string) {
    const res = await fetch(`/api/admin/venue-images/upload?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => {
        const next = prev.filter((img) => img.id !== id);
        // If we deleted the cover and images remain, make the first one the cover
        const hasCover = next.some((img) => img.isCover);
        if (!hasCover && next.length > 0) next[0].isCover = true;
        return [...next];
      });
    }
  }

  return (
    <div className="border-border bg-card rounded-xl border p-4 space-y-4">
      <p className="text-sm font-medium">Photos du stade / enceinte</p>

      {/* Upload button */}
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted text-xs">Ajouter des photos (plusieurs fichiers acceptés)</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => void uploadFiles(e.target.files)}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm
            file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0
            file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground
            hover:file:bg-primary/90 disabled:opacity-50"
        />
      </label>

      {uploading && (
        <p className="text-muted text-sm animate-pulse">Envoi en cours…</p>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Image grid */}
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative h-24 w-24 overflow-hidden rounded-lg border-2 ${
                img.isCover ? "border-primary" : "border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="venue" className="h-full w-full object-cover" />

              {/* Cover badge */}
              {img.isCover && (
                <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[9px] font-bold px-1 py-0.5 rounded-br">
                  COVER
                </span>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                {!img.isCover && (
                  <button
                    type="button"
                    onClick={() => void setCover(img.id)}
                    className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded font-semibold"
                  >
                    Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void removeImage(img.id)}
                  className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-semibold"
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-sm italic">Aucune photo pour le moment.</p>
      )}

      {/* Hidden fields so the parent form action still receives imageUrl */}
      <input type="hidden" name="imageUrl" value={coverUrl} />
    </div>
  );
}
