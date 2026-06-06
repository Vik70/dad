"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getSettings, updateSettings, seedStarterContent } from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import { placeholderSettings } from "@/lib/placeholder-data";
import type { SiteSettings } from "@/lib/types";

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(placeholderSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const field = "w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-gold";

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function handleHero(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadImage(f, "hero");
      set("heroImageUrl", url);
      await updateSettings({ heroImageUrl: url });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings(settings);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleSeed() {
    if (!confirm("Add warm starter content to any empty sections (memories, gallery, story, settings)?")) return;
    setSeeding(true);
    setSeedMsg(null);
    try {
      const { seeded } = await seedStarterContent();
      setSeedMsg(seeded.length ? `Added starter content: ${seeded.join(", ")}.` : "Nothing to add — all sections already have content.");
    } catch {
      setSeedMsg("Could not add starter content. Make sure Firestore rules are deployed and you're signed in as an admin.");
    } finally {
      setSeeding(false);
    }
  }

  if (loading) return <p className="py-12 text-center text-muted">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-5 rounded-2xl bg-cream p-5 shadow-card ring-1 ring-line sm:p-6">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-cream-deep/60 p-4">
        <div>
          <p className="text-sm font-medium text-ink">Require approval for memories</p>
          <p className="mt-1 text-xs text-muted">
            {settings.memoriesRequireApproval
              ? "New memories wait in the Pending queue until you approve them."
              : "New memories appear on the wall immediately, without approval."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.memoriesRequireApproval}
          onClick={() => {
            const next = !settings.memoriesRequireApproval;
            set("memoriesRequireApproval", next);
            updateSettings({ memoriesRequireApproval: next });
          }}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            settings.memoriesRequireApproval ? "bg-forest" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-cream shadow transition-all ${
              settings.memoriesRequireApproval ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <div className="rounded-xl bg-cream-deep/60 p-4">
        <p className="text-sm font-medium text-ink">Starter content</p>
        <p className="mt-1 text-xs text-muted">
          New site? Populate empty sections with warm placeholder memories,
          photos, and story chapters you can then edit or delete.
        </p>
        <button
          type="button"
          onClick={handleSeed}
          disabled={seeding}
          className="mt-3 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:opacity-90 disabled:opacity-60"
        >
          {seeding ? "Adding…" : "Load starter content"}
        </button>
        {seedMsg && <p className="mt-2 text-xs text-forest">{seedMsg}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Hero photo</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="bg-photo-placeholder relative h-32 w-full overflow-hidden rounded-xl ring-1 ring-line sm:w-48">
            {settings.heroImageUrl && (
              <Image src={settings.heroImageUrl} alt="Hero" fill sizes="200px" className="object-cover" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-full bg-forest px-4 py-2 text-xs font-medium text-cream hover:opacity-90">
              {uploading ? "Uploading…" : "Upload hero photo"}
              <input type="file" accept="image/*" onChange={handleHero} className="hidden" />
            </label>
            {settings.heroImageUrl && (
              <button
                type="button"
                onClick={() => {
                  set("heroImageUrl", null);
                  updateSettings({ heroImageUrl: null });
                }}
                className="rounded-full bg-cream-deep px-4 py-2 text-xs font-medium text-ink hover:bg-line"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Memorial name (title)</label>
        <input value={settings.name} onChange={(e) => set("name", e.target.value)} className={field} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Subtitle</label>
        <input value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={field} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Dates label</label>
        <input value={settings.datesLabel} onChange={(e) => set("datesLabel", e.target.value)} className={field} placeholder="e.g. 1960 — 2026" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Homepage intro paragraph</label>
        <textarea value={settings.intro} onChange={(e) => set("intro", e.target.value)} rows={4} className={field} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Story page intro</label>
        <textarea value={settings.storyIntro} onChange={(e) => set("storyIntro", e.target.value)} rows={3} className={field} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-maroon px-6 py-3 text-sm font-medium text-cream shadow-soft hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-sm text-forest">Saved ✓</span>}
      </div>
    </div>
  );
}
