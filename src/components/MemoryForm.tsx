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
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !relationship.trim() || !title.trim() || !message.trim()) {
      setError("Please fill in your name, relationship, title, and memory.");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadImage(file, "memories");
      await submitMemory({
        name: name.trim(),
        relationship: relationship.trim(),
        title: title.trim(),
        message: message.trim(),
        category,
        imageUrl,
        visibility,
      });
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
          Your memory has been submitted and will appear once approved.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} placeholder="e.g. Priya" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Your relationship to Rajesh</label>
          <input
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Niece, friend, colleague"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Memory title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} placeholder="Give your memory a title" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Your memory</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={fieldClass}
          placeholder="Share a story, a moment, or what Rajesh meant to you…"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:opacity-90"
          />
        </div>
      </div>

      {preview && (
        <div className="relative h-40 w-full overflow-hidden rounded-xl ring-1 ring-line">
          <Image src={preview} alt="Preview" fill className="object-cover" />
        </div>
      )}

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
