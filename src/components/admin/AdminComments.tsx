"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllComments, getAllMemories, deleteComment } from "@/lib/firestore";
import type { Comment, Memory } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [c, m] = await Promise.all([getAllComments(), getAllMemories()]);
    setComments(c);
    setMemories(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function memoryTitle(id: string) {
    return memories.find((m) => m.id === id)?.title ?? "a memory";
  }

  if (loading) return <p className="py-12 text-center text-muted">Loading…</p>;
  if (comments.length === 0)
    return <p className="py-12 text-center text-muted">No replies yet.</p>;

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start justify-between gap-4 rounded-2xl bg-cream p-4 shadow-card ring-1 ring-line">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{c.name}</p>
            <p className="break-words text-sm text-ink/80">{c.message}</p>
            <p className="mt-1 text-xs text-muted">
              On &ldquo;{memoryTitle(c.memoryId)}&rdquo; · {formatDate(c.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (confirm("Delete this reply?")) {
                await deleteComment(c.id);
                await refresh();
              }
            }}
            className="shrink-0 rounded-full bg-maroon/10 px-4 py-2 text-xs font-medium text-maroon hover:bg-maroon/20"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
