"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import GalleryGrid from "@/components/GalleryGrid";
import { getGallery } from "@/lib/firestore";
import type { GalleryItem } from "@/lib/types";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallery().then((g) => {
      setItems(g);
      setLoading(false);
    });
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle
        eyebrow="Gallery"
        title="Photographs & memories"
        subtitle="Tap any photo to see it larger, along with who shared it and when."
      />
      <div className="mt-12">
        {loading ? (
          <p className="py-16 text-center text-muted">Loading photos…</p>
        ) : (
          <GalleryGrid items={items} />
        )}
      </div>
    </section>
  );
}
