"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, Loader2, RotateCcw, Undo2 } from "lucide-react";
import type { RegistrationStatus } from "@prisma/client";
import type { ActionState } from "@/lib/actions/state";
import { setRegistrationCheckIn, setRegistrationStatus } from "../actions";

/**
 * Per-row registration controls (check-in toggle + cancel/reinstate).
 * Authorization is enforced inside the bound server actions — these buttons are
 * only UI. Errors are surfaced inline.
 */
export function RegistrationActions({
  id,
  checkedIn,
  status,
}: {
  id: string;
  checkedIn: boolean;
  status: RegistrationStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cancelled = status === "CANCELLED";

  function run(fn: () => Promise<ActionState>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.status === "error") {
        setError(result.message ?? "Action failed.");
        return;
      }
      router.refresh();
    });
  }

  const btn =
    "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}

      {!cancelled ? (
        <button
          type="button"
          onClick={() => run(() => setRegistrationCheckIn(id, !checkedIn))}
          disabled={pending}
          className={
            checkedIn
              ? `${btn} border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]`
              : `${btn} border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20`
          }
        >
          {pending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : checkedIn ? (
            <Undo2 size={13} />
          ) : (
            <Check size={13} />
          )}
          {checkedIn ? "Undo check-in" : "Check in"}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() =>
          run(() =>
            setRegistrationStatus(id, cancelled ? "CONFIRMED" : "CANCELLED"),
          )
        }
        disabled={pending}
        className={
          cancelled
            ? `${btn} border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]`
            : `${btn} border-rose-400/30 text-rose-300 hover:bg-rose-500/10`
        }
      >
        {pending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : cancelled ? (
          <RotateCcw size={13} />
        ) : (
          <Ban size={13} />
        )}
        {cancelled ? "Reinstate" : "Cancel"}
      </button>
    </div>
  );
}
