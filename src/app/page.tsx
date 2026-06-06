"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import SectionTitle from "@/components/SectionTitle";
import MemoryCard from "@/components/MemoryCard";
import Diya from "@/components/Diya";
import { getApprovedMemories, getGallery, getDiyas, getSettings } from "@/lib/firestore";
import { placeholderSettings } from "@/lib/placeholder-data";
import type { Memory, GalleryItem, SiteSettings } from "@/lib/types";

export default function HomePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [diyaCount, setDiyaCount] = useState(0);
  const [settings, setSettings] = useState<SiteSettings>(placeholderSettings);

  useEffect(() => {
    getApprovedMemories().then((m) => setMemories(m.slice(0, 3)));
    getGallery().then((g) => setGallery(g.slice(0, 6)));
    getDiyas().then((d) => setDiyaCount(d.length));
    getSettings().then(setSettings);
  }, []);

  return (
    <>
      <Hero
        title={settings.name}
        subtitle={settings.subtitle}
        heroImageUrl={settings.heroImageUrl}
        datesLabel={settings.datesLabel}
      />

      {/* A life surrounded by love */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <SectionTitle eyebrow="In loving memory" title="A life surrounded by love" />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-lg leading-relaxed text-ink/80"
        >
          {settings.intro}
        </motion.p>
      </section>

      {/* Recent memories */}
      <section className="bg-cream-deep/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle
            eyebrow="Memory Wall"
            title="Recent memories"
            subtitle="Stories and moments shared by the people who loved him."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memories.length === 0 ? (
              <p className="col-span-full text-center text-muted">
                Be the first to share a memory.
              </p>
            ) : (
              memories.map((m, i) => <MemoryCard key={m.id} memory={m} index={i} />)
            )}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/memories"
              className="inline-block rounded-full border border-maroon/30 px-6 py-3 font-medium text-maroon transition-colors hover:bg-cream"
            >
              View all memories
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="Gallery"
          title="Moments captured"
          subtitle="A growing collection of photographs from a life well lived."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {gallery.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3) }}
              className="relative aspect-square overflow-hidden rounded-2xl bg-cream-deep ring-1 ring-line"
            >
              <Image
                src={g.imageUrl}
                alt={g.caption}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/gallery"
            className="inline-block rounded-full border border-maroon/30 px-6 py-3 font-medium text-maroon transition-colors hover:bg-cream-deep"
          >
            Explore the gallery
          </Link>
        </div>
      </section>

      {/* Diya count */}
      <section className="bg-warm-glow py-16 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6">
          <Diya size={72} />
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-6 font-serif text-6xl font-semibold text-maroon sm:text-7xl"
          >
            {diyaCount}
          </motion.p>
          <p className="mt-2 text-lg text-muted">
            {diyaCount === 1 ? "diya has" : "diyas have"} been lit in his memory
          </p>
          <p className="mt-4 max-w-md leading-relaxed text-ink/70">
            Keeping his light alive, one flame at a time.
          </p>
          <Link
            href="/diya"
            className="mt-8 rounded-full bg-gradient-to-r from-maroon to-gold px-7 py-3 font-medium text-cream shadow-soft transition-transform hover:scale-[1.03]"
          >
            Light a Diya
          </Link>
        </div>
      </section>
    </>
  );
}
