export type MemoryStatus = "pending" | "approved" | "rejected";
export type Visibility = "public" | "private";

export const MEMORY_CATEGORIES = [
  "Funny",
  "Family",
  "Advice",
  "Childhood",
  "Work",
  "Holiday",
  "Kindness",
  "Other",
] as const;
export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

export const GALLERY_CATEGORIES = [
  "Family",
  "Friends",
  "Holidays",
  "Mum & Dad",
  "Vik & Dad",
  "Bhavik & Dad",
  "Old Photos",
  "Beach Day",
] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface Memory {
  id: string;
  name: string;
  relationship: string;
  title: string;
  message: string;
  category: MemoryCategory;
  imageUrl?: string | null;
  visibility: Visibility;
  status: MemoryStatus;
  hearts: number;
  rememberCount: number;
  createdAt: number; // epoch ms
}

export interface Comment {
  id: string;
  memoryId: string;
  name: string;
  message: string;
  createdAt: number;
}

export interface Diya {
  id: string;
  name: string;
  message: string;
  createdAt: number;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  category: GalleryCategory;
  uploadedBy: string;
  createdAt: number;
  status: MemoryStatus;
}

export interface StoryChapter {
  id: string;
  title: string;
  text: string;
  year?: string;
  imageUrl?: string | null;
  order: number;
  createdAt: number;
}

export interface SiteSettings {
  name: string;
  subtitle: string;
  intro: string;
  datesLabel: string;
  heroImageUrl?: string | null;
  storyIntro: string;
}

export type NewGalleryInput = {
  imageUrl: string;
  caption: string;
  category: GalleryCategory;
  uploadedBy: string;
  status?: MemoryStatus;
};

export type NewStoryInput = {
  title: string;
  text: string;
  year?: string;
  imageUrl?: string | null;
  order: number;
};

export type NewMemoryInput = {
  name: string;
  relationship: string;
  title: string;
  message: string;
  category: MemoryCategory;
  imageUrl?: string | null;
  visibility: Visibility;
};

export type NewDiyaInput = {
  name: string;
  message: string;
};

export type NewCommentInput = {
  memoryId: string;
  name: string;
  message: string;
};
