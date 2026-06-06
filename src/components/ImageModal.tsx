"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback } from "react";
import type { GalleryItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ImageModalProps {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageModal({ items, index, onClose, onNavigate }: ImageModalProps) {
  const open = index !== null;
  const item = open ? items[index] : null;
  const hasMany = items.length > 1;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, goPrev, goNext]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-maroon-deep/80 p-4 backdrop-blur-sm sm:p-6"
        >
          {hasMany && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-xl text-maroon shadow-card transition-transform hover:scale-105 sm:left-5"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-xl text-maroon shadow-card transition-transform hover:scale-105 sm:right-5"
              >
                ›
              </button>
            </>
          )}

          <motion.div
            key={item.id}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.25 }}
            drag={hasMany ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) goNext();
              else if (info.offset.x > 80) goPrev();
            }}
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

            <div className="relative flex max-h-[68vh] w-full items-center justify-center bg-cream-deep">
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.imageUrl}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex max-h-[68vh] w-full items-center justify-center"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.caption}
                    width={1200}
                    height={900}
                    className="max-h-[68vh] w-full select-none object-contain"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="font-serif text-lg text-maroon sm:text-xl">
                  {item.caption || "A cherished photo"}
                </p>
                {hasMany && (
                  <span className="shrink-0 rounded-full bg-cream-deep px-3 py-1 text-xs text-muted">
                    {index! + 1} / {items.length}
                  </span>
                )}
              </div>
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
