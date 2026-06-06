"use client";

import { useEffect, useState, useCallback } from "react";
import { getDiyas, deleteDiya } from "@/lib/firestore";
import type { Diya } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminDiyas() {
  const [diyas, setDiyas] = useState<Diya[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setDiyas(await getDiyas());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) return <p className="py-12 text-center text-muted">Loading…</p>;
  if (diyas.length === 0)
    return <p className="py-12 text-center text-muted">No diyas lit yet.</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {diyas.map((d) => (
        <div key={d.id} className="rounded-2xl bg-cream p-4 shadow-card ring-1 ring-line">
          <p className="font-medium text-ink">{d.name}</p>
          <p className="break-words text-sm text-ink/80">&ldquo;{d.message}&rdquo;</p>
          <p className="mt-1 text-xs text-muted">{formatDate(d.createdAt)}</p>
          <button
            type="button"
            onClick={async () => {
              if (confirm("Delete this diya?")) {
                await deleteDiya(d.id);
                await refresh();
              }
            }}
            className="mt-2 rounded-full bg-maroon/10 px-4 py-2 text-xs font-medium text-maroon hover:bg-maroon/20"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
