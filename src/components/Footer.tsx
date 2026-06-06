import Link from "next/link";
import Diya from "./Diya";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-cream-deep/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Diya size={36} />
          <p className="font-serif text-2xl text-maroon">Rajesh&apos;s Light</p>
          <p className="max-w-md text-sm text-muted">
            A place for stories, photos, and love. Keeping his light alive,
            together.
          </p>
          <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <Link href="/story" className="hover:text-maroon">Story</Link>
            <Link href="/gallery" className="hover:text-maroon">Gallery</Link>
            <Link href="/memories" className="hover:text-maroon">Memories</Link>
            <Link href="/diya" className="hover:text-maroon">Light a Diya</Link>
            <Link href="/share" className="hover:text-maroon">Share</Link>
            <Link href="/admin" className="hover:text-maroon">Admin</Link>
          </nav>
          <p className="mt-4 text-xs text-muted/80">
            Made with love by his family · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
