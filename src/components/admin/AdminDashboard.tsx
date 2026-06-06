"use client";

import { useEffect, useState } from "react";
import { getPendingMemories } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import AdminMemories from "./AdminMemories";
import AdminGallery from "./AdminGallery";
import AdminComments from "./AdminComments";
import AdminDiyas from "./AdminDiyas";
import AdminStory from "./AdminStory";
import AdminSettings from "./AdminSettings";

type Tab = "pending" | "memories" | "gallery" | "comments" | "diyas" | "story" | "settings";

const tabs: { id: Tab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "memories", label: "Memories" },
  { id: "gallery", label: "Gallery" },
  { id: "comments", label: "Replies" },
  { id: "diyas", label: "Diyas" },
  { id: "story", label: "His Story" },
  { id: "settings", label: "Settings" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("pending");
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    getPendingMemories().then((p) => setPendingCount(p.length));
  }, [tab]);

  return (
    <div>
      <div className="scroll-touch -mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-full sm:flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id ? "bg-maroon text-cream shadow-soft" : "bg-cream text-muted ring-1 ring-line hover:text-maroon",
              )}
            >
              {t.label}
              {t.id === "pending" && pendingCount ? (
                <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs text-cream">{pendingCount}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {tab === "pending" && <AdminMemories pendingOnly />}
      {tab === "memories" && <AdminMemories />}
      {tab === "gallery" && <AdminGallery />}
      {tab === "comments" && <AdminComments />}
      {tab === "diyas" && <AdminDiyas />}
      {tab === "story" && <AdminStory />}
      {tab === "settings" && <AdminSettings />}
    </div>
  );
}
