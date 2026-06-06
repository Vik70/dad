"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Diya from "./Diya";

interface HeroProps {
  title?: string;
  subtitle?: string;
  heroImageUrl?: string | null;
  datesLabel?: string;
}

export default function Hero({
  title = "Rajesh's Light",
  subtitle = "A place to remember, honour, and celebrate the life of Rajesh.",
  heroImageUrl = null,
  datesLabel = "1958 — 2025",
}: HeroProps) {
  return (
    <section className="bg-warm-glow relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:py-28">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center lg:justify-start"
          >
            <Diya size={64} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-serif text-[2.5rem] font-semibold leading-tight text-maroon sm:text-6xl lg:text-7xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link
              href="/share"
              className="w-full rounded-full bg-maroon px-7 py-3 text-center font-medium text-cream shadow-soft transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Share a Memory
            </Link>
            <Link
              href="/memories"
              className="w-full rounded-full border border-maroon/30 bg-cream px-7 py-3 text-center font-medium text-maroon transition-colors hover:bg-cream-deep sm:w-auto"
            >
              View Memories
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-photo-placeholder relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-soft ring-1 ring-line">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                <Diya size={56} />
                <p className="px-8 font-serif text-2xl text-maroon/80">
                  A favourite photo of Rajesh
                </p>
                <p className="text-xs uppercase tracking-widest text-muted">
                  Add a hero image from the admin dashboard
                </p>
              </div>
            )}
          </div>
          {datesLabel && (
            <div className="absolute -bottom-5 -left-3 rounded-2xl bg-cream px-4 py-3 shadow-card ring-1 ring-line sm:-left-5 sm:px-5 sm:py-4">
              <p className="font-serif text-base text-forest sm:text-lg">{datesLabel}</p>
              <p className="text-xs text-muted">Forever in our hearts</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
