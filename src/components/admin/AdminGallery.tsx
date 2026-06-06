"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  getAllGallery,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import { GALLERY_CATEGORIES, type GalleryItem, type GalleryCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setItems(await getAllGallery());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function act(fn: () => Promise<void>) {
    await fn();
    await refresh();
  }

  return (
    <div className="space-y-8">
      <UploadForm onUploaded={refresh} />

      {loading ? (
        <p className="py-8 text-center text-muted">Loading photos…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-muted">No photos yet. Add the first one above.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <GalleryCard
              key={g.id}
              item={g}
              onChange={(changes) => act(() => updateGalleryItem(g.id, changes))}
              onDelete={() => {
                if (confirm("Delete this photo permanently?")) act(() => deleteGalleryItem(g.id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("Family");
  const [uploadedBy, setUploadedBy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const field = "w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-gold";

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose a photo to upload.");
      return;
    }
    setBusy(true);
    try {
      const imageUrl = await uploadImage(file, "gallery");
      await addGalleryItem({
        imageUrl,
        caption: caption.trim() || "Untitled",
        category,
        uploadedBy: uploadedBy.trim() || "Family",
        status: "approved",
      });
      setFile(null);
      setPreview(null);
      setCaption("");
      setUploadedBy("");
      setCategory("Family");
      onUploaded();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="rounded-2xl bg-cream p-5 shadow-card ring-1 ring-line sm:p-6">
      <h3 className="font-serif text-lg text-maroon">Add a photo</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-medium file:text-cream"
          />
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" className={field} />
          <input value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} placeholder="Uploaded by" className={field} />
          <select value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)} className={field}>
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-xl bg-cream-deep ring-1 ring-line">
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : (
            <p className="px-4 text-center text-xs uppercase tracking-widest text-muted">Preview</p>
          )}
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-maroon">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-full bg-maroon px-6 py-3 text-sm font-medium text-cream shadow-soft transition-transform hover:scale-[1.01] disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Uploading…" : "Upload photo"}
      </button>
    </form>
  );
}

function GalleryCard({
  item,
  onChange,
  onDelete,
}: {
  item: GalleryItem;
  onChange: (changes: { caption?: string; category?: GalleryCategory; status?: GalleryItem["status"] }) => void;
  onDelete: () => void;
}) {
  const [caption, setCaption] = useState(item.caption);
  const field = "w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-gold";

  return (
    <div className="overflow-hidden rounded-2xl bg-cream shadow-card ring-1 ring-line">
      <div className="relative aspect-square bg-cream-deep">
        <Image src={item.imageUrl} alt={item.caption} fill sizes="300px" className="object-cover" />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
            item.status === "approved" ? "bg-forest text-cream" : "bg-gold text-cream",
          )}
        >
          {item.status}
        </span>
      </div>
      <div className="space-y-2 p-3">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => caption !== item.caption && onChange({ caption })}
          className={field}
        />
        <select
          value={item.category}
          onChange={(e) => onChange({ category: e.target.value as GalleryCategory })}
          className={field}
        >
          {GALLERY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">By {item.uploadedBy}</p>
        <div className="flex gap-2">
          {item.status !== "approved" ? (
            <button
              type="button"
              onClick={() => onChange({ status: "approved" })}
              className="flex-1 rounded-full bg-forest px-3 py-2 text-xs font-medium text-cream hover:opacity-90"
            >
              Approve
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onChange({ status: "pending" })}
              className="flex-1 rounded-full bg-gold/20 px-3 py-2 text-xs font-medium text-gold hover:bg-gold/30"
            >
              Hide
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 rounded-full bg-maroon/10 px-3 py-2 text-xs font-medium text-maroon hover:bg-maroon/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
