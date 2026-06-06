"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import DiyaForm from "@/components/DiyaForm";
import DiyaWall from "@/components/DiyaWall";
import { getDiyas } from "@/lib/firestore";
import type { Diya } from "@/lib/types";

export default function DiyaPage() {
  const [diyas, setDiyas] = useState<Diya[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiyas().then((d) => {
      setDiyas(d);
      setLoading(false);
    });
  }, []);

  function handleLit(diya: Diya) {
    setDiyas((prev) => [diya, ...prev]);
  }

  return (
    <div className="bg-warm-glow">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="Light a Diya"
          title="Light a diya for Rajesh"
          subtitle="Light a flame, leave a few words, and add your warmth to his wall of light."
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="font-serif text-5xl font-semibold text-maroon sm:text-6xl">
            {diyas.length}
          </p>
          <p className="mt-1 text-muted">
            {diyas.length === 1 ? "diya lit so far" : "diyas lit so far"}
          </p>
        </motion.div>

        <div className="mt-10">
          <DiyaForm onLit={handleLit} />
        </div>

        <div className="mt-16">
          {loading ? (
            <p className="py-10 text-center text-muted">Loading the wall of light…</p>
          ) : (
            <DiyaWall diyas={diyas} />
          )}
        </div>
      </section>
    </div>
  );
}
