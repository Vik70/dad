"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { Memory, Diya, GalleryItem } from "@/lib/types";
import {
  getAllMemories,
  updateMemoryStatus,
  setMemoryVisibility,
  deleteMemory,
  getDiyas,
  deleteDiya,
  getAllGallery,
  deleteGalleryItem,
} from "@/lib/firestore";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "pending" | "memories" | "gallery" | "diyas";

const statusStyle: Record<Memory["status"], string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-forest/10 text-forest",
  rejected: "bg-maroon/10 text-maroon",
};

export default function AdminMemoryTable() {
  const [tab, setTab] = useState<Tab>("pending");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [diyas, setDiyas] = useState<Diya[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [m, d, g] = await Promise.all([getAllMemories(), getDiyas(), getAllGallery()]);
    setMemories(m);
    setDiyas(d);
    setGallery(g);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pending = memories.filter((m) => m.status === "pending");

  async function act(fn: () => Promise<void>) {
    await fn();
    await refresh();
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "pending", label: "Pending", count: pending.length },
    { id: "memories", label: "All memories", count: memories.length },
    { id: "gallery", label: "Gallery", count: gallery.length },
    { id: "diyas", label: "Diyas", count: diyas.length },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-maroon text-cream shadow-soft" : "bg-cream text-muted ring-1 ring-line hover:text-maroon",
            )}
          >
            {t.label}
            <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-muted">Loading…</p>
      ) : (
        <>
          {(tab === "pending" || tab === "memories") && (
            <MemoryList
              memories={tab === "pending" ? pending : memories}
              onApprove={(id) => act(() => updateMemoryStatus(id, "approved"))}
              onReject={(id) => act(() => updateMemoryStatus(id, "rejected"))}
              onDelete={(id) => act(() => deleteMemory(id))}
              onVisibility={(id, v) => act(() => setMemoryVisibility(id, v))}
              emptyText={tab === "pending" ? "Nothing waiting for approval. All caught up." : "No memories yet."}
            />
          )}

          {tab === "gallery" && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.length === 0 && <p className="col-span-full text-muted">No gallery photos yet.</p>}
              {gallery.map((g) => (
                <div key={g.id} className="overflow-hidden rounded-2xl bg-cream shadow-card ring-1 ring-line">
                  <div className="relative aspect-square bg-cream-deep">
                    <Image src={g.imageUrl} alt={g.caption} fill sizes="200px" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm text-ink">{g.caption}</p>
                    <p className="text-xs text-muted">{g.uploadedBy} · {g.category}</p>
                    <button
                      type="button"
                      onClick={() => act(() => deleteGalleryItem(g.id))}
                      className="mt-2 w-full rounded-full bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "diyas" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {diyas.length === 0 && <p className="col-span-full text-muted">No diyas lit yet.</p>}
              {diyas.map((d) => (
                <div key={d.id} className="rounded-2xl bg-cream p-4 shadow-card ring-1 ring-line">
                  <p className="font-medium text-ink">{d.name}</p>
                  <p className="text-sm text-ink/80">&ldquo;{d.message}&rdquo;</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(d.createdAt)}</p>
                  <button
                    type="button"
                    onClick={() => act(() => deleteDiya(d.id))}
                    className="mt-2 rounded-full bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/20"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  function MemoryList({
    memories,
    onApprove,
    onReject,
    onDelete,
    onVisibility,
    emptyText,
  }: {
    memories: Memory[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onDelete: (id: string) => void;
    onVisibility: (id: string, v: "public" | "private") => void;
    emptyText: string;
  }) {
    if (memories.length === 0) return <p className="py-12 text-center text-muted">{emptyText}</p>;
    return (
      <div className="space-y-4">
        {memories.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-4 rounded-2xl bg-cream p-5 shadow-card ring-1 ring-line sm:flex-row"
          >
            {m.imageUrl && (
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-cream-deep sm:w-40">
                <Image src={m.imageUrl} alt={m.title} fill sizes="160px" className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusStyle[m.status])}>
                  {m.status}
                </span>
                <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  {m.category}
                </span>
                <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-xs text-muted capitalize">
                  {m.visibility}
                </span>
              </div>
              <h3 className="mt-2 font-serif text-lg text-maroon">{m.title}</h3>
              <p className="text-xs text-muted">{m.name} · {m.relationship} · {formatDate(m.createdAt)}</p>
              <p className="mt-2 text-sm text-ink/80">{m.message}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {m.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => onApprove(m.id)}
                    className="rounded-full bg-forest px-4 py-1.5 text-xs font-medium text-cream hover:opacity-90"
                  >
                    Approve
                  </button>
                )}
                {m.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => onReject(m.id)}
                    className="rounded-full bg-gold/20 px-4 py-1.5 text-xs font-medium text-gold hover:bg-gold/30"
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onVisibility(m.id, m.visibility === "public" ? "private" : "public")}
                  className="rounded-full bg-cream-deep px-4 py-1.5 text-xs font-medium text-ink hover:bg-line"
                >
                  Make {m.visibility === "public" ? "private" : "public"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(m.id)}
                  className="rounded-full bg-maroon/10 px-4 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
