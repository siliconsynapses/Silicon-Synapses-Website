"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ScanLine } from "lucide-react";
import { recordCheckIn } from "@/app/admin/(dashboard)/check-in/actions";

/**
 * Staff-only control shown on the pass page. When a signed-in STAFF member
 * opens an attendee's pass (e.g. by scanning its QR with a phone), they can
 * record the check-in in one tap. The action re-verifies STAFF authorization
 * server-side — this control is only UI, never the gate.
 */
export function StaffCheckIn({
  token,
  checkedIn,
}: {
  token: string;
  checkedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Once checked in, the pass renders its own check-in banner.
  if (checkedIn) return null;

  function handleClick() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await recordCheckIn(token);
      if (res.status === "error") {
        setError(res.message ?? "Check-in failed.");
        return;
      }
      setMessage(res.result?.alreadyCheckedIn ? "Already checked in." : "Checked in.");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/[0.06] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
        Staff check-in
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : message ? (
          <CheckCircle2 size={16} />
        ) : (
          <ScanLine size={16} />
        )}
        {message ?? "Check in this attendee"}
      </button>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
