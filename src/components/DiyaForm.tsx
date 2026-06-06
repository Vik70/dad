"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Diya } from "@/lib/types";
import { lightDiya } from "@/lib/firestore";

interface DiyaFormProps {
  onLit: (diya: Diya) => void;
}

export default function DiyaForm({ onLit }: DiyaFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [lighting, setLighting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLighting(true);
    try {
      const diya = await lightDiya({
        name: name.trim(),
        message: message.trim() || "In loving memory",
      });
      onLit(diya);
      setName("");
      setMessage("");
    } finally {
      setLighting(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-gold";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-3xl bg-cream p-6 shadow-soft ring-1 ring-line sm:p-8"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} placeholder="e.g. Vik" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">A short message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className={fieldClass}
          placeholder="A few words for Rajesh…"
        />
      </div>
      <motion.button
        type="submit"
        disabled={lighting}
        whileTap={{ scale: 0.97 }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-maroon to-gold px-6 py-3.5 font-medium text-cream shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {lighting ? "Lighting…" : "🪔 Light a Diya"}
      </motion.button>
    </form>
  );
}
