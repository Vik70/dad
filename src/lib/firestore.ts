import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";
import {
  placeholderMemories,
  placeholderComments,
  placeholderDiyas,
  placeholderGallery,
  placeholderStory,
  placeholderSettings,
} from "./placeholder-data";
import type {
  Memory,
  Comment,
  Diya,
  GalleryItem,
  StoryChapter,
  SiteSettings,
  NewMemoryInput,
  NewDiyaInput,
  NewCommentInput,
  NewGalleryInput,
  NewStoryInput,
  Visibility,
  MemoryStatus,
} from "./types";

/**
 * When Firebase is not configured we keep mutable in-memory copies seeded from
 * the placeholder data, so actions taken during a session (lighting a diya,
 * submitting a memory, approving in admin) are reflected immediately.
 */
const localMemories: Memory[] = [...placeholderMemories];
const localComments: Comment[] = [...placeholderComments];
const localDiyas: Diya[] = [...placeholderDiyas];
const localGallery: GalleryItem[] = [...placeholderGallery];
const localStory: StoryChapter[] = [...placeholderStory];
let localSettings: SiteSettings = { ...placeholderSettings };

function newId() {
  return `local_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

/**
 * Runs a Firestore read and, if it fails (e.g. security rules not yet deployed,
 * a missing index, or the project being offline), logs a warning and returns a
 * safe fallback instead of leaving the UI stuck in a loading state.
 */
async function safeRead<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn("[firestore] read failed, using fallback:", err);
    return fallback;
  }
}

/* ----------------------------- Memories ------------------------------ */

export async function getApprovedMemories(): Promise<Memory[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return localMemories
      .filter((m) => m.status === "approved" && m.visibility === "public")
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  // Both equality filters so this exactly matches the public read security
  // rule (status == approved && visibility == public). Requires the composite
  // index shipped in firestore.indexes.json.
  const q = query(
    collection(db, "memories"),
    where("status", "==", "approved"),
    where("visibility", "==", "public"),
  );
  return safeRead(async () => {
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Memory, "id">), createdAt: toMillis(d.data().createdAt) }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, []);
}

export async function getAllMemories(): Promise<Memory[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return [...localMemories].sort((a, b) => b.createdAt - a.createdAt);
  }
  return safeRead(async () => {
    const snap = await getDocs(query(collection(db, "memories")));
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Memory, "id">), createdAt: toMillis(d.data().createdAt) }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, []);
}

export async function getPendingMemories(): Promise<Memory[]> {
  const all = await getAllMemories();
  return all.filter((m) => m.status === "pending");
}

export async function submitMemory(input: NewMemoryInput): Promise<Memory> {
  // When the admin has disabled approval, memories publish immediately.
  const settings = await getSettings();
  const status: MemoryStatus = settings.memoriesRequireApproval === false ? "approved" : "pending";
  const base: Omit<Memory, "id"> = {
    ...input,
    imageUrl: input.imageUrl ?? null,
    status,
    hearts: 0,
    rememberCount: 0,
    createdAt: Date.now(),
  };
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const memory: Memory = { id: newId(), ...base };
    localMemories.unshift(memory);
    return memory;
  }
  const ref = await addDoc(collection(db, "memories"), {
    ...base,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...base };
}

export async function updateMemoryStatus(id: string, status: MemoryStatus): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const m = localMemories.find((x) => x.id === id);
    if (m) m.status = status;
    return;
  }
  await updateDoc(doc(db, "memories", id), { status });
}

export async function setMemoryVisibility(id: string, visibility: Visibility): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const m = localMemories.find((x) => x.id === id);
    if (m) m.visibility = visibility;
    return;
  }
  await updateDoc(doc(db, "memories", id), { visibility });
}

export async function deleteMemory(id: string): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const idx = localMemories.findIndex((x) => x.id === id);
    if (idx >= 0) localMemories.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "memories", id));
}

export type MemoryEdit = Partial<
  Pick<Memory, "name" | "relationship" | "title" | "message" | "category" | "imageUrl" | "visibility">
>;

export async function editMemory(id: string, changes: MemoryEdit): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const m = localMemories.find((x) => x.id === id);
    if (m) Object.assign(m, changes);
    return;
  }
  await updateDoc(doc(db, "memories", id), changes);
}

export async function heartMemory(id: string): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const m = localMemories.find((x) => x.id === id);
    if (m) m.hearts += 1;
    return;
  }
  await updateDoc(doc(db, "memories", id), { hearts: increment(1) });
}

export async function incrementRemember(id: string): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const m = localMemories.find((x) => x.id === id);
    if (m) m.rememberCount += 1;
    return;
  }
  await updateDoc(doc(db, "memories", id), { rememberCount: increment(1) });
}

/* ------------------------------ Comments ----------------------------- */

export async function getComments(memoryId: string): Promise<Comment[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return localComments
      .filter((c) => c.memoryId === memoryId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  const q = query(collection(db, "comments"), where("memoryId", "==", memoryId));
  return safeRead(async () => {
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Comment, "id">), createdAt: toMillis(d.data().createdAt) }))
      .sort((a, b) => a.createdAt - b.createdAt);
  }, []);
}

export async function addComment(input: NewCommentInput): Promise<Comment> {
  const base: Omit<Comment, "id"> = { ...input, createdAt: Date.now() };
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const comment: Comment = { id: newId(), ...base };
    localComments.push(comment);
    return comment;
  }
  const ref = await addDoc(collection(db, "comments"), {
    ...base,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...base };
}

export async function getAllComments(): Promise<Comment[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return [...localComments].sort((a, b) => b.createdAt - a.createdAt);
  }
  return safeRead(async () => {
    const snap = await getDocs(query(collection(db, "comments")));
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Comment, "id">), createdAt: toMillis(d.data().createdAt) }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, []);
}

export async function deleteComment(id: string): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const idx = localComments.findIndex((x) => x.id === id);
    if (idx >= 0) localComments.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "comments", id));
}

/* -------------------------------- Diyas ------------------------------- */

export async function getDiyas(): Promise<Diya[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return [...localDiyas].sort((a, b) => b.createdAt - a.createdAt);
  }
  return safeRead(async () => {
    const snap = await getDocs(query(collection(db, "diyas"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Diya, "id">),
      createdAt: toMillis(d.data().createdAt),
    }));
  }, []);
}

export async function lightDiya(input: NewDiyaInput): Promise<Diya> {
  const base: Omit<Diya, "id"> = { ...input, createdAt: Date.now() };
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const diya: Diya = { id: newId(), ...base };
    localDiyas.unshift(diya);
    return diya;
  }
  const ref = await addDoc(collection(db, "diyas"), {
    ...base,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...base };
}

export async function deleteDiya(id: string): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const idx = localDiyas.findIndex((x) => x.id === id);
    if (idx >= 0) localDiyas.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "diyas", id));
}

/* ------------------------------- Gallery ------------------------------ */

export async function getGallery(): Promise<GalleryItem[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return localGallery
      .filter((g) => g.status === "approved")
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  const q = query(collection(db, "gallery"), where("status", "==", "approved"));
  return safeRead(async () => {
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, "id">), createdAt: toMillis(d.data().createdAt) }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, []);
}

export async function getAllGallery(): Promise<GalleryItem[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return [...localGallery].sort((a, b) => b.createdAt - a.createdAt);
  }
  return safeRead(async () => {
    const snap = await getDocs(query(collection(db, "gallery")));
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, "id">), createdAt: toMillis(d.data().createdAt) }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, []);
}

export async function addGalleryItem(input: NewGalleryInput): Promise<GalleryItem> {
  const base: Omit<GalleryItem, "id"> = {
    imageUrl: input.imageUrl,
    caption: input.caption,
    category: input.category,
    uploadedBy: input.uploadedBy,
    status: input.status ?? "approved",
    createdAt: Date.now(),
  };
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const item: GalleryItem = { id: newId(), ...base };
    localGallery.unshift(item);
    return item;
  }
  const ref = await addDoc(collection(db, "gallery"), {
    ...base,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...base };
}

export type GalleryEdit = Partial<Pick<GalleryItem, "caption" | "category" | "status">>;

export async function updateGalleryItem(id: string, changes: GalleryEdit): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const g = localGallery.find((x) => x.id === id);
    if (g) Object.assign(g, changes);
    return;
  }
  await updateDoc(doc(db, "gallery", id), changes);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const idx = localGallery.findIndex((x) => x.id === id);
    if (idx >= 0) localGallery.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "gallery", id));
}

/* -------------------------------- Story ------------------------------- */

export async function getStory(): Promise<StoryChapter[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return [...localStory].sort((a, b) => a.order - b.order);
  }
  return safeRead(async () => {
    const snap = await getDocs(query(collection(db, "story")));
    const chapters = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<StoryChapter, "id">),
      createdAt: toMillis(d.data().createdAt),
    }));
    return chapters.sort((a, b) => a.order - b.order);
  }, []);
}

export async function addStoryChapter(input: NewStoryInput): Promise<StoryChapter> {
  const base: Omit<StoryChapter, "id"> = {
    title: input.title,
    text: input.text,
    year: input.year ?? "",
    imageUrl: input.imageUrl ?? null,
    order: input.order,
    createdAt: Date.now(),
  };
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const chapter: StoryChapter = { id: newId(), ...base };
    localStory.push(chapter);
    return chapter;
  }
  const ref = await addDoc(collection(db, "story"), {
    ...base,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...base };
}

export type StoryEdit = Partial<Pick<StoryChapter, "title" | "text" | "year" | "imageUrl" | "order">>;

export async function updateStoryChapter(id: string, changes: StoryEdit): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const c = localStory.find((x) => x.id === id);
    if (c) Object.assign(c, changes);
    return;
  }
  await updateDoc(doc(db, "story", id), changes);
}

export async function deleteStoryChapter(id: string): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    const idx = localStory.findIndex((x) => x.id === id);
    if (idx >= 0) localStory.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "story", id));
}

/* ------------------------------ Settings ------------------------------ */

export async function getSettings(): Promise<SiteSettings> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return { ...localSettings };
  }
  return safeRead(async () => {
    const snap = await getDoc(doc(db, "settings", "site"));
    if (!snap.exists()) return { ...placeholderSettings };
    return { ...placeholderSettings, ...(snap.data() as Partial<SiteSettings>) };
  }, { ...placeholderSettings });
}

export async function updateSettings(changes: Partial<SiteSettings>): Promise<void> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    localSettings = { ...localSettings, ...changes };
    return;
  }
  await setDoc(doc(db, "settings", "site"), changes, { merge: true });
}

/* ------------------------------ Seeding ------------------------------- */

/**
 * Populates any empty collections with the warm starter content so a freshly
 * configured site looks complete. Safe to run multiple times — it only seeds
 * collections that are currently empty. Admin-only (writes require auth).
 */
export async function seedStarterContent(): Promise<{ seeded: string[] }> {
  const seeded: string[] = [];

  const [memories, gallery, story] = await Promise.all([
    getAllMemories(),
    getAllGallery(),
    getStory(),
  ]);

  if (memories.length === 0) {
    for (const m of placeholderMemories) {
      const memory = await submitMemory({
        name: m.name,
        relationship: m.relationship,
        title: m.title,
        message: m.message,
        category: m.category,
        imageUrl: m.imageUrl ?? null,
        visibility: m.visibility,
      });
      if (m.status !== "pending") await updateMemoryStatus(memory.id, m.status);
    }
    seeded.push("memories");
  }

  if (gallery.length === 0) {
    for (const g of placeholderGallery) {
      await addGalleryItem({
        imageUrl: g.imageUrl,
        caption: g.caption,
        category: g.category,
        uploadedBy: g.uploadedBy,
        status: "approved",
      });
    }
    seeded.push("gallery");
  }

  if (story.length === 0) {
    for (const s of placeholderStory) {
      await addStoryChapter({
        title: s.title,
        text: s.text,
        year: s.year,
        imageUrl: s.imageUrl ?? null,
        order: s.order,
      });
    }
    seeded.push("story");
  }

  await updateSettings({ ...placeholderSettings });
  seeded.push("settings");

  return { seeded };
}
