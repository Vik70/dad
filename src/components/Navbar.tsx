"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Diya from "./Diya";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/memories", label: "Memories" },
  { href: "/diya", label: "Light a Diya" },
  { href: "/share", label: "Share" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Diya size={28} />
          <span className="font-serif text-xl font-semibold text-maroon sm:text-2xl">
            Rajesh&apos;s Light
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    active ? "text-maroon" : "text-muted hover:text-ink",
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gold"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/share"
          className="hidden rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream shadow-soft transition-transform hover:scale-[1.03] md:inline-block"
        >
          Share a Memory
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-maroon md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="space-y-1.5">
            <span className={cn("block h-0.5 w-6 bg-maroon transition", open && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-6 bg-maroon transition", open && "opacity-0")} />
            <span className={cn("block h-0.5 w-6 bg-maroon transition", open && "-translate-y-2 -rotate-45")} />
          </div>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line/70 bg-cream md:hidden"
          >
            <ul className="flex flex-col px-4 py-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-3 py-3 text-base font-medium",
                      pathname === link.href ? "bg-cream-deep text-maroon" : "text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
