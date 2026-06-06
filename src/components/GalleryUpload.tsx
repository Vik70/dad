"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/types";
import { addGalleryItem } from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import Diya from "./Diya";

interface GalleryUploadProps {
  onUploaded: () => void;
}

export default function GalleryUpload({ onUploaded }: GalleryUploadProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("Family");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(0);

  const field =
    "w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-gold";

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
    setError(null);
    setJustAdded(0);
  }

  function removeAt(i: number) {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  function reset() {
    setFiles([]);
    setPreviews([]);
    setProgress(null);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (files.length === 0) {
      setError("Please choose at least one photo.");
      return;
    }
    setBusy(true);
    setProgress({ done: 0, total: files.length });
    try {
      const who = name.trim() || "A loved one";
      let done = 0;
      for (const file of files) {
        const imageUrl = await uploadImage(file, "gallery");
        await addGalleryItem({
          imageUrl,
          caption: "",
          category,
          uploadedBy: who,
          status: "approved",
        });
        done += 1;
        setProgress({ done, total: files.length });
      }
      setJustAdded(files.length);
      reset();
      onUploaded();
    } catch {
      setError("Something went wrong while uploading. Please try again.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="mx-auto mb-12 max-w-2xl">
      {!open ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-maroon px-7 py-3 font-medium text-cream shadow-soft transition-transform hover:scale-[1.03]"
          >
            Add photos to the gallery
          </button>
          {justAdded > 0 && (
            <p className="text-sm text-forest">
              Thank you — {justAdded} {justAdded === 1 ? "photo" : "photos"} added. ✨
            </p>
          )}
          <p className="text-xs text-muted">Anyone can add photos. They appear in the gallery straight away.</p>
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleUpload}
          className="space-y-5 rounded-3xl bg-cream p-6 shadow-soft ring-1 ring-line sm:p-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-maroon">Add photos</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-maroon">
              Close
            </button>
          </div>

          <label className="bg-photo-placeholder flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl ring-1 ring-line transition-shadow hover:shadow-card">
            <Diya size={36} />
            <span className="font-serif text-lg text-maroon/80">Tap to choose photos</span>
            <span className="text-xs text-muted">You can select several at once</span>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              <AnimatePresence>
                {previews.map((src, i) => (
                  <motion.div
                    key={src}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-line"
                  >
                    <Image src={src} alt={`Selected photo ${i + 1}`} fill sizes="120px" className="object-cover" />
                    {!busy && (
                      <button
                        type="button"
                        onClick={() => removeAt(i)}
                        aria-label="Remove"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-cream/90 text-xs text-maroon shadow-card"
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Your name <span className="font-normal text-muted">(optional)</span>
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Album <span className="font-normal text-muted">(optional)</span>
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)} className={field}>
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-maroon">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-maroon px-6 py-3.5 font-medium text-cream shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy && progress
              ? `Uploading ${progress.done} of ${progress.total}…`
              : files.length > 0
                ? `Add ${files.length} ${files.length === 1 ? "photo" : "photos"}`
                : "Add photos"}
          </button>
        </motion.form>
      )}
    </div>
  );
}
