"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Diya from "./Diya";
import type { StoryChapter } from "@/lib/types";

interface TimelineProps {
  chapters: StoryChapter[];
}

export default function Timeline({ chapters }: TimelineProps) {
  if (chapters.length === 0) {
    return <p className="py-12 text-center text-muted">No chapters yet.</p>;
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* vertical rail */}
      <div className="absolute left-4 top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-gold/70 via-line to-transparent sm:left-5" />

      <div className="space-y-8 sm:space-y-10">
        {chapters.map((chapter) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative pl-12 sm:pl-16"
          >
            {/* node */}
            <span className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-cream ring-2 ring-gold sm:left-1">
              <Diya size={18} animate={false} />
            </span>

            <div className="rounded-2xl bg-cream p-5 shadow-card ring-1 ring-line sm:p-6">
              {chapter.year && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  {chapter.year}
                </p>
              )}
              <h3 className="font-serif text-xl text-maroon sm:text-2xl">{chapter.title}</h3>

              {chapter.imageUrl && (
                <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-cream-deep ring-1 ring-line">
                  <Image
                    src={chapter.imageUrl}
                    alt={chapter.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
              )}

              <p className="mt-3 text-sm leading-relaxed text-ink/80 sm:text-base">{chapter.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
