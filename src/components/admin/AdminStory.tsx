"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  getStory,
  addStoryChapter,
  updateStoryChapter,
  deleteStoryChapter,
} from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import type { StoryChapter } from "@/lib/types";

export default function AdminStory() {
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setChapters(await getStory());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleAdd() {
    setAdding(true);
    try {
      const nextOrder = chapters.length ? Math.max(...chapters.map((c) => c.order)) + 1 : 1;
      await addStoryChapter({ title: "New chapter", text: "Add your words here…", year: "", order: nextOrder });
      await refresh();
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p className="py-12 text-center text-muted">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-cream shadow-soft hover:opacity-90 disabled:opacity-60"
        >
          {adding ? "Adding…" : "+ Add chapter"}
        </button>
      </div>

      {chapters.length === 0 ? (
        <p className="py-8 text-center text-muted">No chapters yet. Add the first one.</p>
      ) : (
        chapters.map((c) => (
          <ChapterEditor
            key={c.id}
            chapter={c}
            onSave={async (changes) => {
              await updateStoryChapter(c.id, changes);
              await refresh();
            }}
            onDelete={async () => {
              if (confirm("Delete this chapter?")) {
                await deleteStoryChapter(c.id);
                await refresh();
              }
            }}
          />
        ))
      )}
    </div>
  );
}

function ChapterEditor({
  chapter,
  onSave,
  onDelete,
}: {
  chapter: StoryChapter;
  onSave: (changes: Partial<StoryChapter>) => Promise<void>;
  onDelete: () => void;
}) {
  const [year, setYear] = useState(chapter.year ?? "");
  const [title, setTitle] = useState(chapter.title);
  const [text, setText] = useState(chapter.text);
  const [order, setOrder] = useState(chapter.order);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const field = "w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-gold";

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadImage(f, "story");
      await onSave({ imageUrl: url });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-cream p-4 shadow-card ring-1 ring-line sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Era / year" className={field} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter title" className={field} />
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          placeholder="Order"
          className={`${field} sm:w-24`}
        />
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Chapter text" className={`${field} mt-3`} />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        {chapter.imageUrl && (
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-cream-deep ring-1 ring-line">
            <Image src={chapter.imageUrl} alt={chapter.title} fill sizes="128px" className="object-cover" />
          </div>
        )}
        <label className="cursor-pointer rounded-full bg-forest px-4 py-2 text-xs font-medium text-cream hover:opacity-90">
          {uploading ? "Uploading…" : chapter.imageUrl ? "Replace photo" : "Add photo"}
          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
        </label>
        {chapter.imageUrl && (
          <button
            type="button"
            onClick={() => onSave({ imageUrl: null })}
            className="rounded-full bg-cream-deep px-4 py-2 text-xs font-medium text-ink hover:bg-line"
          >
            Remove photo
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ year, title, text, order });
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="rounded-full bg-maroon px-5 py-2 text-xs font-medium text-cream hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onDelete} className="rounded-full bg-maroon/10 px-5 py-2 text-xs font-medium text-maroon hover:bg-maroon/20">
          Delete
        </button>
      </div>
    </div>
  );
}
