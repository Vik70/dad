"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Diya from "./Diya";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";

interface AdminLoginProps {
  firebaseReady: boolean;
  onDemoLogin: () => void;
}

export default function AdminLogin({ firebaseReady, onDemoLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Could not sign in with Google.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInWithEmail(email, password);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md rounded-3xl bg-cream p-8 text-center shadow-soft ring-1 ring-line"
    >
      <div className="mb-5 flex justify-center">
        <Diya size={56} />
      </div>
      <h1 className="font-serif text-3xl text-maroon">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in to review and approve what appears on the memorial.
      </p>

      {firebaseReady ? (
        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full rounded-full bg-maroon px-6 py-3 font-medium text-cream shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            Sign in with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3 text-left">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full border border-maroon/30 px-6 py-3 font-medium text-maroon transition-colors hover:bg-cream-deep disabled:opacity-60"
            >
              Sign in with email
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl bg-cream-deep/60 px-4 py-3 text-left text-xs text-muted">
            Firebase isn&apos;t configured yet, so the dashboard is running in
            demo mode with placeholder data. Add your Firebase keys and
            <code className="mx-1 rounded bg-cream px-1">ADMIN_EMAILS</code>
            to enable secure sign-in.
          </div>
          <button
            type="button"
            onClick={onDemoLogin}
            className="w-full rounded-full bg-maroon px-6 py-3 font-medium text-cream shadow-soft transition-transform hover:scale-[1.02]"
          >
            Enter demo dashboard
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-maroon">{error}</p>}
    </motion.div>
  );
}
