"use client";

import { useRef, useState } from "react";

type Props = {
  titleId: string;
  initialImageUrl: string | null;
};

export function TitleImageEditor({ titleId, initialImageUrl }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (!file || file.size === 0) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("titleId", titleId);
      fd.append("file", file);
      const res = await fetch("/api/admin/title-images/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let msg = `Erreur ${res.status}`;
        try {
          const data = JSON.parse(text) as { error?: string };
          if (data.error) msg = data.error;
        } catch { /* not JSON */ }
        throw new Error(msg);
      }
      const data = await res.json() as { url: string };
      setImageUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove() {
    const res = await fetch(`/api/admin/title-images/upload?id=${titleId}`, { method: "DELETE" });
    if (res.ok) setImageUrl(null);
  }

  return (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="trophy" className="h-12 w-12 rounded-lg object-contain border border-border" />
          <button
            type="button"
            onClick={() => void handleRemove()}
            className="text-xs text-red-500 underline hover:opacity-70"
          >
            Supprimer
          </button>
        </>
      ) : (
        <span className="text-muted text-xs italic">Aucune image</span>
      )}
      <label className="cursor-pointer">
        <span className="text-xs bg-muted/30 hover:bg-muted/60 border border-border rounded px-2 py-1 transition-colors">
          {uploading ? "…" : imageUrl ? "Changer" : "Ajouter image"}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => void handleUpload(e.target.files)}
        />
      </label>
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
