"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import type { GalleryItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ImageModalProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export default function ImageModal({ item, onClose }: ImageModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (item) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-maroon-deep/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-cream shadow-soft"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-maroon shadow-card"
            >
              ✕
            </button>
            <div className="relative max-h-[70vh] w-full bg-cream-deep">
              <Image
                src={item.imageUrl}
                alt={item.caption}
                width={1200}
                height={900}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
            <div className="p-6">
              <p className="font-serif text-xl text-maroon">{item.caption}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span>Shared by {item.uploadedBy}</span>
                <span className="hidden sm:inline">·</span>
                <span>{formatDate(item.createdAt)}</span>
                <span className="rounded-full bg-forest/10 px-3 py-0.5 text-xs font-medium text-forest">
                  {item.category}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
