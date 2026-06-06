import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

function getAdminEmails(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  // When no admin emails are configured (placeholder/demo mode) we allow access
  // so the owner can preview the dashboard. Lock this down by setting
  // ADMIN_EMAILS once Firebase is configured.
  if (admins.length === 0) return true;
  return admins.includes(email.toLowerCase());
}

export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase is not configured.");
  }
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase is not configured.");
  }
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await fbSignOut(auth);
}
