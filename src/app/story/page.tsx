"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import Timeline from "@/components/Timeline";
import { getStory, getSettings } from "@/lib/firestore";
import { placeholderSettings } from "@/lib/placeholder-data";
import type { StoryChapter, SiteSettings } from "@/lib/types";

export default function StoryPage() {
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(placeholderSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStory().then((c) => {
      setChapters(c);
      setLoading(false);
    });
    getSettings().then(setSettings);
  }, []);

  return (
    <div className="bg-warm-glow">
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="His Story"
          title="The life of Rajesh"
          subtitle={settings.storyIntro}
        />
        <div className="mt-12 sm:mt-14">
          {loading ? (
            <p className="py-12 text-center text-muted">Loading his story…</p>
          ) : (
            <Timeline chapters={chapters} />
          )}
        </div>
      </section>
    </div>
  );
}
