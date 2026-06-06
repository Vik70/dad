"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Diya } from "@/lib/types";
import DiyaComponent from "./Diya";
import { relativeTime } from "@/lib/utils";

interface DiyaWallProps {
  diyas: Diya[];
}

export default function DiyaWall({ diyas }: DiyaWallProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {diyas.map((diya, i) => (
          <motion.div
            key={diya.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.25) }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-cream to-cream-deep/70 p-6 text-center shadow-card ring-1 ring-gold/30"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 diya-glow"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 0%, rgba(255,196,87,0.35), transparent 70%)",
              }}
            />
            <div className="relative flex justify-center">
              <DiyaComponent size={44} />
            </div>
            <p className="relative mt-3 text-sm leading-relaxed text-ink/85">
              &ldquo;{diya.message}&rdquo;
            </p>
            <p className="relative mt-3 font-serif text-lg text-maroon">{diya.name}</p>
            <p className="relative text-xs text-muted">{relativeTime(diya.createdAt)}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
