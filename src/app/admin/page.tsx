"use client";

import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "@/components/AdminLogin";
import AdminMemoryTable from "@/components/AdminMemoryTable";
import { signOutAdmin } from "@/lib/auth";

export default function AdminPage() {
  const { user, loading, isAdmin, firebaseReady, demoLogin, demoLogout } = useAuth();

  async function handleSignOut() {
    if (firebaseReady) await signOutAdmin();
    else demoLogout();
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-warm-glow">
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          {user && firebaseReady ? (
            <div className="mx-auto max-w-md rounded-3xl bg-cream p-8 text-center shadow-soft ring-1 ring-line">
              <h1 className="font-serif text-2xl text-maroon">Not authorised</h1>
              <p className="mt-2 text-sm text-muted">
                The account <strong>{user.email}</strong> isn&apos;t on the admin
                list. Ask to be added to <code>ADMIN_EMAILS</code>.
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-6 rounded-full border border-maroon/30 px-6 py-2.5 text-sm font-medium text-maroon hover:bg-cream-deep"
              >
                Sign out
              </button>
            </div>
          ) : (
            <AdminLogin firebaseReady={firebaseReady} onDemoLogin={demoLogin} />
          )}
        </section>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Admin</p>
          <h1 className="font-serif text-3xl text-maroon sm:text-4xl">Moderation dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Review memories before they appear publicly, and manage photos and diyas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.email && <span className="text-sm text-muted">{user.email}</span>}
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-maroon/30 px-4 py-2 text-sm font-medium text-maroon hover:bg-cream-deep"
          >
            Sign out
          </button>
        </div>
      </div>

      <AdminMemoryTable />
    </section>
  );
}
