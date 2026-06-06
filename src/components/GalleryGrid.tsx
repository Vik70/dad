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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  // Only show category chips that actually have photos, plus a count.
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) map.set(i.category, (map.get(i.category) ?? 0) + 1);
    return map;
  }, [items]);

  return (
    <div>
      <div className="scroll-touch -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        <FilterChip label="All" count={items.length} active={filter === "All"} onClick={() => setFilter("All")} />
        {GALLERY_CATEGORIES.filter((c) => counts.get(c)).map((c) => (
          <FilterChip
            key={c}
            label={c}
            count={counts.get(c) ?? 0}
            active={filter === c}
            onClick={() => setFilter(c)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted">No photos in this category yet.</p>
      ) : (
        <div className="masonry columns-2 sm:columns-2 lg:columns-3">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.3) }}
              className="group relative block w-full overflow-hidden rounded-2xl bg-cream-deep text-left shadow-card ring-1 ring-line"
            >
              <Image
                src={item.imageUrl}
                alt={item.caption}
                width={800}
                height={1000}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon-deep/70 via-maroon-deep/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-sm font-medium text-cream">{item.caption}</p>
                <p className="text-xs text-cream/70">{item.category}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <ImageModal
        items={filtered}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-maroon text-cream shadow-soft" : "bg-cream text-muted ring-1 ring-line hover:text-maroon",
      )}
    >
      {label}
      <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-cream/20" : "bg-cream-deep")}>{count}</span>
    </button>
  );
}
