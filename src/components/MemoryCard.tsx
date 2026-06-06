"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Memory, Comment } from "@/lib/types";
import { heartMemory, incrementRemember, getComments, addComment } from "@/lib/firestore";
import { formatDate } from "@/lib/utils";

interface MemoryCardProps {
  memory: Memory;
  index?: number;
}

export default function MemoryCard({ memory, index = 0 }: MemoryCardProps) {
  const [hearts, setHearts] = useState(memory.hearts);
  const [hearted, setHearted] = useState(false);
  const [remembers, setRemembers] = useState(memory.rememberCount);
  const [remembered, setRemembered] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadedComments, setLoadedComments] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleHeart() {
    if (hearted) return;
    setHearted(true);
    setHearts((h) => h + 1);
    try {
      await heartMemory(memory.id);
    } catch {
      /* optimistic; ignore failures in demo mode */
    }
  }

  async function handleRemember() {
    if (remembered) return;
    setRemembered(true);
    setRemembers((r) => r + 1);
    try {
      await incrementRemember(memory.id);
    } catch {
      /* ignore */
    }
  }

  async function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && !loadedComments) {
      const list = await getComments(memory.id);
      setComments(list);
      setLoadedComments(true);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setPosting(true);
    try {
      const c = await addComment({ memoryId: memory.id, name: name.trim(), message: message.trim() });
      setComments((prev) => [...prev, c]);
      setName("");
      setMessage("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="flex flex-col overflow-hidden rounded-2xl bg-cream shadow-card ring-1 ring-line"
    >
      {memory.imageUrl && (
        <div className="relative aspect-[16/10] w-full bg-cream-deep">
          <Image
            src={memory.imageUrl}
            alt={memory.title || `A memory shared by ${memory.name || "a loved one"}`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-ink">{memory.name || "Anonymous"}</p>
            {memory.relationship && <p className="text-xs text-muted">{memory.relationship}</p>}
          </div>
          <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
            {memory.category}
          </span>
        </div>

        {memory.title && <h3 className="font-serif text-xl text-maroon">{memory.title}</h3>}
        {memory.message && (
          <p className={`text-sm leading-relaxed text-ink/80 ${memory.title ? "mt-2" : ""}`}>{memory.message}</p>
        )}
        {/* keep the card body filling height even with no text */}
        <div className="flex-1" />

        <p className="mt-4 text-xs text-muted">{formatDate(memory.createdAt)}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={handleHeart}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              hearted ? "bg-maroon/10 text-maroon" : "text-muted hover:bg-cream-deep"
            }`}
          >
            <span>{hearted ? "❤️" : "🤍"}</span>
            {hearts}
          </button>

          <button
            type="button"
            onClick={handleRemember}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              remembered ? "bg-gold/15 text-gold" : "text-muted hover:bg-cream-deep"
            }`}
          >
            <span>✨</span>
            I remember this too{remembers > 0 ? ` · ${remembers}` : ""}
          </button>

          <button
            type="button"
            onClick={toggleComments}
            className="ml-auto rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-cream-deep"
          >
            {showComments ? "Hide replies" : "Reply"}
          </button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                {comments.length === 0 && (
                  <p className="text-xs text-muted">Be the first to reply with a memory of your own.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl bg-cream-deep/60 px-4 py-3">
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="text-sm text-ink/80">{c.message}</p>
                  </div>
                ))}

                <form onSubmit={handleAddComment} className="space-y-2 pt-1">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a reply…"
                    rows={2}
                    className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    disabled={posting}
                    className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition-transform hover:scale-[1.03] disabled:opacity-60"
                  >
                    {posting ? "Posting…" : "Post reply"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
