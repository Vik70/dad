import {
  collection,
  addDoc,
  getDocs,
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
} from "./placeholder-data";
import type {
  Memory,
  Comment,
  Diya,
  GalleryItem,
  NewMemoryInput,
  NewDiyaInput,
  NewCommentInput,
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

function newId() {
  return `local_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

/* ----------------------------- Memories ------------------------------ */

export async function getApprovedMemories(): Promise<Memory[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return localMemories
      .filter((m) => m.status === "approved" && m.visibility === "public")
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  const q = query(
    collection(db, "memories"),
    where("status", "==", "approved"),
    where("visibility", "==", "public"),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Memory, "id">), createdAt: toMillis(d.data().createdAt) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllMemories(): Promise<Memory[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return [...localMemories].sort((a, b) => b.createdAt - a.createdAt);
  }
  const snap = await getDocs(query(collection(db, "memories")));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Memory, "id">), createdAt: toMillis(d.data().createdAt) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getPendingMemories(): Promise<Memory[]> {
  const all = await getAllMemories();
  return all.filter((m) => m.status === "pending");
}

export async function submitMemory(input: NewMemoryInput): Promise<Memory> {
  const base: Omit<Memory, "id"> = {
    ...input,
    imageUrl: input.imageUrl ?? null,
    status: "pending",
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
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Comment, "id">), createdAt: toMillis(d.data().createdAt) }))
    .sort((a, b) => a.createdAt - b.createdAt);
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

/* -------------------------------- Diyas ------------------------------- */

export async function getDiyas(): Promise<Diya[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return [...localDiyas].sort((a, b) => b.createdAt - a.createdAt);
  }
  const snap = await getDocs(query(collection(db, "diyas"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Diya, "id">),
    createdAt: toMillis(d.data().createdAt),
  }));
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
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, "id">), createdAt: toMillis(d.data().createdAt) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllGallery(): Promise<GalleryItem[]> {
  const db = getDb();
  if (!isFirebaseConfigured || !db) {
    return [...localGallery].sort((a, b) => b.createdAt - a.createdAt);
  }
  const snap = await getDocs(query(collection(db, "gallery")));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, "id">), createdAt: toMillis(d.data().createdAt) }))
    .sort((a, b) => b.createdAt - a.createdAt);
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
