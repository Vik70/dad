"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  getAllMemories,
  updateMemoryStatus,
  setMemoryVisibility,
  deleteMemory,
  editMemory,
  type MemoryEdit,
} from "@/lib/firestore";
import { MEMORY_CATEGORIES, type Memory, type MemoryCategory } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

const statusStyle: Record<Memory["status"], string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-forest/10 text-forest",
  rejected: "bg-maroon/10 text-maroon",
};

export default function AdminMemories({ pendingOnly = false }: { pendingOnly?: boolean }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await getAllMemories();
    setMemories(pendingOnly ? all.filter((m) => m.status === "pending") : all);
    setLoading(false);
  }, [pendingOnly]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function act(fn: () => Promise<void>) {
    await fn();
    await refresh();
  }

  if (loading) return <p className="py-12 text-center text-muted">Loading…</p>;
  if (memories.length === 0)
    return (
      <p className="py-12 text-center text-muted">
        {pendingOnly ? "Nothing waiting for approval. All caught up." : "No memories yet."}
      </p>
    );

  return (
    <div className="space-y-4">
      {memories.map((m) => (
        <div key={m.id} className="rounded-2xl bg-cream p-4 shadow-card ring-1 ring-line sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            {m.imageUrl && (
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-cream-deep sm:h-32 sm:w-40">
                <Image src={m.imageUrl} alt={m.title} fill sizes="160px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusStyle[m.status])}>
                  {m.status}
                </span>
                <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  {m.category}
                </span>
                <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-xs capitalize text-muted">
                  {m.visibility}
                </span>
              </div>
              <h3 className="mt-2 font-serif text-lg text-maroon">{m.title}</h3>
              <p className="text-xs text-muted">
                {m.name} · {m.relationship} · {formatDate(m.createdAt)}
              </p>
              <p className="mt-2 break-words text-sm text-ink/80">{m.message}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {m.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => act(() => updateMemoryStatus(m.id, "approved"))}
                    className="rounded-full bg-forest px-4 py-2 text-xs font-medium text-cream hover:opacity-90"
                  >
                    Approve
                  </button>
                )}
                {m.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => act(() => updateMemoryStatus(m.id, "rejected"))}
                    className="rounded-full bg-gold/20 px-4 py-2 text-xs font-medium text-gold hover:bg-gold/30"
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => act(() => setMemoryVisibility(m.id, m.visibility === "public" ? "private" : "public"))}
                  className="rounded-full bg-cream-deep px-4 py-2 text-xs font-medium text-ink hover:bg-line"
                >
                  Make {m.visibility === "public" ? "private" : "public"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(editingId === m.id ? null : m.id)}
                  className="rounded-full bg-cream-deep px-4 py-2 text-xs font-medium text-ink hover:bg-line"
                >
                  {editingId === m.id ? "Close" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this memory permanently?")) act(() => deleteMemory(m.id));
                  }}
                  className="rounded-full bg-maroon/10 px-4 py-2 text-xs font-medium text-maroon hover:bg-maroon/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {editingId === m.id && (
            <EditForm
              memory={m}
              onCancel={() => setEditingId(null)}
              onSave={async (changes) => {
                await act(() => editMemory(m.id, changes));
                setEditingId(null);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function EditForm({
  memory,
  onSave,
  onCancel,
}: {
  memory: Memory;
  onSave: (changes: MemoryEdit) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(memory.title);
  const [name, setName] = useState(memory.name);
  const [relationship, setRelationship] = useState(memory.relationship);
  const [message, setMessage] = useState(memory.message);
  const [category, setCategory] = useState<MemoryCategory>(memory.category);
  const field = "w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-gold";

  return (
    <div className="mt-4 space-y-3 rounded-xl bg-cream-deep/50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={field} />
        <input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Relationship" className={field} />
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={field} />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Message" className={field} />
      <select value={category} onChange={(e) => setCategory(e.target.value as MemoryCategory)} className={field}>
        {MEMORY_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ title, name, relationship, message, category })}
          className="rounded-full bg-maroon px-5 py-2 text-xs font-medium text-cream hover:opacity-90"
        >
          Save changes
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-line px-5 py-2 text-xs text-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}
