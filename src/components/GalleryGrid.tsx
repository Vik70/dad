"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GALLERY_CATEGORIES, type GalleryItem, type GalleryCategory } from "@/lib/types";
import ImageModal from "./ImageModal";
import { cn } from "@/lib/utils";

interface GalleryGridProps {
  items: GalleryItem[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [filter, setFilter] = useState<GalleryCategory | "All">("All");
  const [active, setActive] = useState<GalleryItem | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {(["All", ...GALLERY_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === c
                ? "bg-maroon text-cream shadow-soft"
                : "bg-cream text-muted ring-1 ring-line hover:text-maroon",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted">No photos in this category yet.</p>
      ) : (
        <div className="masonry columns-1 sm:columns-2 lg:columns-3">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.3) }}
              className="group block w-full overflow-hidden rounded-2xl bg-cream-deep text-left shadow-card ring-1 ring-line"
            >
              <div className="relative">
                <Image
                  src={item.imageUrl}
                  alt={item.caption}
                  width={800}
                  height={1000}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon-deep/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-sm font-medium text-cream">{item.caption}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <ImageModal item={active} onClose={() => setActive(null)} />
    </div>
  );
}
