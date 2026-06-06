"use client";

import { motion } from "framer-motion";
import Diya from "./Diya";

export interface TimelineChapter {
  title: string;
  text: string;
  year?: string;
  hasImage?: boolean;
}

interface TimelineProps {
  chapters: TimelineChapter[];
}

export default function Timeline({ chapters }: TimelineProps) {
  return (
    <div className="relative mx-auto max-w-3xl">
      {/* vertical rail */}
      <div className="absolute left-4 top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-gold/70 via-line to-transparent sm:left-5" />

      <div className="space-y-10">
        {chapters.map((chapter) => (
          <motion.div
            key={chapter.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative pl-14 sm:pl-16"
          >
            {/* node */}
            <span className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-cream ring-2 ring-gold sm:left-1">
              <Diya size={18} animate={false} />
            </span>

            <div className="rounded-2xl bg-cream p-6 shadow-card ring-1 ring-line">
              {chapter.year && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  {chapter.year}
                </p>
              )}
              <h3 className="font-serif text-2xl text-maroon">{chapter.title}</h3>

              {chapter.hasImage && (
                <div className="bg-photo-placeholder mt-4 flex aspect-[16/9] w-full items-center justify-center rounded-xl ring-1 ring-line">
                  <p className="text-xs uppercase tracking-widest text-muted">Add a photo</p>
                </div>
              )}

              <p className="mt-3 text-sm leading-relaxed text-ink/80">{chapter.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
