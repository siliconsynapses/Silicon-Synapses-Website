"use client";

import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "./actions";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction} className={className}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 transition-colors hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </form>
  );
}
