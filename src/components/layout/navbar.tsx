"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      {/* [ASSET REQUIRED] logo placeholder — replaced with the provided logo */}
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-linear-to-br from-accent to-accent-3 text-sm font-bold text-ink shadow-[0_0_20px_-4px_rgba(34,211,238,0.7)]">
        SS
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-white">
        Silicon <span className="text-accent">Synapses</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Wordmark />

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-white/5 text-white"
                  : "text-slate-400 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex">
          <ButtonLink href="/admin" variant="ghost" size="sm">
            Admin
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-200 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 lg:hidden"
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative mx-4 mt-3 rounded-2xl border border-white/10 bg-surface/95 p-3 shadow-2xl"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-sm",
                    isActive(item.href)
                      ? "bg-white/5 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <ButtonLink
                href="/admin"
                variant="secondary"
                size="sm"
                className="mt-2 w-full"
              >
                Admin Login
              </ButtonLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
