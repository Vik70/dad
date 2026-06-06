"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MEMORY_CATEGORIES, type MemoryCategory, type Visibility } from "@/lib/types";
import { submitMemory } from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import Diya from "./Diya";

export default function MemoryForm() {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("Family");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [autoApproved, setAutoApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Everything is optional — just make sure there's *something* to share.
    if (!file && !name.trim() && !relationship.trim() && !title.trim() && !message.trim()) {
      setError("Please add a photo or a few words to share.");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadImage(file, "memories");
      const saved = await submitMemory({
        name: name.trim() || "Anonymous",
        relationship: relationship.trim(),
        title: title.trim(),
        message: message.trim(),
        category,
        imageUrl,
        visibility,
      });
      setAutoApproved(saved.status === "approved");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl rounded-3xl bg-cream p-10 text-center shadow-soft ring-1 ring-line"
      >
        <div className="mb-5 flex justify-center">
          <Diya size={64} />
        </div>
        <h3 className="font-serif text-2xl text-maroon">Thank you</h3>
        <p className="mt-3 leading-relaxed text-muted">
          {autoApproved
            ? "Your memory has been added to the wall. Thank you for sharing."
            : "Your memory has been submitted and will appear once approved."}
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setAutoApproved(false);
            setName("");
            setRelationship("");
            setTitle("");
            setMessage("");
            setCategory("Family");
            setVisibility("public");
            setFile(null);
            setPreview(null);
          }}
          className="mt-6 rounded-full border border-maroon/30 px-6 py-2.5 text-sm font-medium text-maroon transition-colors hover:bg-cream-deep"
        >
          Share another memory
        </button>
      </motion.div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-gold";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-5 rounded-3xl bg-cream p-6 shadow-soft ring-1 ring-line sm:p-8"
    >
      <p className="text-center text-sm text-muted">
        Everything here is optional — share a photo, a few words, or both.
      </p>

      {/* Photo first — this is the main thing we want */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Add a photo</label>
        <label
          className="bg-photo-placeholder relative flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl ring-1 ring-line transition-shadow hover:shadow-card"
        >
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : (
            <>
              <Diya size={40} />
              <span className="font-serif text-lg text-maroon/80">Tap to add a photo</span>
              <span className="text-xs text-muted">JPG, PNG or HEIC</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {preview && (
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            className="mt-2 text-xs font-medium text-maroon hover:underline"
          >
            Remove photo
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Your name <span className="font-normal text-muted">(optional)</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} placeholder="Your name" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Relationship to Rajesh <span className="font-normal text-muted">(optional)</span></label>
          <input
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className={fieldClass}
            placeholder="Your relationship to Rajesh"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Title <span className="font-normal text-muted">(optional)</span></label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} placeholder="Give your memory a title" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">A few words <span className="font-normal text-muted">(optional)</span></label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className={fieldClass}
          placeholder="Share a story, a moment, or what Rajesh meant to you…"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Category <span className="font-normal text-muted">(optional)</span></label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MemoryCategory)}
          className={fieldClass}
        >
          {MEMORY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-cream-deep/60 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">Visibility</p>
          <p className="text-xs text-muted">
            {visibility === "public"
              ? "Shown on the public Memory Wall once approved."
              : "Kept private — visible to the family only."}
          </p>
        </div>
        <div className="flex rounded-full bg-cream p-1 ring-1 ring-line">
          {(["public", "private"] as Visibility[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibility(v)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
                visibility === v ? "bg-maroon text-cream" : "text-muted"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-maroon">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-maroon px-6 py-3.5 font-medium text-cream shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {submitting ? "Sharing…" : "Share this memory"}
      </button>
    </form>
  );
}
