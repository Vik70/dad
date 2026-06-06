"use client";

import { useEffect, useState, useCallback } from "react";
import SectionTitle from "@/components/SectionTitle";
import GalleryGrid from "@/components/GalleryGrid";
import GalleryUpload from "@/components/GalleryUpload";
import { getGallery } from "@/lib/firestore";
import type { GalleryItem } from "@/lib/types";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const g = await getGallery();
    setItems(g);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle
        eyebrow="Gallery"
        title="Photographs & memories"
        subtitle="A shared album of Rajesh. Add your own photos, and tap any picture to see it larger."
      />

      <div className="mt-10">
        <GalleryUpload onUploaded={refresh} />
      </div>

      <div className="mt-2">
        {loading ? (
          <p className="py-16 text-center text-muted">Loading photos…</p>
        ) : (
          <GalleryGrid items={items} />
        )}
      </div>
    </section>
  );
}
