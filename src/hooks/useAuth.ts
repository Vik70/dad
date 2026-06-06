"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/auth";

const DEMO_KEY = "rajeshs-light-demo-admin";

export interface AuthState {
  user: { email: string | null; displayName: string | null } | null;
  loading: boolean;
  isAdmin: boolean;
  firebaseReady: boolean;
  demoLogin: () => void;
  demoLogout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const stored =
        typeof window !== "undefined" && window.localStorage.getItem(DEMO_KEY) === "1";
      setDemo(stored);
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (fbUser: User | null) => {
      setUser(fbUser ? { email: fbUser.email, displayName: fbUser.displayName } : null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const demoLogin = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(DEMO_KEY, "1");
    setDemo(true);
  }, []);

  const demoLogout = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(DEMO_KEY);
    setDemo(false);
  }, []);

  const isAdmin = isFirebaseConfigured ? isAdminEmail(user?.email) : demo;

  return {
    user: isFirebaseConfigured ? user : demo ? { email: "demo@admin", displayName: "Demo Admin" } : null,
    loading,
    isAdmin,
    firebaseReady: isFirebaseConfigured,
    demoLogin,
    demoLogout,
  };
}
