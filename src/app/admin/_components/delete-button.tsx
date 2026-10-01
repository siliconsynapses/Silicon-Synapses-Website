"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/state";

/**
 * Confirm-then-delete control. Takes a server action already bound to the
 * target id (e.g. `deleteEvent.bind(null, id)`). Authorization is enforced
 * inside that action — this button is only UI.
 */
export function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Delete this item? This cannot be undone.",
  variant = "button",
  onDeleted,
}: {
  action: () => Promise<ActionState>;
  label?: string;
  confirmMessage?: string;
  variant?: "button" | "icon";
  onDeleted?: string; // path to refresh/redirect to
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.status === "error") {
        setError(result.message ?? "Could not delete.");
        return;
      }
      if (onDeleted) router.push(onDeleted);
      router.refresh();
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={label}
        title={error ?? label}
        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Trash2 size={15} />
        )}
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-5 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
        {label}
      </button>
      {error ? <span className="mt-1.5 text-xs text-rose-300">{error}</span> : null}
    </span>
  );
}
