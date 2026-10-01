"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/logo";
import { AdminNavIcon } from "./nav-icon";
import { SignOutButton } from "./sign-out-button";
import type { AdminNavItem } from "../_nav";

/**
 * Admin sidebar. Receives the already-filtered nav (server decided which items
 * this user's role may see); this component only handles presentation and the
 * active-route highlight. Access itself is enforced server-side per page.
 */
export function AdminSidebar({
  items,
  user,
}: {
  items: AdminNavItem[];
  user: { name?: string | null; email?: string | null; role: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            isActive(item.href)
              ? "bg-accent/10 text-accent"
              : "text-slate-400 hover:bg-white/5 hover:text-white",
          )}
        >
          <AdminNavIcon name={item.icon} />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
        <p className="truncate text-sm font-medium text-white">
          {user.name || "Admin"}
        </p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
        <span className="mt-1.5 inline-block rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
          {user.role.replace("_", " ")}
        </span>
      </div>
      <SignOutButton className="mt-2" />
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-surface/80 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" aria-label="Admin home">
          <BrandLogo size={30} />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-200"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 top-[57px] z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-72 max-w-[80%] flex-col bg-surface">
            {nav}
            {footer}
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-surface/60 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link href="/admin" aria-label="Admin home">
            <BrandLogo size={32} />
          </Link>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
