"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import MemoryCard from "@/components/MemoryCard";
import { getApprovedMemories } from "@/lib/firestore";
import type { Memory } from "@/lib/types";

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedMemories().then((m) => {
      setMemories(m);
      setLoading(false);
    });
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle
        eyebrow="Memory Wall"
        title="Stories, photos, and love"
        subtitle="Memories shared by family and friends. Add a heart, reply, or share one of your own."
      />

      <div className="mt-8 text-center">
        <Link
          href="/share"
          className="inline-block rounded-full bg-maroon px-6 py-3 font-medium text-cream shadow-soft transition-transform hover:scale-[1.03]"
        >
          Share a Memory
        </Link>
      </div>

      <div className="mt-12">
        {loading ? (
          <p className="py-16 text-center text-muted">Loading memories…</p>
        ) : memories.length === 0 ? (
          <p className="py-16 text-center text-muted">
            No memories yet. Be the first to share one.
          </p>
        ) : (
          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memories.map((m, i) => (
              <MemoryCard key={m.id} memory={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
